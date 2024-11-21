const express = require('express');
const path = require('path')

//we want to add this package , because we have multi type data when user create new account 
const multer = require('multer');

const upload = multer({storage: multer.diskStorage({
    destination: function (req, file, cb) {
        cb( null, path.join(__dirname, '..', 'uploads/user') )
    },
    filename: function (req, file, cb) {
        cb( null,  file.originalname)
    }
})})



const { 

    registerUser, 
    loginUser, 
    logoutUser, 
    forgotPassword, 
    resetPassword, 
    getUserProfile, 
    changePassword, 
    updateProfile, 
    getAllUsers,
    getUser,
    updateUser,
    deleteUser

} = require('../controllers/authController');

const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/authenticate');

router.route('/register').post(upload.single('avatar'), registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logoutUser);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);

router.route('/myprofile').get(isAuthenticatedUser, getUserProfile)
router.route('/password/change').put(isAuthenticatedUser, changePassword);
router.route('/update').put(isAuthenticatedUser, upload.single('avatar'), updateProfile);


//Admin routes
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), getAllUsers);
router.route('/admin/user/:id').get(isAuthenticatedUser, authorizeRoles('admin'), getUser);
router.route('/admin/user/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateUser);
router.route('/admin/user/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);




module.exports = router; 