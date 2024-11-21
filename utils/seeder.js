const products = require("../data/products.json");

const Product = require("../models/productModel");

const path = require("path");
const dotenv = require('dotenv');

const connectDatabase = require("../config/database");

dotenv.config({
    path: path.join(__dirname, "../config/config.env")
})

connectDatabase();


const seedProducts = async () => {

    try {
        await Product.deleteMany();
        console.log("All products deleted");

        await Product.insertMany(products);
        console.log("All products added");
    } catch (error) {
        console.log(error.message);
    } finally {
        process.exit();
    }

}

seedProducts();