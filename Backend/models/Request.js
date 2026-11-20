const mongoose=require("mongoose");
const {BLOOD_GROUPS}=require('../config/constant')

const bloodRequestSchema=new mongoose.Schema({
    requestNumber: {
    type: String,
    required: true,
    unique: true
},
requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
},
patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
    maxlength: 120
},
hospitalName: {
    type: String,
    required: [true, 'Hospital/clinic name is required'],
    trim: true,
    maxlength: 150
},
bloodGroup: {
    type: String,
    enum: BLOOD_GROUPS,
    required: true
},
unitsRequested: {
    type: Number,
    required: true,
    min: 1,
    max: 20
},
urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
},
reason: {
    type: String,
    trim: true,
    maxlength: 1000
},
requiredBy: {
    type: Date
},
status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'fulfilled'],
    default: 'pending',
},
adminRemarks: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
},
reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
},
},
{ timestamps: true }
);

bloodRequestSchema.index({ status: 1, urgency: 1, createdAt: -1 });

bloodRequestSchema.statics.generateRequestNumber = function generateRequestNumber() {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `REQ-${Date.now()}-${rand}`;
};

module.exports=mongoose.model('BoodRequest',bloodRequestSchema);
