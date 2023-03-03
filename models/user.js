const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSechma = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token: String,
    experrationToken: Date
});

module.exports = mongoose.model('User', UserSechma);