const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter name"]
    },

    email: {
        type: String,
        required: [true, "Please enter email"],
        unique: true,
        validate: [validator.isEmail, "Please enter valid email address"]
    },

    password: {
        type: String,
        required: [true, "Please enter password"],
        maxLength: [6, 'Password cannot exceed 6 characters'],
        select: false,
    },

    avatar: {
        type: String,
    },

    role: {
        type: String,
        default: "user"
    },

    resetPasswordToken: String,

    resetPasswordTokenExpire: Date,

    createdAt: {
        type: Date,
        default: Date.now
    }

});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.getJWTToken = function () {
    return jwt.sign({id: this.id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

userSchema.methods.isValidPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.methods.getResetToken = function () {
    //Generate token
    const token = crypto.randomBytes(20).toString('hex');

    //Generate hash and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    //set token expire time
    this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000;

    return token;
}

let model = mongoose.model('User', userSchema);

module.exports = model;