const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {BLOOD_GROUPS} = require("../config/constant");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide your name"],
        trim: true,
        maxlength:80},
    email: {
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please provide a valid email"],
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [6, "Password must be at least 6 characters long"],
        select: false, // Exclude password from query results by default
    },
    role:{
        type: String,
        enum: ["admin","donor","requester"],
        default: "donor",
    },
    phone: {
        type: String,
        trim: true,
        maxlength: [15, "Phone number cannot exceed 15 characters"],
    },
    bloodGroup: {
        type: String,
        enum: BLOOD_GROUPS,
    },
    dateOfBirth: {
        type: Date,
    },
    address: {
        type: String,
        trim: true,
        maxlength: [200, "Address cannot exceed 200 characters"],
    },
    lastDonationDate: {
        type: Date,
        default: null,
    },
    organization: {
        type: String,
        trim: true,
        maxlength: [100, "Organization name cannot exceed 100 characters"],
    },
}, {
    timestamps: true,
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
    return {
        _id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        phone: this.phone,
        bloodGroup: this.bloodGroup,
        dateOfBirth: this.dateOfBirth,
        address: this.address,
        lastDonationDate: this.lastDonationDate,
        organization: this.organization,
        createdAt: this.createdAt,
    };
};

module.exports = mongoose.model("User", userSchema);