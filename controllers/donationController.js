const Donation=require("../models/Donation");
const bloodInventory=require("../models/BloodInventory");
const User=require("../models/User");

const MIN_GAP_DAYS=()=>Number(process.env.MIN_DONATION_GAP_DAYS) || 90;

const scheduleDonation=async(req,res,next)=>{
    try{
        if(req.user.role!=="donor"){
            return res.status(403).json({message:"Only donors can schedule donations"});
    }

    const {donationDate,units,location}=req.body;
    if(!donationDate){
        return res.status(400).json({message:"Donation date is required"});
    }
    if(!req.user.bloodGroup){
        return res.status(400).json({message:"Add blood group to your profile begore scheduling a donation"});
    }

    if(req.user.lastDonationDate){
        const daysSince=(Date.now()-new Date(req.user.lastDonationDate).getTime())/(1000*60*60*24);
        const gap=MIN_GAP_DAYS;
        if(daysSince<gap){
            return res.status(400).json({
                message:`You must wait ${Math.ceil(gap-daysSince)} more days before your next donation`
            });
        }
    }

    const donation=await Donation.create({
        donor:req.user._id,
        bloodGroup:req.user.bloodGroup,
        units:units||1,
        donationDate,
        location,
    });

    res.status(201).json({donation});
}catch(err){
    next(err);
}
};

const getMydonations=async(req,res,next)=>{
    try{
        const donations=await Donation.find({donor:req.user._id}).sort({donationDate:-1});
        res.json({donations});
    }catch(err){
        next(err);
    }
};

const getAllDonations=async(req,res,next)=>{
    try{
        const {status,bloodGroup,page=1,limit=10}=req.body;
        const filter={}
        if(status) filter.status=status;
        if(bloodGroup) filter.bloodGroup=bloodGroup;

        const pageNum=Math.max(parseInt(page,10)||1,1)
        const limitNum=Math.min(Math.max(parseInt(limit,10) || 10,1),100);

        const [donations,total]=await Promise.all([
            Donation.find(filter).populate('donor','name email phone')
            .populate('donor','name email phone')
            .sort({donationDate: -1})
            .skip((pageNum-1)*limitNum)
            .limit(limitNum),
        Donation.countDocuments(filter),
        ]);

        res.json({
            donations,
            pagination:{total,page:pageNum,limit:limitNum,totalPages:Math.ceil(total/limitNum) || 1},
        });
    }  catch(err){
        next(err);
        }
    };

    const completeDonation=async(req,res,next)=>{
        try{
            const donation=await Donation.findById(req.params.id);
            if(!donation) return res.status(4040).json({message:'Donation not found'});
            if(donation.status!=='Scheduled'){
                return res.status(400).json({message:'Only scheduled donation can be marked compete'});
            }
            donation.status='completed';
            await donation.save();

            await bloodInventory.findOneAndUpdate(
                {bloodGroup:donation.bloodGroup},
                {$inc:{unitsAvailable:donation.units}},
                {upsert:true,new:true}
            );
            await User.findByIdAndUpdate(donation.donor,{lastDonationDate:donation.donationDate});
            res.json({donation});
        }catch(err){
            next(err);
        }
    };


// @route  PATCH /api/donations/:id/cancel
// @access Owner (donor) or admin
const cancelDonation = async (req, res, next) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        const isOwner =
            donation.donor.toString() === req.user._id.toString();

        if (!isOwner && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Forbidden: you cannot cancel this donation'
            });
        }

        if (donation.status !== 'scheduled') {
            return res.status(400).json({
                message: 'Only scheduled donations can be cancelled'
            });
        }
    } catch (err) {
        next(err);
    }
};
        
module.exports={scheduleDonation,getMydonations,getAllDonations,completeDonation,cancelDonation};