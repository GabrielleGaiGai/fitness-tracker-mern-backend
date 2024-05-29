const AWS = require('aws-sdk')
const ssm = new AWS.SSM({ region: 'us-east-2' })


const getParameter = async (name) => {
    const params = {
        Name: name,
        WithDecryption: true
    };

    try {
        const result = await ssm.getParameter(params).promise();
        return result.Parameter.Value;;
    } catch (err) {
        console.log(err);
    }
}



module.exports = { getParameter }