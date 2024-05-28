const User = require('../models/User')
const Workout = require('../models/Workout')
const asyncHandler = require('express-async-handler')

const getAllWorkoutsForUser = asyncHandler(async (req, res) => {
    const userId = req.userId
    if (!userId) {
        return res.status(400).json({ message: 'ID is required' })
    }

    const user = await User.findById(userId).lean().exec()
    if (!user) {
        return res.status(400).json({ message: "Invalid user id" })
    }

    const workouts = await Workout.find({ userId }).lean().exec()
    res.json(workouts)
})

const createNewWorkout = asyncHandler(async (req, res) => {
    const userId = req.userId
    const { title, duration, distance, weight, set, repetition, date, note, completed } = req.body

    if (!userId || !title ) {
        return res.status(400).json({ message: 'Some fields are missing' })
    }

    const user = await User.findById(userId).lean().exec()
    if (!user) {
        return res.status(400).json({ message: "Invalid user id" })
    }

    const workoutObject = { userId, title, duration, distance, weight, set, repetition, date, note, completed: Boolean(completed) }
    const workout = await Workout.create(workoutObject)

    if (workout) {
        res.status(201).json({ workout})
    } else {
        res.status(400).json({ message: 'Failed to create new workout' })
    }
})

const updateWorkout = asyncHandler(async (req, res) => {
    const userId = req.userId
    const { id, title, duration, distance, weight, set, repetition, date, note, completed } = req.body

    if (!id || !userId || !title ) {
        return res.status(400).json({ message: 'Some fields are missing' })
    }

    const user = await User.findById(userId).lean().exec()
    if (!user) {
        return res.status(400).json({ message: "Invalid user id" })
    }

    const workout = await Workout.findById(id).exec()
    if (!workout) {
        return res.status(400).json({ message: "Workout not found" })
    }

    workout.title = title
    workout.duration = duration
    workout.distance = distance
    workout.weight = weight
    workout.set = set
    workout.repetition = repetition
    workout.date = date
    workout.note = note
    workout.completed = Boolean(completed)

    const updatedWorkout = await workout.save()

    if (updatedWorkout) {
        res.json({ updatedWorkout })
    } else {
        res.status(400).json({ message: 'Failed to update new workout' })
    }
})

const deleteWorkout = asyncHandler(async (req, res) => {
    const { id } = req.body
    if (!id) {
        return res.status(400).json({ message: 'ID is required' })
    }

    const workout = await Workout.findById(id).exec()
    if (!workout) {
        return res.status(400).json({ message: 'Workout not found' })
    }

    await workout.deleteOne()

    res.status(200).json({ message: 'Workout deleted' })

})

module.exports = { getAllWorkoutsForUser, createNewWorkout, updateWorkout, deleteWorkout }