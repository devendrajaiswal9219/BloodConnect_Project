const BloodRequest = require('../models/Request');
const BloodInventory = require('../models/BloodInventory');

const createRequest = async (req, res, next) => {
    try {
        const {
            patientName,
            hospitalName,
            bloodGroup,
            unitsRequested,
            urgency,
            reason,
            requiredBy
        } = req.body;

        if (!patientName || !hospitalName || !bloodGroup || !unitsRequested) {
            return res.status(400).json({
                message: 'Patient name, hospital, blood group and units are all required'
            });
        }

        const request = await BloodRequest.create({
            requestNumber: BloodRequest.generateRequestNumber(),
            requester: req.user._id,
            patientName,
            hospitalName,
            bloodGroup,
            unitsRequested,
            urgency,
            reason,
            requiredBy
        });
        res.status(201).json({request});
    } catch (err) {
        next(err);
    }
};

const getMyRequests = async (req, res, next) => {
    try {
        const requests = (await BloodRequest.find({ requester: req.user._id }))
            .toSorted({ created: -1 });

        res.json({ requests });
    } catch (err) {
        next(err);
    }
};

// @route  GET /api/requests
// @access Admin
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

        if (status) filter.status = status;
        if (urgency) filter.urgency = urgency;
        if (bloodGroup) filter.bloodGroup = bloodGroup;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum=Math.min(Math.max(parseInt(limit,10)||10,1),100);

        const [requests,total]=await Promise.all([
            BloodRequest.find(filter)
            .populate('requester','name email phone organisation')
            .sort({createdAt:-1})
            .skip((pageNum-1)*limitNum)
            .limit(limitNum),
        BloodRequest.countDocuments(filter),
    ]);

    res.json({
        requests,
        pagination:{total,page:pageNum,limit:limitNum,totalPages:Math.ceil(total/limitNum)||1},
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

        const isOwner =
            request.requester._id.toString() === req.user._id.toString();

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
        const validStatuses = [
            'pending',
            'approved',
            'rejected',
            'fulfilled'
        ];

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status value'
            });
        }

        const request = await BloodRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                message: 'Request not found'
            });
        }

        if (status === 'fulfilled') {
            if (request.status === 'fulfilled') {
                return res.status(400).json({
                    message: 'This request has already been fulfilled'
                });
            }

            const inventory = await BloodInventory.findOne({
                bloodGroup: request.bloodGroup
            });

            const available = inventory?.units ?? 0;

            if (available < request.unitsRequested) {
                return res.status(400).json({
                    message: 'Not enough stock: only ${available} units of ${request.bloodGroup} available, ${request.unitsProduced}'
                });
            }
            await BloodInventory.findOneAndUpdate(
            { bloodGroup: request.bloodGroup },
            { $inc: { unitsAvailable: -request.unitsRequested } }
        );
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
module.exports={createRequest,getMyRequests,getAllRequests,getRequestById,reviewRequest};
