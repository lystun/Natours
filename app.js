const express = require('express')
const app = express()
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const helmet = require('helmet')
const hpp = require('hpp')

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

//1. Global middlewares
app.use(helmet())

if(process.env.NODE_ENV === "development") {
    app.use(morgan('dev'))
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, Please try again in an hour'
})

app.use('/api', limiter)
app.use(express.json( {limit: '10kb'}));

// Data sanitization against NoSQL injetion
app.use(mongoSanitize())

//Data sanitization againt XSS
app.use(xss())

//prevent parameter pollution
app.use(hpp({
    whitelist : [
        'duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price '
    ]
}))

//Serving static files
app.use(express.static(`${__dirname}/public`));

// routes
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter )

app.all('*', (req, res, next) => {
    
    // const err = new Error(`Can't find ${req.originalUrl} on this server!`)
    // err.status = 'fail'
    // err.statusCode = 404

    return next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
});

app.use(globalErrorHandler)

module.exports = app