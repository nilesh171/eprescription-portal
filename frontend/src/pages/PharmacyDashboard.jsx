import React, { useState } from 'react';
import api from '../services/api';
import { Search, CheckCircle, XCircle, FileText, Activity } from 'lucide-react';

const PharmacyDashboard = () => {
    const [prescriptionId, setPrescriptionId] = useState('');
    const [prescription, setPrescription] = useState(null);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!prescriptionId.trim()) return;
        
        setLoading(true);
        setError('');
        setPrescription(null);
        setMsg('');

        try {
            const res = await api.get(`/pharmacy/verify/${prescriptionId}`);
            setPrescription(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Prescription not found or invalid.');
        } finally {
            setLoading(false);
        }
    };

    const handleDispense = async () => {
        if (!prescription) return;
        
        try {
            await api.post('/pharmacy/dispense', { prescriptionId: prescription.prescription_id });
            setMsg('Prescription marked as dispensed successfully!');
            setPrescription({ ...prescription, status: 'dispensed' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to dispense prescription.');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Pharmacy Dashboard</h1>
            
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Verify Prescription</h2>
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-grow relative">
                        <Search className="absolute inset-y-0 left-3 top-3 h-5 w-5 text-gray-400" />
                        <input 
                            type="text" 
                            className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-lg" 
                            placeholder="Scan QR Code or Enter Prescription ID..." 
                            value={prescriptionId}
                            onChange={(e) => setPrescriptionId(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md transition disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Verify'}
                    </button>
                </form>

                {error && <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-md flex items-center"><XCircle className="h-5 w-5 mr-2"/> {error}</div>}
                {msg && <div className="mt-4 bg-green-50 text-green-600 p-4 rounded-md flex items-center"><CheckCircle className="h-5 w-5 mr-2"/> {msg}</div>}
            </div>

            {prescription && (
                <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-blue-600"/> Prescription Details
                        </h2>
                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full border ${prescription.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                            {prescription.status.toUpperCase()}
                        </span>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Doctor Details</h3>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="font-bold text-gray-900 text-lg">Dr. {prescription.doctor_name}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Patient Details</h3>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="font-bold text-gray-900 text-lg">{prescription.patient_name}</p>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Diagnosis</h3>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-800">
                                {prescription.diagnosis}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center">
                                <Activity className="h-4 w-4 mr-1"/> Prescribed Medicines
                            </h3>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {prescription.medicines?.map(m => (
                                            <tr key={m.medicine_id}>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{m.medicine_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{m.dosage}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{m.frequency}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{m.duration}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                        {prescription.status === 'active' && (
                            <button 
                                onClick={handleDispense}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition shadow flex items-center"
                            >
                                <CheckCircle className="h-5 w-5 mr-2"/> Mark as Dispensed
                            </button>
                        )}
                        {prescription.status === 'dispensed' && (
                            <span className="text-gray-500 font-medium italic">This prescription has already been dispensed.</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacyDashboard;
