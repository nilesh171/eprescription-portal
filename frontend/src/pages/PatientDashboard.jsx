import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Download, FileText, Activity } from 'lucide-react';

const PatientDashboard = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            const res = await api.get('/patient/prescriptions');
            setPrescriptions(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch prescriptions', error);
            setLoading(false);
        }
    };

    const handleDownload = async (id) => {
        try {
            const res = await api.get(`/patient/download/${id}`);
            if (res.data.downloadUrl) {
                // Create a temporary link to download
                const link = document.createElement('a');
                link.href = res.data.downloadUrl;
                link.setAttribute('download', `prescription-${id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            }
        } catch (err) {
            console.error('Download failed', err);
            alert('Could not download file. It may not exist.');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Patient Dashboard</h1>
            
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">My Prescriptions</h2>
                </div>
                
                {loading ? (
                    <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : prescriptions.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {prescriptions.map((p) => (
                            <div key={p.prescription_id} className="p-6 hover:bg-gray-50 transition">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <FileText className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Dr. {p.doctor_name}</h3>
                                            <p className="text-sm text-gray-500">{p.specialization}</p>
                                            <div className="mt-2 text-sm text-gray-700">
                                                <strong>Diagnosis:</strong> {p.diagnosis}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                Date: {new Date(p.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 md:mt-0 flex flex-col space-y-2 items-end">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            Status: {p.status.toUpperCase()}
                                        </span>
                                        {p.file_url && (
                                            <button 
                                                onClick={() => handleDownload(p.prescription_id)}
                                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium text-sm border border-blue-200 px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 transition"
                                            >
                                                <Download className="h-4 w-4" />
                                                <span>Download PDF</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {p.medicines && p.medicines.length > 0 && (
                                    <div className="mt-4 ml-14 bg-gray-50 p-4 rounded-md border border-gray-100">
                                        <h4 className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                                            <Activity className="h-4 w-4 mr-1 text-green-600" /> Prescribed Medicines
                                        </h4>
                                        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                                            {p.medicines.map((m) => (
                                                <li key={m.medicine_id}>
                                                    <span className="font-medium text-gray-800">{m.medicine_name}</span> - {m.dosage}, {m.frequency} for {m.duration}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 text-center text-gray-500">No prescriptions found.</div>
                )}
            </div>
        </div>
    );
};

export default PatientDashboard;
