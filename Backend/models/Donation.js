const mongoose = require("express") && require("mongoose");
const { BLOOD_GROUPS } = require("../config/constant");
const donationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    bloodGroup: {
        type: String,
        enum: BLOOD_GROUPS,
        required: true,
    },
    units: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
    },
    unitsDonated: {
        type: Number,
        default: function () {
            return this.units || 1;
        }
    },
    donationDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    location: {
        type: String,
        trim: true,
        maxlength: 150,
        default: 'Main Blood Bank',
    },
    status: {
        type: String,
        enum: ["scheduled", "pending", "completed", "approved", "rejected", "cancelled"],
        default: "scheduled",
    },
}, {
    timestamps: true,
});
donationSchema.index({ donor: 1, status: 1 });
donationSchema.index({ donationDate: -1 });
module.exports = mongoose.model("Donation", donationSchema);