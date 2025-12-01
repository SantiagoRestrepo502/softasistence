const express = require('express');
const router = express.Router();
const { verifyAndRegisterAttendance } = require('../controllers/biometric.controller');

router.post('/verify', verifyAndRegisterAttendance);

module.exports = router;
