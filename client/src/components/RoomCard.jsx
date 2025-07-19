import { useNavigate } from 'react-router-dom';
import { deleteRoom } from '../utils/api';

export default function RoomCard({ room, userId }) {
    const navigate = useNavigate();

    const handleJoin = () => {
        navigate(`/room/${room.roomId}`);
    };

    const handleDelete = async () => {
        try {
            await deleteRoom(room.roomId);
        } catch (err) {
            console.error(err.response?.data?.message || 'Error deleting room');
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center">
            <div>
                <h3 className="text-lg font-semibold text-primary">Room {room.roomId.slice(0, 8)}</h3>
                <p className="text-sm text-gray-600">Language: {room.language}</p>
                <p className="text-sm text-gray-600">Users: {room.users.length}</p>
            </div>
            <div className="space-x-2">
                <button onClick={handleJoin} className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-accent">
                    Join
                </button>
                {room.creator === userId && (
                    <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
}