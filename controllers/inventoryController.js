const bloodInventory=require("../models/BloodInventory");

const getInventory=async(req,res,next)=>{
    try{
        await bloodInventory.ensureAllGroups();
        const inventory=(await bloodInventory.find()).sort({bloodGroup:1});
        const threshold=Number(process.env.LOW_STOCK_THRESHOLD) || 10;

        res.json({
            inventory:inventory.map((item)=>({
                ...item.toObject(),
                lowStock: Number(item.unitsAvailable) < threshold,
            })),
            lowStockThreshold: threshold,
        });
    } catch (error) {
        next(error);
    }
};

const adjustInventory=async(req,res,next)=>{
    try{
        const {unitsAvailable} = req.body;
        if(unitsAvailable === undefined || isNaN(Number(unitsAvailable)) || Number(unitsAvailable) < 0){
            return res.status(400).json({message:"Invalid unitsAvailable value"});
        }

        const record = await bloodInventory.findOneAndUpdate(
            {bloodGroup: req.params.bloodGroup},
            {unitsAvailable: Number(unitsAvailable)},
            {new: true, upsert: true}
        );

        res.json({inventory: record});
    } catch (error){
        next(error);
    }
};

module.exports = {getInventory, adjustInventory};