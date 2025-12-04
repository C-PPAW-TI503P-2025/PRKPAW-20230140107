const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const presensiController = require('../controllers/presensiController');
const { authenticateToken } = require('../middleware/permissionMiddleware');

router.use(authenticateToken);

router.post('/check-in', presensiController.upload.single('image'), presensiController.CheckIn);
router.post('/check-out', presensiController.CheckOut);

router.put('/:id', [
  body('checkIn').optional().isISO8601().withMessage('Format tanggal checkIn tidak valid'),
  body('checkOut').optional().isISO8601().withMessage('Format tanggal checkOut tidak valid')
], presensiController.updatePresensi);
router.delete('/:id', presensiController.deletePresensi);

// Method not allowed handlers
router.all('/check-in', (req, res) => {
    res.status(405).json({ message: 'Method not allowed. Use POST /api/presensi/check-in' });
});
router.all('/check-out', (req, res) => {
    res.status(405).json({ message: 'Method not allowed. Use POST /api/presensi/check-out' });
});

module.exports = router;
