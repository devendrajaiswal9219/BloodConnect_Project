const mongoose=require("mongoose");
const {BLOOD_GROUPS}=require("../config/constant");

const bloodInventorySchema=new mongoose.Schema({
    bloodGroup:{
        type:String,
        enum:BLOOD_GROUPS,
        required:true,
        unique:true,
    },
    unitsAvailable:{
        type:Number,
        required:true,
        default:0,
        min:0,
    },
},{
    timestamps:true,
});

bloodInventorySchema.statics.ensureAllGroups=async function ensureAllGroups(){
    for(const bloodGroup of BLOOD_GROUPS){
        await this.findOneAndUpdate(
            {bloodGroup: bloodGroup},
            {$setOnInsert: {bloodGroup: bloodGroup, unitsAvailable: 0}},
            {upsert: true, returnDocument: "after"}
        );
    }
};

module.exports=mongoose.model("BloodInventory",bloodInventorySchema);