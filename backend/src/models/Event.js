const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    locationName: {
        type: String,
        required: true
    },
    address: { // Optional, can be a general description or specific address
        type: String
    },
    latitude: { // For predefined locations
        type: Number
    },
    longitude: { // For predefined locations
        type: Number
    },
    isPredefined: { // To identify if the location was from our predefined list
        type: Boolean,
        default: false
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); // timestamps will automatically manage createdAt and updatedAt

module.exports = mongoose.model('Event', eventSchema);
