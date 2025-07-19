import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../utils/api';
import Cookies from 'js-cookie';

export default function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get('access_token'));
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsAuthenticated(false);
        navigate('/login');
    };

    return (
        <nav className="bg-primary text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold">CodeCollab</Link>
                <div className="space-x-4">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="hover:text-accent">Dashboard</Link>
                            <button onClick={handleLogout} className="hover:text-accent">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-accent">Login</Link>
                            <Link to="/register" className="hover:text-accent">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}