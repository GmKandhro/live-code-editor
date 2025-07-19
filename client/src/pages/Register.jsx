import AuthForm from '../components/AuthForm';
import { Link } from 'react-router-dom';

export default function Register() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div>
                <AuthForm type="register" />
                <p className="mt-4 text-center">
                    Already have an account? <Link to="/login" className="text-secondary hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}