const { v4: uuidv4 } = require('uuid');
const Logs = require('../models/Logs');
async function createlogs(action, userId) {
    uuid = uuidv4().toString().split('-')[0]
    l = await Logs.findByPk(uuid)
    if (!l) {
        await Logs.create({
            logId: uuid, action: action, userId: userId
        }).then((log) => {
            console.log('log created')
        }).catch(err => console.log(err))
        uuid = uuidv4().toString().split('-')[0]
    }
    
}

module.exports = createlogs;
