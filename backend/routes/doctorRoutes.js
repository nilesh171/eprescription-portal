const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const upload = require('../utils/uploadToS3');

router.use(authMiddleware);
router.use(checkRole(['doctor']));

router.get('/patients', doctorController.getPatients);
router.get('/prescriptions', doctorController.getPrescriptions);
router.post('/create-prescription', upload.single('prescriptionFile'), doctorController.createPrescription);

module.exports = router;
