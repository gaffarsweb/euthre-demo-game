const mongoose = require('mongoose');
const status = ['finding', 'playing', 'complete', 'shuffling'];
const playingroomSchema = new mongoose.Schema(
    {

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
        totalCards: { type: Array, default: ['9h','10h','jh','qh','kh','ah','9d','10d','jd','qd','kd','ad','9c','10c','jc','qc','kc','ac','9s','10s','js','qs','ks','as'] },
        playedCards: { type: Array, default: [] },
        trumpSuit: { type: String, default: '' },
        isTrumpSelected: { type: Boolean, default: false },
        trumpRound: { type: Number, default: 0 },
        isStarted: { type: Boolean, default: false },
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