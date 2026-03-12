import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Trash2, Save, FileText, UploadCloud } from 'lucide-react';

const CreatePrescription = () => {
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState({
        patient_id: '',
        diagnosis: '',
    });
    const [medicines, setMedicines] = useState([
        { medicine_name: '', dosage: '', frequency: '', duration: '' }
    ]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Fetch all patients for dropdown
        const fetchPatients = async () => {
            try {
                const res = await api.get('/doctor/patients');
                setPatients(res.data);
            } catch (err) {
                console.error('Failed to fetch patients', err);
            }
        };
        fetchPatients();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMedicineChange = (index, e) => {
        const newMedicines = [...medicines];
        newMedicines[index][e.target.name] = e.target.value;
        setMedicines(newMedicines);
    };

    const addMedicineRow = () => {
        setMedicines([...medicines, { medicine_name: '', dosage: '', frequency: '', duration: '' }]);
    };

    const removeMedicineRow = (index) => {
        const newMedicines = [...medicines];
        newMedicines.splice(index, 1);
        setMedicines(newMedicines);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.patient_id) {
            setError('Please select a patient.'); return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append('patient_id', formData.patient_id);
            data.append('diagnosis', formData.diagnosis);
            // Send medicines as JSON string
            data.append('medicines', JSON.stringify(medicines));
            if (file) {
                data.append('prescriptionFile', file);
            }

            await api.post('/doctor/create-prescription', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            navigate('/doctor/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create prescription');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Create New Prescription</h1>
                <button 
                    onClick={() => navigate('/doctor/dashboard')}
                    className="text-gray-600 hover:text-blue-600 font-medium"
                >
                    Cancel
                </button>
            </div>
            
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Select Patient <span className="text-red-500">*</span></label>
                            <select 
                                name="patient_id" 
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Select Patient --</option>
                                {patients.map(p => (
                                    <option key={p.patient_id} value={p.patient_id}>
                                        {p.name} (Age: {p.age}, {p.phone})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Attach PDF (Optional)</label>
                            {/* Hidden file input, triggered only by clicking the button below */}
                            <input
                                type="file"
                                accept=".pdf"
                                ref={fileInputRef}
                                onChange={(e) => setFile(e.target.files[0])}
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition cursor-pointer"
                            >
                                <UploadCloud className="h-7 w-7 text-gray-400 mb-1" />
                                <span className="text-sm text-gray-500 font-medium">
                                    {file ? file.name : 'Click here to upload PDF'}
                                </span>
                                {file && (
                                    <span className="text-xs text-green-600 mt-1">✓ File selected</span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Diagnosis <span className="text-red-500">*</span></label>
                        <textarea 
                            name="diagnosis" 
                            rows="4" 
                            required 
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
                            placeholder="Enter diagnosis details..."
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-lg font-bold text-gray-800">Medicines prescribed</h3>
                            <button 
                                type="button" 
                                onClick={addMedicineRow}
                                className="flex items-center text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded transition"
                            >
                                <Plus className="h-4 w-4 mr-1"/> Add Medicine
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {medicines.map((med, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-gray-50 p-4 rounded border border-gray-200">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Medicine Name <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" name="medicine_name" value={med.medicine_name} required
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" 
                                            onChange={(e) => handleMedicineChange(index, e)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Dosage</label>
                                        <input 
                                            type="text" name="dosage" value={med.dosage} placeholder="e.g. 500mg"
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" 
                                            onChange={(e) => handleMedicineChange(index, e)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Frequency</label>
                                        <input 
                                            type="text" name="frequency" value={med.frequency} placeholder="e.g. 1-0-1"
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" 
                                            onChange={(e) => handleMedicineChange(index, e)}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-grow">
                                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Duration</label>
                                            <input 
                                                type="text" name="duration" value={med.duration} placeholder="e.g. 5 days"
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" 
                                                onChange={(e) => handleMedicineChange(index, e)}
                                            />
                                        </div>
                                        {medicines.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeMedicineRow(index)}
                                                className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded shrink-0 mb-0.5"
                                            >
                                                <Trash2 className="h-5 w-5"/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition shadow flex items-center disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : <><Save className="h-5 w-5 mr-2"/> Generate Prescription</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePrescription;
