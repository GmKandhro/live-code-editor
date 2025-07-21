import { useState, useEffect, useCallback, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useSocket } from '../hooks/useSocket';
import { loadPyodide } from 'pyodide';
import Cookies from 'js-cookie';


export default function CodeEditor({ roomId, initialCode, initialLanguage, userId, username }) {
    const [code, setCode] = useState(initialCode);
    const [language, setLanguage] = useState(initialLanguage);
    const [typingUsers, setTypingUsers] = useState(null);
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [pyodide, setPyodide] = useState(null);
    const [availableUsers, setAvailableUsers] = useState([]);

    // 👇 Store typing timeouts for auto-remove
    // const typingTimeouts = useRef({});

    const isMounted = useRef(true);

    const { emitCodeUpdate, emitTyping, emitStopTyping, emitChatMessage } = useSocket(roomId, {
        onInitialCode: ({ code, language }) => {
            setCode(code);
            setLanguage(language);
            console.log('Initial code received:', code);
        },
        onCodeUpdate: ({ code, language }) => {
            setCode(code);
            setLanguage(language);
            console.log('Code updated from socket:', code);
        },
        onUserUpdate: ({ users }) => {
            // Filter out the current user and ensure unique users
            const uniqueUsers = users
                .filter(user => user.userId !== userId)
                .filter((user, index, self) =>
                    index === self.findIndex((u) => u.userId === user.userId)
                );
            setAvailableUsers(uniqueUsers);
            console.log('Updated available users:', uniqueUsers);
        },
        onRoomDeleted: () => {
            window.location.href = '/dashboard';
        },

        onTyping: ({ userId: typingUserId, username: typingUsername }) => {
            if (typingUserId !== userId) {
                setTypingUsers({ userId: typingUserId, username: typingUsername });
            }
        },
        onStopTyping: ({ userId: typingUserId }) => {
            setTypingUsers(prev => prev?.userId === typingUserId ? null : prev);
        },
        onChatMessage: ({ username: sender, message }) => {
            setMessages((prev) => [...prev, { username: sender, message, timestamp: new Date().toLocaleTimeString() }]);
        },

        onError: (err) => {
            console.error('Socket error:', err);
        },
    });

    useEffect(() => {
        const loadPyodideFromCDN = async () => {
            try {
                console.log('Attempting to load Pyodide from:', 'https://cdn.jsdelivr.net/pyodide/v0.28.0/full/');
                const pyodide = await loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.28.0/full/',
                });
                if (!pyodide || typeof pyodide.runPythonAsync !== 'function') {
                    throw new Error('Invalid Pyodide instance loaded');
                }
                console.log('Pyodide loaded successfully:', pyodide);
                if (pyodide._module) {
                    console.log('Pyodide module stdout:', pyodide._module.stdout);
                    console.log('Pyodide module stderr:', pyodide._module.stderr);
                    // Configure stdout to capture print output
                    pyodide.setStdout({
                        batched: (text) => {
                            console.log('Captured batched stdout:', text);
                            if (isMounted.current) {
                                setOutput((prev) => {
                                    const newOutput = prev + (text || '');
                                    console.log('Updating output state to:', newOutput);
                                    return newOutput;
                                });
                            }
                        },
                    });
                }
                if (isMounted.current) setPyodide(pyodide);
            } catch (err) {
                console.error('Error loading Pyodide:', err.message, err.stack);
                if (isMounted.current) {
                    setError(`Failed to load Pyodide: ${err.message}. Check console for details or try refreshing.`);
                }
            }
        };
        loadPyodideFromCDN();
    }, []);


    const persistCode = useCallback(async (roomId, code, language) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/code`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token') || Cookies.get('access_token')}`,
                },
                body: JSON.stringify({ code, language }),
            });
        } catch (error) {
            console.error('Error persisting code:', error);
        }
    }, []);

    const handleEditorChange = (value) => {
        if (value !== undefined) {
            setCode(value);
            emitTyping();
            emitCodeUpdate(value, language);
            persistCode(roomId, value, language);
            console.log('Emitting code update:', { roomId, code: value, language });
            setTimeout(emitStopTyping, 2000);
        }
    };

    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        emitCodeUpdate(code, newLanguage);
        console.log('Emitting language update:', { roomId, code, language: newLanguage });
    };

    const handleRunCode = async () => {
        if (!isMounted.current) return;

        setOutput('');
        setError('');
        console.log('Running code:', { language, code }); // Debug log
        try {
            if (language === 'python' && !pyodide) {
                throw new Error('Pyodide not loaded. Please wait or refresh.');
            }

            if (language === 'python' && pyodide) {
                try {
                    // Preserve indentation by avoiding aggressive trimming of internal spaces
                    const formattedCode = code.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\n\s*\n/g, '\n');
                    console.log('Original code:', code); // Debug original input
                    console.log('Formatted Python code:', formattedCode); // Debug formatted output

                    // Verify Pyodide object
                    console.log('Pyodide instance:', pyodide);
                    if (!pyodide._module || !pyodide._module.stdout) {
                        console.warn('Pyodide module or stdout not available');
                    }

                    const result = await pyodide.runPythonAsync(formattedCode);
                    console.log('Python raw result:', result); // Debug raw result
                    let outputResult = result !== undefined ? result.toString() : '';
                    if (pyodide._module && pyodide._module.stdout) {
                        const stdoutOutput = pyodide._module.stdout.getvalue().trim();
                        console.log('Captured stdout:', stdoutOutput); // Debug stdout
                        if (stdoutOutput) outputResult += '\n' + stdoutOutput;
                        pyodide._module.stdout.truncate(0); // Clear stdout
                    }
                    // Only set output as fallback if no batched output
                    if (isMounted.current && !output.trim() && outputResult) {
                        setOutput((prev) => {
                            const newOutput = prev || outputResult;
                            console.log('Setting output to (fallback):', newOutput);
                            return newOutput;
                        });
                    }
                    console.log('Python execution result:', outputResult);
                } catch (pyErr) {
                    if (isMounted.current) {
                        let errorMsg = `Python Error: ${pyErr.message || 'Unknown error'}`;
                        if (pyodide._module && pyodide._module.stderr) {
                            const stderrOutput = pyodide._module.stderr.getvalue().trim();
                            console.log('Captured stderr:', stderrOutput); // Debug stderr
                            if (stderrOutput) errorMsg += '\n' + stderrOutput;
                            pyodide._module.stderr.truncate(0); // Clear stderr
                        }
                        setError(errorMsg);
                        console.error('Python execution error:', pyErr);
                    }
                }
            } else if (language === 'javascript') {
                // Create a sandboxed environment to handle multi-line JS code
                const sandbox = {
                    console: {
                        log: (...args) => {
                            const output = args.join(' ') + '\n';
                            if (isMounted.current) setOutput((prev) => prev + output);
                        }
                    },
                    setTimeout,
                    setInterval,
                    clearTimeout,
                    clearInterval,
                    // Add other global objects as needed
                };
                const script = new Function('sandbox', `with (sandbox) { ${code} }`)(sandbox);
                try {
                    if (isMounted.current && typeof script === 'function') {
                        const result = script();
                        if (result !== undefined && isMounted.current) {
                            setOutput((prev) => prev + (result.toString() + '\n'));
                        }
                    }
                } catch (jsErr) {
                    if (isMounted.current) {
                        setError(`Error: ${jsErr.message}`);
                        console.error('JavaScript execution error:', jsErr);
                    }
                }
            } else {
                if (isMounted.current) {
                    setOutput(`Running ${language} code is not supported in the browser.`);
                }
            }
        } catch (err) {
            if (isMounted.current) {
                console.error('Run code error:', err);
                setError(`Error: ${err.message}`);
            }
        }
    };



    const handleLeaveRoom = () => {
        window.location.href = '/dashboard';
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const recipient = availableUsers.find(u => u.userId !== userId);
            if (recipient) {
                emitChatMessage({ message: newMessage, recipientId: recipient.userId });
            }
            setMessages(prev => [...prev, { username, message: newMessage, timestamp: new Date().toLocaleTimeString() }]);
            setNewMessage('');
        }
    };

    console.log("Typing users:", typingUsers);

    console.log("Messages:", messages);
    console.log("Available users:", availableUsers);



    return (
        <div className="flex flex-col h-full w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-2 bg-gray-700 text-white">
                <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="p-1 bg-gray-600 border border-gray-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                </select>
                <div className="flex space-x-2">
                    <div className="text-sm">
                        {typingUsers && (
                            <div className="text-sm text-yellow-400 mt-1 animate-pulse">
                                {typingUsers.username} typing...
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleRunCode}
                        className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 transition"
                    >
                        Run Code
                    </button>
                    <button
                        onClick={handleLeaveRoom}
                        className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition"
                    >
                        Leave Room
                    </button>
                </div>
            </div>
            <div className="flex h-full">
                <div className="flex-1 flex flex-col">
                    <MonacoEditor
                        defaultValue={code}
                        height="calc(100vh - 16rem)"
                        language={language}
                        value={code}
                        onChange={handleEditorChange}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            lineNumbers: 'on',
                            automaticLayout: true,
                        }}
                    />
                    {output && (
                        <div className="p-2 bg-gray-700 text-white text-sm overflow-auto max-h-24">
                            {output}
                        </div>
                    )}
                    {error && (
                        <div className="p-2 bg-red-700 text-white text-sm overflow-auto max-h-24">
                            {error}
                        </div>
                    )}
                </div>
                <div className="w-1/4 p-2 bg-gray-700 text-white flex flex-col">
                    <h3 className="text-lg font-semibold mb-2">Chat</h3>
                    <div className="flex-1 overflow-y-auto mb-2" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
                        {messages.map((msg, index) => (
                            <div key={index} className="mb-1">
                                <span className="font-bold">{msg.username}</span>: {msg.message} <span className="text-xs text-gray-400">{msg.timestamp}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex space-x-2 items-center">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 p-2 bg-gray-600 border border-gray-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 placeholder-gray-300"
                            placeholder="Type a message..."
                        />
                        <button
                            onClick={handleSendMessage}
                            className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition duration-200 font-semibold"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}