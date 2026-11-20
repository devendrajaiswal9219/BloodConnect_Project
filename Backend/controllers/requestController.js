const BloodRequest = require('../models/Request');
const BloodInventory = require('../models/BloodInventory');
const { BLOOD_GROUPS } = require('../config/constant');
const urgencyMap = {
    normal: 'medium',
    medium: 'medium',
    urgent: 'high',
    high: 'high',
    emergency: 'critical',
    critical: 'critical',
    low: 'low'
};
const createRequest = async (req, res, next) => {
    try {
        const {
            patientName,
            hospitalName,
            hospital,
            bloodGroup,
            unitsRequested,
            units,
            urgency,
            reason,
            requiredBy
        } = req.body;
        const effectiveHospital = (hospitalName || hospital || '').trim();
        const effectiveUnits = Number(unitsRequested || units);
        const mappedUrgency = urgencyMap[(urgency || '').toLowerCase()] || 'medium';
        if (!patientName || !effectiveHospital || !bloodGroup || !effectiveUnits) {
            return res.status(400).json({
                message: 'Patient name, hospital, blood group, and units are all required'
            });
        }
        if (!BLOOD_GROUPS.includes(bloodGroup)) {
            return res.status(400).json({
                message: `Invalid blood group. Allowed: ${BLOOD_GROUPS.join(', ')}`
            });
        }

       const request = await BloodRequest.create({
            requestNumber: BloodRequest.generateRequestNumber(),
            requester: req.user._id,
            patientName: patientName.trim(),
            hospitalName: effectiveHospital,
            bloodGroup,
            unitsRequested: effectiveUnits,
            urgency: mappedUrgency,
            reason: reason || '',
            requiredBy: requiredBy ? new Date(requiredBy) : undefined
        });
        res.status(201).json({ request });
    } catch (err) {
        next(err);
    }
};

const getMyRequests = async (req, res, next) => {
    try {
<<<<<<< HEAD
        const requests = await BloodRequest.find({ requester: req.user._id })
            .sort({ createdAt: -1 });

=======
        const requests = await BloodRequest.find({ requester: req.user._id }).sort({ createdAt: -1 });
>>>>>>> 6e45547 (Updated frontend and backend functionality)
        res.json({ requests });
    } catch (err) {
        next(err);
    }
};
const getAllRequests = async (req, res, next) => {
    try {
        const {
            status,
            urgency,
            bloodGroup,
            page = 1,
            limit = 10
        } = req.query;
        const filter = {};
        if (status) filter.status = status.toLowerCase();
        if (urgency) filter.urgency = urgency.toLowerCase();
        if (bloodGroup) filter.bloodGroup = bloodGroup;
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
        const [requests, total] = await Promise.all([
            BloodRequest.find(filter)
                .populate('requester', 'name email phone organization')
                .populate('reviewedBy', 'name')
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            BloodRequest.countDocuments(filter),
        ]);
        res.json({
            requests,
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 },
        });
    } catch (err) {
        next(err);
    }
};

const getRequestById = async (req, res, next) => {
    try {
        const request = await BloodRequest.findById(req.params.id)
            .populate('requester', 'name email phone organization')
            .populate('reviewedBy', 'name');

        if (!request) {
            return res.status(404).json({
                message: 'Request not found'
            });
        }

        const isOwner = request.requester._id.toString() === req.user._id.toString();
        if (!isOwner && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Forbidden: you cannot view this request'
            });
        }

        res.json({ request });
    } catch (err) {
        next(err);
    }
};

const reviewRequest = async (req, res, next) => {
    try {
        const { status, adminRemarks } = req.body;
        const validStatuses = ['pending', 'approved', 'rejected', 'fulfilled'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status value. Allowed: ${validStatuses.join(', ')}`
            });
        }
        const request = await BloodRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (status === 'fulfilled') {
            if (request.status === 'fulfilled') {
                return res.status(400).json({
                    message: 'This request has already been fulfilled'
                });
            }

            // Atomic inventory check and decrement
            const updatedInventory = await BloodInventory.findOneAndUpdate(
                { bloodGroup: request.bloodGroup, unitsAvailable: { $gte: request.unitsRequested } },
                { $inc: { unitsAvailable: -request.unitsRequested } },
                { new: true }
            );

<<<<<<< HEAD
            const available = Number(inventory?.unitsAvailable)|| 0;

            if (available < request.unitsRequested) {
                return res.status(400).json({
                    message: 'Not enough stock: only ${available} units of ${request.bloodGroup} available'                });
=======
            if (!updatedInventory) {
                const currentInv = await BloodInventory.findOne({ bloodGroup: request.bloodGroup });
                const available = currentInv?.unitsAvailable ?? 0;
                return res.status(400).json({
                    message: `Not enough stock: only ${available} units of ${request.bloodGroup} available, but ${request.unitsRequested} requested`
                });
>>>>>>> 6e45547 (Updated frontend and backend functionality)
            }
        }

        if (status) request.status = status;
        if (adminRemarks !== undefined) {
            request.adminRemarks = adminRemarks;
        }

        request.reviewedBy = req.user._id;
        await request.save();
        await request.populate('reviewedBy', 'name');

        res.json({ request });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createRequest,
    getMyRequests,
    getAllRequests,
    getRequestById,
    reviewRequest
};
