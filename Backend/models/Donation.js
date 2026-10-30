const mongoose=require("mongoose");
const {BLOOD_GROUPS}=require("../config/constant");

const donationSchema=new mongoose.Schema({
    donor:{
        type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,
    },
    bloodGroup:{
        type:String,enum:BLOOD_GROUPS,required:true,
    },
    unitsDonated:{
        type:Number,required:true,
    },
    location:{
        type:String,trim:true,maxlength:150,default:'Main Blood Bank',
    },
    status:{
        type:String,enum:["pending","approved","rejected"],default:"pending",
    },
},{
    timestamps:true,
}
);

donationSchema.index({donor:1,status:1});

module.exports=mongoose.model("Donation",donationSchema);
