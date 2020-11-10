const express = require('express')
const multer = require('multer')
const router = express.Router()

const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')


router.post('/signup', authController.signup )
router.post('/login', authController.login )

router.post('/forgot-password', authController.forgotPassword )
router.patch('/reset-password/:token', authController.resetPassword )


router.patch('/update-password', authController.protect, authController.updatePassword )
router.patch(
    '/update-me', 
    authController.protect, 
    userController.uploadUserPhoto,  
    userController.resizeUserPhoto,  
    userController.updateMe )
router.delete('/delete-me', authController.protect, userController.deleteMe )

//User routes
router
    .route('/')
    .get( userController.getAllUsers )
    .post( userController.createUser )

router
    .route('/:id')
    .get( userController.getUser )


module.exports = router