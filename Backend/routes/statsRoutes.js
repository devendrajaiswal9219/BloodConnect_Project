const express = require('express');
const { authorize, protect } = require('../middleware/auth');
const { getStats } = require('../controllers/statsController');

const router = express.Router();

router.get('/', protect, authorize('admin'), getStats);

module.exports = router;