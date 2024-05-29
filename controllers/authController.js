const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

const register = asyncHandler(async (req, res) => {
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
        // generate tokens
        const accessToken = jwt.sign(
            { "User": { "username": user.username, "roles": user.roles, "userId": user._id } },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '6h' }
        )

        const refreshToken = jwt.sign(
            { "username": user.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        )

        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 7 * 24 * 60 * 60 * 1000 })
        res.status(201).json({ user, accessToken })
    } else {
        res.status(400).json({ message: 'Failed to create new user' })
    }
})


const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const foundUser = await User.findOne({ username }).exec()

    if (!foundUser) {
        return res.status(401).json({ message: 'Incorrect Username' })
    }

    const match = await bcrypt.compare(password, foundUser.password)
    if (!match) return res.status(401).json({ message: 'Incorrect Password' })

    const accessToken = jwt.sign(
        { "User": { "username": foundUser.username, "roles": foundUser.roles, "userId": foundUser._id } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '6h' }
    )

    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )

    res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 7 * 24 * 60 * 60 * 1000 })
    res.json({ accessToken })
})


const refresh = asyncHandler(async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Session end' })

    const refreshToken = cookies.jwt
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, asyncHandler(async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Forbidden' })

        const foundUser = await User.findOne({ username: decoded.username }).exec()
        if (!foundUser) return res.status(401).json({ message: 'Incorrect username' })

        const accessToken = jwt.sign(
            { "User": { "username": foundUser.username, "roles": foundUser.roles, "userId": foundUser._id } },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '6h' }
        )

        res.json({ accessToken })
    }))
})


const test = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'success' })
})


const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204)
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared' })
}

module.exports = { register, login, refresh, logout, test }
