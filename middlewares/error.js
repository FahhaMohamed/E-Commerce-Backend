module.exports = (err, req, res, next) => {
    
    err.statusCode = err.statusCode || 500;

    if(process.env.NODE_ENV == 'development') {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            stack: err.stack,
            error: err
        })
    }

    if(process.env.NODE_ENV == 'production') {

        let message = err.message;

        let error = new Error(message);

        //for validation error - missing fields
        if(err.name == "ValidationError") {
            message = Object.values(err.errors).map(value => value.message);
            error = new Error(message)
            err.statusCode = 400
        }
        

        //for cast error
        if(err.name == "CastError") {
            message = `Resource not found: ${err.path}`;
            error = new Error(message)
            err.statusCode = 400
        }

        if(err.code == 11000) {
            let message = `Duplicate ${Object.keys(err.keyValue)} error`;
            error = new Error(message)
            err.statusCode = 400
        }

        if(err.code == "JSONWebTokenError") {
            let message = 'JSON Web Token is invalid. Try again';
            error = new Error(message)
            err.statusCode = 400
        }

        if(err.code == "TokenExpiredError") {
            let message = 'JSON Web Token is expired. Try again';
            error = new Error(message)
            err.statusCode = 400
        }

        res.status(err.statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error',
        })
    }

    
}