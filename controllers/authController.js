const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/userModel');
const sendEmail = require('../utils/email');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwt');
const crypto = require('crypto');


//CREATE Method :- for Getting the user's details by filling the register form on frontend
//register user - /api/v1/register
exports.registerUser = catchAsyncError( async (req, res, next) => {

    const {name, email, password} = req.body;

    let avatar;

    if(req.file) {
        avatar = `${process.env.BACKEND_URL}/uploads/user/${req.file.originalname}`
    }

    const user = await User.create({

        name,
        email,
        password,
        avatar

    });

    sendToken(user, 201, res)

} );

//login user - /api/v1/login
exports.loginUser = catchAsyncError( async (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return next(new ErrorHandler('Please fill all fields', 400))
    }

    //finding the user from database
    const user = await User.findOne({email}).select('+password');

    if(!user){
        return next(new ErrorHandler('Invalid email or password', 401))
    }

    if(! await user.isValidPassword(password)){
        return next(new ErrorHandler('Invalid email or password', 401))
    }

    sendToken(user, 201, res)

})

//logout user - /api/v1/logout
exports.logoutUser = catchAsyncError( (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })

    res.status(200).json({
        success: true,
        message: 'Logged out'
    })
})


//forgot password - /api/v1/password/forgot
exports.forgotPassword = catchAsyncError( async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});


    if(!user) {
        return next(new ErrorHandler('User not found with this email', 404))
    }

    const resetToken = user.getResetToken();

    await user.save({validateBeforeSave: false});


    //Create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`

    const message = `Your password reset url is as follows \n\n ${resetUrl} \n\n If you have not requested this email, then ignore it`;

    try {
        
        sendEmail({
            email: user.email,
            subject: "ECommerce1 Password Recovery",
            message
        })

        res.status(200).json({
            success: true,
            message: `Email send to ${user.email}`
        })

    } catch (error) {
        
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire = undefined;
        await user.save({validateBeforeSave: false});

        return next(new ErrorHandler(`catch error: ${error.message}`, 500))
    }
})


//reset password - /api/v1/password/reset/:token
exports.resetPassword = catchAsyncError( async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne( {
        resetPasswordToken,
        resetPasswordTokenExpire: {
            $gt: Date.now()
        }
    } )

    if(!user) {
        return next( new ErrorHandler('Password reset token is invalid or expired'))
    }

    if( req.body.password !== req.body.confirmPassword) {
        return next( new ErrorHandler('Password does not match'))
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire= undefined;

    await user.save({validateBeforeSave: false})

    sendToken(user, 201, res);
})

//--------After login (for users)----------

//Get user profile - /api/v1/myprofile
exports.getUserProfile = catchAsyncError( async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user,
    })
})

//change user password after login - /api/v1/password/change
exports.changePassword = catchAsyncError( async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    //check old password
    if(! await user.isValidPassword(req.body.oldPassword)) {
        return next(new ErrorHandler('Old password is incorrect', 401),)
    }

    //assigning new password
    user.password = req.body.password;

    await user.save();

    res.status(200).json({
        success: true,
    })
})


//update profile details - /api/v1/update
exports.updateProfile = catchAsyncError( async (req, res, next) => {

    let avatar;

    let newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    if(req.file) {
        avatar = `${process.env.BACKEND_URL}/uploads/user/${req.file.originalname}`
        newUserData = {...newUserData, avatar}
    }

    

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
        user
    })

})

//-------------Admin-------------
//Admin: Get all users - /api/v1/admin/users
exports.getAllUsers = catchAsyncError( async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        count: users.length,
        users
    })
})

//Admin: Get specific user - /api/v1/admin/user/:id
exports.getUser = catchAsyncError( async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if(!user) {
        return next( new ErrorHandler(`User not found with this id ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        user
    })

})

//Admin: Update user
exports.updateUser = catchAsyncError( async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
        user
    })
})


//Admin: delete user
exports.deleteUser = catchAsyncError( async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if(!user) {
        return next( new ErrorHandler(`User not found with this id ${req.params.id}`))
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
    })
})