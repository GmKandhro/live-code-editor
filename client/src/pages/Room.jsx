import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { joinRoom } from '../utils/api';
import CodeEditor from '../components/CodeEditor';
import Cookies from 'js-cookie';

export default function Room() {
    const { roomId } = useParams();
    const [room, setRoom] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const userId = Cookies.get('userId') || '';

    useEffect(() => {
        const fetchRoom = async () => {
            if (!roomId) {
                setError('Invalid room Id');
                return;
            }
            try {
                const data = await joinRoom(roomId);
                setRoom(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error joining room');
                navigate('/dashboard');
            }
        };
        fetchRoom();
    }, [roomId, navigate]);

    if (error) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500">{error}</div>;
    }

    if (!room) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col">
            <div className="p-4 bg-white shadow-md mb-4">
                <h2 className="text-xl font-semibold text-primary">Room {room.roomId.slice(0, 8)}</h2>
                <p className="text-sm text-gray-600">Users: {room.users.join(', ')}</p>
            </div>
            <div className="flex-1">
                <CodeEditor
                    roomId={roomId}
                    initialCode={room.code}
                    initialLanguage={room.language}
                    userId={userId}
                />
            </div>
        </div>
    );
}