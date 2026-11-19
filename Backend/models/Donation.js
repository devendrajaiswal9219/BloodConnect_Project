const mongoose=require("mongoose");
const {BLOOD_GROUPS}=require("../config/constant");

const donationSchema=new mongoose.Schema({
    donor:{
        type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,
    },
    bloodGroup:{
        type:String,enum:BLOOD_GROUPS,required:true,
    },
    donationDate:{
        type:Date,required:true,
    },
    units:{
        type:Number,required:true,min:1,max:5,
    },
    location:{
        type:String,trim:true,maxlength:150,default:'Main Blood Bank',
    },
    status:{
        type:String,enum:["scheduled","completed","cancelled"],default:"scheduled",
    },
},{
    timestamps:true,
}
);

donationSchema.index({donor:1,status:1});

module.exports=mongoose.model("Donation",donationSchema);
