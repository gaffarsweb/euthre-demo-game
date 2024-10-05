const mongoose = require('mongoose');
const status = ['finding', 'playing', 'complete'];
const playingroomSchema = new mongoose.Schema(
    {

        players: {
            type: Array,
            default: [
                {
                    userName: { type: String, required: true },
                    email: { type: String, default: '' },
                    value: { type: String, default: '' }
                }
            ]
        },
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