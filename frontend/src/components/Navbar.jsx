import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, LogOut } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        navigate('/login');
    };

    const getDashboardLink = () => {
        if (role === 'doctor') return '/doctor/dashboard';
        if (role === 'patient') return '/patient/dashboard';
        if (role === 'pharmacy') return '/pharmacy/dashboard';
        return '/login';
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to={token ? getDashboardLink() : "/"} className="flex items-center space-x-2">
                        <HeartPulse className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-800">E-Prescription</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        {token ? (
                            <>
                                <span className="text-gray-600">Welcome, <strong>{name}</strong></span>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 text-red-600 hover:text-red-800 font-medium"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</Link>
                                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition duration-150">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
