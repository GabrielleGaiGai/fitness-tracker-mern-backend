const User = require('../models/User')
const Workout = require('../models/Workout')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean()
    if (!users) {
        return res.status(400).json({ message: 'Failed to find users' })
    }
    res.json(users)
})

const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, firstname, lastname, roles, birthday, height, weight } = req.body

    if (!username || !password || !firstname || !lastname || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'Some fields are missing' })
    }

    // check for duplicate username
    const duplicate = await User.findOne({ username }).lean().exec()
    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    // hash password
    const hashedPwd = await bcrypt.hash(password, 10)

    const userObject = { username, firstname, lastname, roles, birthday, height, weight, "password": hashedPwd }
    const user = await User.create(userObject)

    if (user) {
        res.status(201).json({ user })
    } else {
        res.status(400).json({ message: 'Failed to create new user' })
    }
})

const updateUser = asyncHandler(async (req, res) => {
    const { id, username, password, firstname, lastname, roles, birthday, height, weight } = req.body

    if (!id || !username || !firstname || !lastname || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'Some fields are missing' })
    }

    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    } 

    // check for duplicate username
    const duplicate = await User.findOne({ username }).lean().exec()
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    user.username = username
    user.roles = roles
    user.firstname = firstname
    user.lastname = lastname
    user.roles = roles
    user.birthday = birthday
    user.height = height
    user.weight = weight

    if (password) {
        // hash password
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()

    res.json({ updatedUser })
})

const deleteUser = asyncHandler(async (req, res) => {
    const {id} = req.body
    if (!id) {
        return res.status(400).json({ message: 'ID is required' })
    }

    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    } 

    // delete user's workouts
    const deleteWorkoutsRes = await Workout.deleteMany({user: id})

    const deleteUserRes = await user.deleteOne()

    res.json({ message: 'User deleted' })
})

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser }