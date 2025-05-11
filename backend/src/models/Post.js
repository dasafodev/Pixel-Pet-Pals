const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const postSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    imageUrls: { // Renamed from imageUrl to imageUrls for clarity
        type: [String], // Array of strings for multiple image paths
        validate: [arrayLimit, '{PATH} exceeds the limit of 9 images']
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); // timestamps will automatically manage createdAt and updatedAt

// Validator for limiting the number of images
function arrayLimit(val) {
  return val.length <= 9;
}

module.exports = mongoose.model('Post', postSchema);
