const pool = require('../config/database');

exports.verifyPrescription = async (req, res) => {
    const { prescriptionId } = req.params;
    try {
        const [prescriptions] = await pool.query(
            `SELECT pr.*, u_doc.name as doctor_name, u_pat.name as patient_name
             FROM prescriptions pr
             JOIN doctors d ON pr.doctor_id = d.doctor_id
             JOIN users u_doc ON d.user_id = u_doc.user_id
             JOIN patients pt ON pr.patient_id = pt.patient_id
             JOIN users u_pat ON pt.user_id = u_pat.user_id
             WHERE pr.prescription_id = ?`,
            [prescriptionId]
        );

        if (prescriptions.length === 0) {
            return res.status(404).json({ message: 'Prescription not found or invalid' });
        }

        const [medicines] = await pool.query(
            `SELECT * FROM medicines WHERE prescription_id = ?`,
            [prescriptionId]
        );

        const response = {
            ...prescriptions[0],
            medicines
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error verifying prescription:', error);
        res.status(500).json({ message: 'Server error verifying prescription' });
    }
};

exports.dispensePrescription = async (req, res) => {
    const { prescriptionId } = req.body;
    try {
        const [result] = await pool.query(
            `UPDATE prescriptions SET status = 'dispensed' WHERE prescription_id = ? AND status = 'active'`,
            [prescriptionId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Prescription already dispensed or not found' });
        }

        res.status(200).json({ message: 'Prescription marked as dispensed successfully' });
    } catch (error) {
        console.error('Error dispensing prescription:', error);
        res.status(500).json({ message: 'Server error dispensing prescription' });
    }
};
