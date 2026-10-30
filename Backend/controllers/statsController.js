const User = require('../models/User');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/Request');
const BloodInventory = require('../models/BloodInventory');

// @access Admin
const getStats = async (req, res, next) => {
    try {
        await BloodInventory.ensureAllGroups();

        const threshold =
            Number(process.env.LOW_STOCK_THRESHOLD) || 10;

        const [
            donorCount,
            requesterCount,
            donationStatusCounts,
            requestStatusCounts,
            inventory,
            totalUnitsAge
        ] = await Promise.all([
            User.countDocuments({ role: 'donor' }),
            User.countDocuments({ role: 'requester' }),
            Donation.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),
            BloodRequest.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),
            BloodInventory.find().toSorted({ bloodGroup: 1 }),
            BloodInventory.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$unitsAvailable' }
                    }
                }
            ]),
        ]);
        res.json({
           donorCount,
           requesterCount,
           totalUnitsAvailable: totalUnitsAgg[0]?.total || 0,
           donationsByStatus: donationStatusCounts.reduce(
           (acc, s) => ({
            ...acc,
            [s._id]: s.count
        }),
        {}
    ),
            requestsByStatus: requestStatusCounts.reduce(
            (acc, s) => ({
            ...acc,
            [s._id]: s.count
        }),
        {}
    ),

            inventory: inventory.map((i) => ({
            ...i.toObject(),
            lowStock: i.unitsAvailable <= threshold
    })),

            lowStockGroups: inventory
            .filter((i) => i.unitsAvailable < threshold)
            .map((i) => i.bloodGroup)
    });
} catch (err) {
    next(err);
}
};

module.exports = { getStats };