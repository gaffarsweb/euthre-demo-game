const mongoose = require('mongoose');
const status = ['finding', 'playing', 'complete', 'shuffling'];
const GameRoundsSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Types.ObjectId,
            required:true
        },
        handId: {
            type: mongoose.Types.ObjectId,
            required:true
        },
        players: {
            type: Array,
            default: []
        },
        teamOne:{
            type:Array,
            default:[]
        },
        teamTwo:{
            type:Array,
            default:[]
        },
        playedCards: { type: Array, default: [] },
        trumpSuit: { type: String, default: '' },
        active: {
            type: Boolean,
            default: true,
        },
        isRoundWinnerId: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: status,
            default: 'playing',
        },
    },
    {
        timestamps: true,
    }
);



// Encrypt password before saving
GameRoundsSchema.pre('save', async function (next) {
    next();
});

const GameRounds = mongoose.model('GameRounds', GameRoundsSchema);

module.exports = GameRounds;