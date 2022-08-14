const { v4: uuidv4 } = require('uuid');
const Logs = require('../models/Logs');
function createlogs(action, userId) {
    uuid = uuidv4().toString().split('-')[0]
    while (!Logs.findByPk(uuid)) {
        Logs.create({
            logId: uuid, action: action, userId: userId
        });
        uuid = uuidv4().toString().split('-')[0]
    }
    
}

module.exports = createlogs;
