const pool = require('../config/database');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const generateQR = require('../utils/generateQR');

exports.getPatients = async (req, res) => {
    try {
        const [patients] = await pool.query(
            `SELECT p.patient_id, p.age, p.gender, p.phone, u.name, u.email 
             FROM patients p JOIN users u ON p.user_id = u.user_id`
        );
        res.status(200).json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Server error fetching patients' });
    }
};

exports.getPrescriptions = async (req, res) => {
    const doctorId = req.userData.roleId;
    try {
        const [prescriptions] = await pool.query(
            `SELECT pr.*, u.name as patient_name 
             FROM prescriptions pr 
             JOIN patients pt ON pr.patient_id = pt.patient_id
             JOIN users u ON pt.user_id = u.user_id
             WHERE pr.doctor_id = ? ORDER BY pr.created_at DESC`,
            [doctorId]
        );
        res.status(200).json(prescriptions);
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ message: 'Server error fetching prescriptions' });
    }
};

exports.createPrescription = async (req, res) => {
    const doctorId = req.userData.roleId;
    const { patient_id, diagnosis, medicines } = req.body;
    let file_url = null;

    if (req.file) {
        file_url = req.file.location; // from multer-s3
    }

    try {
        const prescriptionId = uuidv4();
        
        // Generate QR code for this prescription ID
        const qrCodeUrl = await generateQR(prescriptionId);

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            await connection.query(
                `INSERT INTO prescriptions (prescription_id, doctor_id, patient_id, diagnosis, file_url, qr_code_url) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [prescriptionId, doctorId, patient_id, diagnosis, file_url, qrCodeUrl]
            );

            let parsedMedicines = medicines;
            // medicines might be a JSON string if sent via FormData
            if (typeof medicines === 'string') {
                try {
                    parsedMedicines = JSON.parse(medicines);
                } catch(e) {
                    parsedMedicines = [];
                }
            }

            if (parsedMedicines && Array.isArray(parsedMedicines)) {
                for (let med of parsedMedicines) {
                    const medicineId = uuidv4();
                    await connection.query(
                        `INSERT INTO medicines (medicine_id, prescription_id, medicine_name, dosage, frequency, duration) 
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [medicineId, prescriptionId, med.medicine_name, med.dosage, med.frequency, med.duration]
                    );
                }
            }

            await connection.commit();
            res.status(201).json({ message: 'Prescription created successfully', prescription_id: prescriptionId, qr_code_url: qrCodeUrl, file_url });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error creating prescription:', error);
        res.status(500).json({ message: 'Server error creating prescription' });
    }
};
