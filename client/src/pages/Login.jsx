import AuthForm from '../components/AuthForm';
import { Link } from 'react-router-dom';

export default function Login() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div>
                <AuthForm type="login" />
                <p className="mt-4 text-center">
                    Don't have an account? <Link to="/register" className="text-secondary hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
}