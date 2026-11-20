const getInventory = async (req, res, next) => {
    try {
        await bloodInventory.ensureAllGroups();
        const inventory = await bloodInventory.find().sort({ bloodGroup: 1 });
        const threshold = Number(process.env.LOW_STOCK_THRESHOLD) || 10;
        res.json({
            inventory: inventory.map((item) => ({
                ...item.toObject(),
                units: item.unitsAvailable,
                lowStock: Number(item.unitsAvailable) < threshold,
            })),
            lowStockThreshold: threshold,
        });
    } catch (error) {
        next(error);
    }
};
const adjustInventory = async (req, res, next) => {
    try {
        const { unitsAvailable, units } = req.body;
        const bloodGroup = (req.params.bloodGroup || '').trim();
        if (!BLOOD_GROUPS.includes(bloodGroup)) {
            return res.status(400).json({ message: `Invalid blood group. Allowed: ${BLOOD_GROUPS.join(', ')}` });
        }
        const value = unitsAvailable !== undefined ? unitsAvailable : units;
        if (value === undefined || isNaN(Number(value)) || Number(value) < 0) {
            return res.status(400).json({ message: "Invalid unitsAvailable value: must be a non-negative number" });
        }
        const record = await bloodInventory.findOneAndUpdate(
            { bloodGroup },
            { unitsAvailable: Number(value) },
            { new: true, upsert: true }
        );
        res.json({ inventory: record });
    } catch (error) {
        next(error);
    }
};
module.exports = { getInventory, adjustInventory };