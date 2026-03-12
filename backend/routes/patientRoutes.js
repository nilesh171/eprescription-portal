const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(checkRole(['patient']));

router.get('/prescriptions', patientController.getPrescriptions);
router.get('/download/:id', patientController.downloadPrescriptionUrl);

module.exports = router;
