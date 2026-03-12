import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { User, Mail, Lock, Building, Phone, Calendar } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'patient',
        specialization: '', license_number: '', hospital_name: '', // doctor
        age: '', gender: 'male', phone: '', // patient
        address: '' // pharmacy
    });
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');
        try {
            await api.post('/auth/register', formData);
            setMsg('Registration successful! Please login.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>
            
            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
            {msg && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">{msg}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
                        <div className="relative">
                            <User className="absolute inset-y-0 left-3 top-3 h-5 w-5 text-gray-400" />
                            <input type="text" name="name" required className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute inset-y-0 left-3 top-3 h-5 w-5 text-gray-400" />
                            <input type="email" name="email" required className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute inset-y-0 left-3 top-3 h-5 w-5 text-gray-400" />
                            <input type="password" name="password" required minLength="6" className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                        <select name="role" className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" onChange={handleChange} value={formData.role}>
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                            <option value="pharmacy">Pharmacy</option>
                        </select>
                    </div>
                </div>

                {formData.role === 'doctor' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-blue-50 rounded-md">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Specialization</label>
                            <input type="text" name="specialization" required className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">License Number</label>
                            <input type="text" name="license_number" required className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Hospital/Clinic Name</label>
                            <div className="relative">
                                <Building className="absolute inset-y-0 left-3 top-3 h-5 w-5 text-gray-400" />
                                <input type="text" name="hospital_name" className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                )}

                {formData.role === 'patient' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-green-50 rounded-md">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Age</label>
                            <div className="relative">
                                <Calendar className="absolute inset-y-0 left-3 top-3 h-5 w-5 text-gray-400" />
                                <input type="number" name="age" required className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Gender</label>
                            <select name="gender" className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" onChange={handleChange}>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute inset-y-0 left-3 top-3 h-5 w-5 text-gray-400" />
                                <input type="text" name="phone" required className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                )}

                {formData.role === 'pharmacy' && (
                    <div className="grid grid-cols-1 gap-4 mt-4 p-4 bg-purple-50 rounded-md">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Pharmacy License Number</label>
                            <input type="text" name="license_number" required className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Full Address</label>
                            <div className="relative">
                                <Building className="absolute inset-y-0 left-3 top-3 h-5 w-5 text-gray-400" />
                                <textarea name="address" required className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" onChange={handleChange} rows="3"></textarea>
                            </div>
                        </div>
                    </div>
                )}

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-200 mt-6">
                    Create Account
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-medium">Login here</Link>
            </div>
        </div>
    );
};

export default Register;
