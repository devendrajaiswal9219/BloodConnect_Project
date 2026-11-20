
const User = require('../models/User');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/Request');
const BloodInventory = require('../models/BloodInventory');

// @access Admin
const getStats = async (req, res, next) => {
    try {
        await BloodInventory.ensureAllGroups();

        const threshold = Number(process.env.LOW_STOCK_THRESHOLD) || 10;

        const [
            donorCount,
            requesterCount,
            donationStatusCounts,
            requestStatusCounts,
            inventory
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
            BloodInventory.find().sort({ bloodGroup: 1 }),
        ]);

        const totalUnits = inventory.reduce((acc, curr) => acc + (curr.unitsAvailable || 0), 0);

        res.json({
            donorCount,
            requesterCount,
            totalUnitsAvailable: totalUnits,
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
                units: i.unitsAvailable,
                lowStock: (i.unitsAvailable || 0) <= threshold
            })),
            lowStockGroups: inventory
                .filter((i) => (i.unitsAvailable || 0) < threshold)
                .map((i) => i.bloodGroup)
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getStats };
