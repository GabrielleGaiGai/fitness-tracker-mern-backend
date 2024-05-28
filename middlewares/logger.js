const {format} = require('date-fns')
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

const logEvents = async (message, logFileName) => {
    const dateTime = format(new Date(), 'yyyy/MM/dd\tHH:mm:ss')
    const logItem = `${dateTime}\t${message}\n`

    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
        }

        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)
    } catch (err){
        console.log(err)
    }
}

const logger = (req, res, next) => {
    const message = `${req.method}\t${req.url}\t${req.header.origin}`
    logEvents(message, 'reqLog.log')
    next()
}

module.exports = {logEvents, logger}