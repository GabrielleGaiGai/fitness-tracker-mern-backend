const express = require('express')
const router = express.Router()
const workoutsController = require('../controllers/workoutsController')
const verifyJWT = require('../middlewares/verifyJWT')

router.use(verifyJWT)

router.route('/')
    .post(workoutsController.createNewWorkout)
    .patch(workoutsController.updateWorkout)
    .delete(workoutsController.deleteWorkout)
    .get(workoutsController.getAllWorkoutsForUser)

module.exports = router