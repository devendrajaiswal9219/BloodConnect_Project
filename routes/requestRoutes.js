const express = require('express');

const {
    createRequest,
    getMyRequests,
    getAllRequests,
    getRequestById,
    reviewRequest
} = require('../controllers/bloodRequestController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createRequest);
router.get('/mine', getMyRequests);
router.get('/', authorize('admin'), getAllRequests);
router.get('/:id', getRequestById);
router.patch('/:id/review', authorize('admin'), reviewRequest);

module.exports = router;