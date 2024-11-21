const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');

const catchAsyncError = require('../middlewares/catchAsyncError');

const APIFeatures = require('../utils/apiFeatures');
//here using export for use this getProduct arrow function on any js files

// app.get("/users", (req, res) => {

// })

//below is same like above but in here only define arrow function of app.get (req, res) => {}, not using url("/users")



//Arrow function for Get all Products - /api/v1/products
//------------------------------------------------------

exports.getProducts = catchAsyncError(async (req, res, next) => {

    const resultPerPage = 4;

    //using api features class
    // const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter().paginate(resultPerPage);

    let buildQuery = () => {
        return new APIFeatures(Product.find(), req.query).search().filter()
    }

    const filteredProductsCount = await buildQuery().query.countDocuments({})

    const totalProductsCount = await Product.countDocuments({});

    let productsCount = totalProductsCount;

    if(filteredProductsCount !== totalProductsCount) {
        productsCount = filteredProductsCount;
    }

    //const products = await Product.find();

    const products = await buildQuery().paginate(resultPerPage).query;

    
    
    await new Promise(resolve => setTimeout(resolve, 300));

    // return next(new ErrorHandler('Unable to send products!', 400))

    res.status(200).json({
        success: true, 
        count: productsCount,
        resultPerPage,
        products
    })
})

//Arrow function for Get Single Product - /api/v1/product/here product id
//-------------------------------------------------------------------------

exports.getSingleProduct = catchAsyncError ( async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if(!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    
    res.status(201).json({
        success:true,
        product
    })
} )



//Arrow function for Create a Product - /api/v1/admin/product/new
//------------------------------------------------------------

exports.newProduct = catchAsyncError(
    async (req, res, next) => {

        req.body.user = req.user.id;

        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            product //product(key): product(data)
        });
    }
);


//Arrow function for UPDATE Product - /api/v1/admin/product/here product id
//----------------------------------------------------------------------

exports.updateProduct = catchAsyncError ( async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if(!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        product
    });
    
} )


//Arrow function for DELETE Product - /api/v1/admin/product/here product id
//----------------------------------------------------------------------

exports.deleteProduct = catchAsyncError ( async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if(!product) {
        // return res.status(404).json({
        //     success: false,
        //     message: "Product not found",
        // });

        return next(new ErrorHandler("Product not found", 404));
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Product deleted"
    });
    
} )


//-------------Reviews--------------

//Create review - /api/v1/review
exports.createReview = catchAsyncError ( async ( req, res, next) => {

    const { productId, rating, comment } = req.body;

    const review = {
        user: req.user.id,
        rating,
        comment,
    }

    const product = await Product.findById(productId);

    const isReview = product.reviews.find(review => {
        return review.user.toString() == req.user.id.toString()
    })

    if(isReview) {

        product.reviews.forEach( review => {
            if(review.user.toString() == req.user.id.toString()) {
                review.comment = comment;
                review.rating = rating;
            }
        })

    }else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    //finding average of the product reviews
    product.rating = product.reviews.reduce((acc, review) => {
        return review.rating + acc;
    }, 0) / product.reviews.length

    isNaN(product.rating) ? 0: product.rating

    await product.save({validateBeforeSave: false})

    res.status(200).json({
        success: true,
    })

})

//Get reviews - /api/v1/reviews?id=
exports.getReviews = catchAsyncError ( async ( req, res, next) => {
    const product = await Product.findById(req.query.id);

    if(!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    const count = product.numOfReviews;

    res.status(200).json({
        success: true,
        count,
        reviews: product.reviews,
    })
})

//Delete review - /api/v1/review?productId=&id=
exports.deleteReviews = catchAsyncError ( async ( req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if(!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    const reviews = product.reviews.filter(review => {
        return review._id.toString() !== req.query.id.toString()
    })

    const numOfReviews = reviews.length;

    let rating = reviews.reduce((acc, review) => {
        return review.rating + acc;
    }, 0) / numOfReviews;

    rating = isNaN(rating) ? 0 : rating;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        numOfReviews,
        rating
    })

    res.status(200).json({
        success: true,
    })

})