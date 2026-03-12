const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(checkRole(['pharmacy']));

router.get('/verify/:prescriptionId', pharmacyController.verifyPrescription);
router.post('/dispense', pharmacyController.dispensePrescription);

module.exports = router;
