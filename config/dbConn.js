const mongoose = require('mongoose')
const getParam = require('../config/getParam')


const connectDB = async () => {
    try {
        const DATABASE_URI = await getParam.getParameter("DATABASE_URI");
        await mongoose.connect(DATABASE_URI, { dbName: 'fitnessTrackerDB' })
    } catch (err) {
        console.log(err)
    }
}

module.exports = connectDB