import { useState } from 'react';
import { login, register } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function AuthForm({ type }) {
    const [formData, setFormData] = useState({ email: '', password: '', username: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (type === 'register') {
                await register(formData);
                navigate('/dashboard');
            } else {
                await login({ email: formData.email, password: formData.password });
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-primary mb-4">{type === 'register' ? 'Register' : 'Login'}</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full p-2 border rounded-md focus:ring-secondary focus:border-secondary"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="mt-1 block w-full p-2 border rounded-md focus:ring-secondary focus:border-secondary"
                        required
                    />
                </div>
                {type === 'register' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="mt-1 block w-full p-2 border rounded-md focus:ring-secondary focus:border-secondary"
                            required
                        />
                    </div>
                )}
                <button
                    type="submit"
                    className="w-full bg-secondary text-white py-2 rounded-md hover:bg-accent transition"
                >
                    {type === 'register' ? 'Register' : 'Login'}
                </button>
            </form>
        </div>
    );
}