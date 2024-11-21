const express = require('express');
const app = express();
const path = require('path');

const errorMiddleware = require("./middlewares/error");
const cookieParser = require("cookie-parser")

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const products = require('./routes/product');
const auth = require('./routes/auth');
const orders = require('./routes/order');


app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', orders);

//use error middleware
app.use(errorMiddleware);

module.exports = app;