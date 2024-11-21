const express = require('express');
const { getProducts, newProduct, getSingleProduct, updateProduct, deleteProduct, createReview, getReviews, deleteReviews } = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles }= require('../middlewares/authenticate');

const router = express.Router();

//Get Api
router.route('/products').get(getProducts);
router.route('/product/:id').get(getSingleProduct);

//Create Api
router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);

//Update Api
router.route('/admin/product/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct);

//Delete Api
router.route('/admin/product/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);


//--------reviews-----------
router.route('/review').put(isAuthenticatedUser, createReview)
                        .delete(isAuthenticatedUser, deleteReviews);
router.route('/reviews').get(getReviews);

module.exports = router;