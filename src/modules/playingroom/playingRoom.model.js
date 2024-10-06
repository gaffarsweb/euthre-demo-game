const mongoose = require('mongoose');
const status = ['finding', 'playing', 'complete', 'shuffling'];
const playingroomSchema = new mongoose.Schema(
    {

        players: {
            type: Array,
            default: [
                {
                    userName: { type: String, required: true },
                    email: { type: String, default: '' },
                    value: { type: String, default: '' },
                    cards: { type: Array, default: [] },
                    isTurn: { type: Boolean, default: false }
                }
            ]
        },
        totalCards: { type: Array, default: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24] },
        entryFee: {
            type: String,
            default: ''
        },
        gameLevel: {
            type: String,
            default: ''
        },
        active: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            enum: status,
            default: 'finding',
        },
    },
    {
        timestamps: true,
    }
);



// Encrypt password before saving
playingroomSchema.pre('save', async function (next) {
    next();
});

const PlayingRoom = mongoose.model('PlayingRoom', playingroomSchema);

module.exports = PlayingRoom;