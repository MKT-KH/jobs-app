const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const jobSechema = new Schema({
    company: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Job', jobSechema);