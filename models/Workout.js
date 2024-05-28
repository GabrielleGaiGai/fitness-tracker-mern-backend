const mongoose = require('mongoose')

const workoutSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        title: {
            type: String,
            required: true
        },
        duration: {
            type: Number
        },
        distance: {
            type: Number
        },
        weight: {
            type: Number
        },
        set: {
            type: Number
        },
        repetition: {
            type: Number
        },
        date: {
            type: Date,
            default: Date.now
        },
        note: {
            type: String
        },
        completed: {
            type: Boolean,
            default: false
        }
    }
)

module.exports = mongoose.model('Workout', workoutSchema)