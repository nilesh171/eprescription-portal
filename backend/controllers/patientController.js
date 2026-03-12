const pool = require('../config/database');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3 = require('../config/awsS3');

exports.getPrescriptions = async (req, res) => {
    const patientId = req.userData.roleId;
    try {
        const [prescriptions] = await pool.query(
            `SELECT pr.*, u.name as doctor_name, d.specialization 
             FROM prescriptions pr 
             JOIN doctors d ON pr.doctor_id = d.doctor_id
             JOIN users u ON d.user_id = u.user_id
             WHERE pr.patient_id = ? ORDER BY pr.created_at DESC`,
            [patientId]
        );
        
        // fetch medicines
        for (let i = 0; i < prescriptions.length; i++) {
            const [medicines] = await pool.query(
                `SELECT * FROM medicines WHERE prescription_id = ?`,
                [prescriptions[i].prescription_id]
            );
            prescriptions[i].medicines = medicines;
        }

        res.status(200).json(prescriptions);
    } catch (error) {
        console.error('Error fetching patient prescriptions:', error);
        res.status(500).json({ message: 'Server error fetching prescriptions' });
    }
};

exports.downloadPrescriptionUrl = async (req, res) => {
    const { id } = req.params;
    const patientId = req.userData.roleId;

    try {
        const [prescriptions] = await pool.query(
            `SELECT file_url FROM prescriptions WHERE prescription_id = ? AND patient_id = ?`,
            [id, patientId]
        );

        if (prescriptions.length === 0 || !prescriptions[0].file_url) {
            return res.status(404).json({ message: 'Prescription file not found' });
        }

        const fileUrl = prescriptions[0].file_url;
        // Extract S3 key from the full URL
        const urlParts = fileUrl.split('.amazonaws.com/');
        if (urlParts.length < 2) {
            return res.status(400).json({ message: 'Invalid file URL format' });
        }
        const key = urlParts[1];

        // AWS SDK v3 pre-signed URL
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        });
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 mins

        res.status(200).json({ downloadUrl: signedUrl });
    } catch (error) {
        console.error('Error generating pre-signed url:', error);
        res.status(500).json({ message: 'Server error generating download link' });
    }
};
