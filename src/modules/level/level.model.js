const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
    levelName: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    price: {
        type: Number,
        required: true 
    },
    entry: {
        type: Number,
        required: true 
    }

}, {
    timestamps: true,
});


const level = mongoose.model('level', levelSchema);

module.exports = level;
