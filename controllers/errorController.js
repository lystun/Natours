const AppError = require("../utils/appError")

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, err.statusCode) 
}

const handleDuplicateFieldsDB = err => {
    const message = `Duplicate field value. Please use another value`
    return new AppError(message, 400) 
}

const handleValidationErrorDB = err => {
    const message = `Invalid input Data`
    return new AppError(message, 400) 
}

const handleJWTError = () => new AppError('Invalid Token. Please log in again', 401)
const handleJWTExpiredError = () => new AppError('Your Token has expired. Please log in again', 401)


const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    })
}

const sendErrorProd = (err, res) => {
    // Operational, known error: send message to client 
    if(err.isOperational){
        
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
        
    }else {
        // Programming or unknown error: don't leak error details

        //1. log the error
        console.error('Error', err);
        
        //2. send a generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went untracebly wrong!',
        })
    }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';


    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res)
    }

    if(process.env.NODE_ENV === 'production'){
        let error = { ...err }

        if(error.name === 'CastError') error = handleCastErrorDB(error)
        if(error.code === 11000) error = handleDuplicateFieldsDB(error)
        if(error.name === 'ValidationError') error = handleValidationErrorDB(error)
        if(error.name === 'JsonWebTokenError') error = handleJWTError()
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError()
        
        sendErrorProd(error, res)
    }

}