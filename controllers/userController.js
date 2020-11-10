const User = require("../models/userModel");
const multer = require('multer');
const sharp = require('sharp');
const AppError = require("../utils/appError");
const catchAsync = require('../utils/catchAsync');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users' ) 
//     },

//     filename : (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else {
        cb(new AppError('Not an image. Please only images are permitted', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
}); 

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({quality : 90})
        .toFile(`public/img/users/${req.file.filename}`)

    next();
})

const filterObj = (obj, ...allowedFields) => {

    const newObj = {};

    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj
}

exports.getAllUsers = catchAsync (async (req, res) => {

    const users = await User.find()

    //send a response
    res.status(200).json({
        status: 'success',
        results: users.length,
        data : {
            users
        }
    });
})

exports.updateMe = catchAsync (async (req, res, next) => {

    //1. Create Error if user posts password data
    if(req.body.password || req.body.passwordConfirm ){
        return next(new AppError('This route is not for password updates', 400))
    }

    const filteredBody = filterObj(req.body, 'name', 'email' );

    if(req.file) filteredBody.photo = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    })

    // update user document
    res.status(200).json({
        status: 'success',
        data : {
            user: updatedUser,
        }
    });

})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: "Error"
    })
}

exports.getUser = (req, res) => {
    res.status(500).json({
        status: "Error"
    })
}

exports.deleteMe = catchAsync(async  (req, res) => {

    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: "success",
        data: null
    })
})

