const express = require('express')
const { protect, authorize } = require('../middleware/auth');

const {
    scheduleDonation,
    getMyDonations,
    getAllDonations,
    completeDonation,
    cancelDonation
} = require('../controllers/donationController');

const router = express.Router();
router.use(protect);
router.post('/', scheduleDonation);
router.get('/mine', getMyDonations);
router.get('/', authorize('admin'), getAllDonations);
router.patch('/:id/complete', authorize('admin'), completeDonation);
router.patch('/:id/cancel', cancelDonation);

module.exports = router;