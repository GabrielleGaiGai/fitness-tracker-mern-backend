const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const getParam = require('../config/getParam')

const verifyJWT = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1]

    const ACCESS_TOKEN_SECRET = await getParam.getParameter("ACCESS_TOKEN_SECRET");
    jwt.verify(token, ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' + err, })
            req.user = decoded.User.username
            req.roles = decoded.User.roles
            req.userId = decoded.User.userId
            next()
        }
    )
})


module.exports = verifyJWT