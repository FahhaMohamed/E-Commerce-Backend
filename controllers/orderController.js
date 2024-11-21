const catchAsyncError = require('../middlewares/catchAsyncError')
const Order = require('../models/orderModel');
const ErrorHandler = require('../utils/errorHandler');
const Product = require('../models/productModel')


//Create new order - /api/v1/order/new
exports.newOrder = catchAsyncError( async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user.id,
    })

    res.status(200).json({
        success: true,
        order
    })
})

//Get single order - /api/v1/order/:id
exports.getSingleOrder = catchAsyncError( async (req, res, body) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if(! order) {
        return next(new ErrorHandler(`Order not found with this id ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        order
    })
})


//Get all orders for one Logged in user - /api/v1/myorders
exports.myOrders = catchAsyncError( async (req, res, next) => {
    const orders = await Order.find({user: req.user.id}).populate('user', 'name email');

    if(! orders) {
        return next(new ErrorHandler(`Orders not found this user id ${req.user.id}`, 404))
    }

    res.status(200).json({
        success: true,
        count: orders.length,
        orders
    })
})

//------------Admin-------------

//Admin: Get all orders - api/v1/admin/orders
exports.orders = catchAsyncError( async (req, res, next) => {

    const orders = await Order.find();

    //get total amount price of all orders
    let totalAmount = 0;

    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    if(! orders) {
        return next(new ErrorHandler('Orders not found', 404))
    }

    res.status(200).json({
        success: true,
        count: orders.length,
        totalAmount, 
        orders
    })

})


//Admin: Update order - api/v1/admin/order/:id
exports.updateOrder = catchAsyncError( async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if(!order) {
        return next(new ErrorHandler(`Order not found with this id ${req.params.id}`, 404))
    }

    if(order.orderStatus == "Delivered" ) {
        return next(new ErrorHandler(`Order has been already delivered!`, 400))
    }

    //updating the product stock
    order.orderItems.forEach( async orderItem => {
        await updateStock(orderItem.product, orderItem.quantity);
    })

    order.orderStatus = req.body.orderStatus;
    order.deliveredAt = Date.now();

    await order.save();

    res.status(200).json({
        success: true,
    })
})


async function updateStock(productId, quantity) {
    const product = await Product.findById(productId);

    product.stock = product.stock - quantity;

    product.save({validateBeforeSave: false})
}


//Admin: Delete order - api/v1/admin/order/:id
exports.deleteOrder = catchAsyncError ( async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if(!order) {
        return next(new ErrorHandler(`Order not found with this id ${req.params.id}`, 404))
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
    })
})
