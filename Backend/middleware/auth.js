const jwt=require("jsonwebtoken");
const User=require("../models/User");

const protect=async(req,res,next)=>{
    try{
        const authHeader=req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({message:"Authorization header missing or malformed"});
        }

        const token=authHeader.substring(7);
        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        const user=await User.findById(decoded.id);
        if(!user){
            return res.status(401).json({message:"User not found"});
        }
        req.user=user;
        next();
    }catch(err){
        return res.status(401).json({message:"Not authorized, token failed"});
    }
};

const authorize=(...roles)=>(req,res,next)=>{
    if(!req.user || !roles.includes(req.user.role)){
        return res.status(403).json({message:"You do not have permission to perform this action"});
    }
    next();
}

module.exports={protect, authorize};