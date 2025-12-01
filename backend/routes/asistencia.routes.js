const express = require('express')
const router = express.Router()
const { registrarBiometrica } = require('../controllers/asistencia.controller')

router.post('/biometrica', registrarBiometrica)

module.exports = router
