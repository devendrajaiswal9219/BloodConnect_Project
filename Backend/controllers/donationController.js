const Donation = require("../models/Donation");
const bloodInventory = require("../models/BloodInventory");
const User = require("../models/User");
const getMinGapDays = () => Number(process.env.MIN_DONATION_GAP_DAYS) || 90;
const scheduleDonation = async (req, res, next) => {
    try {
        if (req.user.role !== "donor" && req.user.role !== "admin") {
            return res.status(403).json({ message: "Only donors can schedule donations" });
        }
        const { donationDate, date, units, unitsDonated, location } = req.body;
        const targetDate = donationDate || date;
        if (!targetDate) {
            return res.status(400).json({ message: "Donation date is required" });
        }
        if (!req.user.bloodGroup) {
            return res.status(400).json({ message: "Add blood group to your profile before scheduling a donation" });
        }
        if (req.user.lastDonationDate) {
            const daysSince = (Date.now() - new Date(req.user.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24);
            const gap = getMinGapDays();
            if (daysSince < gap) {
                return res.status(400).json({
                    message: `You must wait ${Math.ceil(gap - daysSince)} more days before your next donation`
                });
            }
        }

        const donation = await Donation.create({
            donor: req.user._id,
            bloodGroup: req.user.bloodGroup,
            units: units || unitsDonated || 1,
            unitsDonated: units || unitsDonated || 1,
            donationDate: new Date(targetDate),
            location: location || 'Main Blood Bank',
            status: 'scheduled'
        });
        res.status(201).json({ donation });
    } catch (err) {
        next(err);
    }
};

const getMyDonations = async (req, res, next) => {
    try {
        const donations = await Donation.find({ donor: req.user._id }).sort({ donationDate: -1, createdAt: -1 });
        res.json({ donations });
    } catch (err) {
        next(err);
    }
};
const getAllDonations = async (req, res, next) => {
    try {
        const { status, bloodGroup, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (status) filter.status = status.toLowerCase();
        if (bloodGroup) filter.bloodGroup = bloodGroup;
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
        const [donations, total] = await Promise.all([
            Donation.find(filter)
                .populate('donor', 'name email phone bloodGroup')
                .sort({ donationDate: -1, createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Donation.countDocuments(filter),
        ]);
        res.json({
            donations,
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 },
        });
    } catch (err) {
        next(err);
    }
};

const completeDonation = async (req, res, next) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }
        if (donation.status === 'completed') {
            return res.status(400).json({ message: 'Donation has already been completed' });
        }
        donation.status = 'completed';
        await donation.save();
        const unitsToAdd = donation.units || donation.unitsDonated || 1;
        await bloodInventory.findOneAndUpdate(
            { bloodGroup: donation.bloodGroup },
            { $inc: { unitsAvailable: unitsToAdd } },
            { upsert: true, new: true }
        );
        await User.findByIdAndUpdate(donation.donor, {
            lastDonationDate: donation.donationDate || new Date()
        });
        res.json({ donation });
    } catch (err) {
        next(err);
    }
};

const cancelDonation = async (req, res, next) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }
        const isOwner = donation.donor.toString() === req.user._id.toString();
        if (!isOwner && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Forbidden: you cannot cancel this donation'
            });
        }
        if (donation.status === 'completed') {
            return res.status(400).json({
                message: 'Completed donations cannot be cancelled'
            });
        }
        donation.status = 'cancelled';
        await donation.save();
        res.json({ message: 'Donation cancelled successfully', donation });
    } catch (err) {
        next(err);
    }
};
module.exports = {
    scheduleDonation,
    getMyDonations,
    getAllDonations,
    completeDonation,
    cancelDonation
};
