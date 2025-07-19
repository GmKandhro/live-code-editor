import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listRooms, createRoom } from '../utils/api';
import RoomCard from '../components/RoomCard';
import Cookies from 'js-cookie';

export default function Dashboard() {
    const [rooms, setRooms] = useState([]);
    const [language, setLanguage] = useState('javascript');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const userId = Cookies.get('userId') || '';
    console.log('User ID:', userId);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await listRooms();
                setRooms(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching rooms');
            }
        };
        fetchRooms();
    }, []);

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            const { roomId } = await createRoom(language);
            navigate(`/room/${roomId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating room');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-primary mb-6">Dashboard</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleCreateRoom} className="mb-8 flex space-x-4">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="p-2 border rounded-md"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                    <button type="submit" className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-accent">
                        Create Room
                    </button>
                </form>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rooms.map((room) => (
                        <RoomCard key={room.roomId} room={room} userId={userId} />
                    ))}
                </div>
            </div>
        </div>
    );
}