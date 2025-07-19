import { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useSocket } from '../hooks/useSocket';

export default function CodeEditor({ roomId, initialCode, initialLanguage, userId }) {
    const [code, setCode] = useState(initialCode);
    const [language, setLanguage] = useState(initialLanguage);
    const [typingUsers, setTypingUsers] = useState([]);
    const { emitCodeUpdate, emitTyping, emitStopTyping } = useSocket(roomId, {
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
            // Handled in Room.jsx
        },
        onRoomDeleted: () => {
            window.location.href = '/dashboard';
        },
        onTyping: ({ userId: typingUserId }) => {
            if (typingUserId !== userId) {
                setTypingUsers((prev) => [...new Set([...prev, typingUserId])]);
            }
        },
        onStopTyping: ({ userId: typingUserId }) => {
            setTypingUsers((prev) => prev.filter((id) => id !== typingUserId));
        },
        onError: (error) => {
            console.error('Socket error:', error);
        },
    });

    const handleEditorChange = (value) => {
        if (value !== undefined) {
            setCode(value);
            emitTyping();
            emitCodeUpdate(value, language);
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
                <div className="text-sm">
                    {typingUsers.length > 0 && (
                        <span>{typingUsers.length} user(s) typing...</span>
                    )}
                </div>
            </div>
            <MonacoEditor
                height="calc(100vh - 8rem)"
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
        </div>
    );
}