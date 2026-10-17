const jwt=require("jsonwebtoken");
const User=require("../models/User");

const generateToken=(id)=>jwt.sign({id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});

const register=async(req,res,next)=>{
    try{
        const {name,email,password,role,phone,bloodGroup,dateOfBirth,address,lastDonationDate,organization}=req.body;

        if(!name || !email || !password){
            return res.status(400).json({message:"Please provide name, email and password"});
        }

        const existingUser=await User.findOne({email:email.toLowerCase()});
        if(existingUser){
            return res.status(400).json({messaage:"An account with this email already exists"});
        }

        const userCount=await User.countDocuments();
        const finalRole=userCount===0 ? "admin" : (role || "requester");

        if(finalRole==="donor" && !bloodGroup){
            return res.status(400).json({message:"Please provide blood group for donor role"});
        }

        if(finalRole==="requester" && !organization){
            return res.status(400).json({message:"Please provide organization for requester role"});
        }

        const newUser=await User.create({
            name,
            email:email.toLowerCase(),
            password,
            role:finalRole,
            phone,
            bloodGroup:finalRole==="donor" ? bloodGroup : undefined,
            dateOfBirth,
            address,
            organization:finalRole==="requester" ? organization : undefined,
        });

        const token=generateToken(newUser._id);
        res.status(201).json({token,user:newUser.toSafeObject()});
    }catch(err){
        next(err);
    }
};

const login=async(req,res,next)=>{
    try{
        const {email,password}=req.body;

        if(!email || !password){
            return res.status(400).json({message:"Please provide email and password"});
        }

        const user=await User.findOne({email:email.toLowerCase()}).select("+password");
        if(!user || !(await user.matchPassword(password))){
            return res.status(401).json({message:"Invalid email or password"});
        }

        const token=generateToken(user._id);
        res.json({token,user:user.toSafeObject()});
    }catch(err){
        next(err);
    }
};

const getMe=async(req,res,next)=>{
    try{
        res.json({user:req.user.toSafeObject()});
    }catch(err){
        next(err);
    }
};

module.exports={
    register,
    login,
    getMe
};