const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

// Endpoint penerima data sensor
// URL: http://localhost:3001/api/iot/data
router.post('/data', iotController.receiveSensorData);
router.get('/history', iotController.getSensorHistory);
router.post('/ping', iotController.testConnection);
module.exports = router;
