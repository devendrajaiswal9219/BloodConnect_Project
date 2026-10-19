const express = require('express');

const {
    scheduleDonation,
    getMyDonations,
    getAllDonations,
    completeDonation,
    cancelDonation
} = require('../middleware/donation');

const { authorize } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.post('/', scheduleDonation);
router.get('/mine', getMyDonations);
router.get('/', authorize('admin'), getAllDonations);
router.patch('/:id/complete', authorize('admin'), completeDonation);
router.patch('/:id/cancel', cancelDonation);

module.exports = router;