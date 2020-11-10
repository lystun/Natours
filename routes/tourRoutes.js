const express = require('express')
const app = express()

const tourController = require('./../controllers/tourController')
const authController = require('./../controllers/authController')

const router = express.Router()

// Tours Routes
router.route('/top-5-tours').get( tourController.aliasTopTours, tourController.getAllTours )
router.route('/tours-stats').get( tourController.getTourStats )
router.route('/monthly-plan/:year').get( tourController.getMonthlyPlan )

router
    .route('/')
    .get(authController.protect, tourController.getAllTours )
    .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour)

router
    .route('/:id')
    .get( tourController.getTour )
    .patch(
        authController.protect, 
        authController.restrictTo('admin', 'lead-guide'), 
        tourController.uploadTourImages,
        tourController.resizeTourImages, 
        tourController.updateTour,
    )
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour )


module.exports = router