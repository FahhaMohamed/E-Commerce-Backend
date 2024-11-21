const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"],
        trim: true,
        maxLength: [100, "Product name cannot exceed 100 characters"]
    },

    price: {
        type: Number,
        required: true,
        default: 0.0,
    },

    description: {
        type: String,
        required: [true, "Please enter product description"],
    },

    rating: {
        type: String,
        default: 0,
    },

    images: [
        {
            image: {
                type: String,
                required: true,
            }
        }
    ],

    category: {
        type: String,
        required: [true, "Please enter product category"],
        enum: {
            values: [
                'Electronics',
                'Mobile Phones',
                'Laptops',
                'Accessories',
                'Headphones',
                'Foods',
                'Books',
                'Clothes/Shoes',
                'Beauty/Health',
                'Sports',
                'Outdoor',
                'Home'
            ],
            message: "Please select correct category"
        }
    },

    seller: {
        type: String,
        required: [true, "Please enter product seller"],
    },

    stock: {
        type: Number,
        required: [true, "Please enter product stock"],
        maxLength: [20, 'Product stock cannot exceed 20']
    },

    numOfReviews: {
        type: Number,
        default: 0
    },

    reviews: [
        {
            user: mongoose.Schema.Types.ObjectId,

            rating: {
                type: String,
                required: true,
            },

            comment: {
                type: String,
                required: true,
            }
        }
    ],

    user: {
        type: mongoose.Schema.Types.ObjectId,
    },

    createdAt: {
        type: Date,
        default: Date.now()
    }

})

let schema = mongoose.model('Product', productSchema) //Product is model name, it convert as a collection name with plural: "products"

module.exports = schema;