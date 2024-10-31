const mongoose = require('mongoose');
const status = ['finding', 'playing', 'complete', 'shuffling'];
const GameHandsSchema = new mongoose.Schema(
    {

        roomId: {
            type: mongoose.Types.ObjectId,
            required:true
        },
        teamOne:{
            type:Array,
            default:[]
        },
        teamOnePoints:{
            type:Object,
            default:{}
        },
        teamTwo:{
            type:Array,
            default:[]
        },
        teamTwoPoints:{
            type:Object,
            default:{}
        },
        active: {
            type: Boolean,
            default: true,
        },
        isHandWinner: {
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
GameHandsSchema.pre('save', async function (next) {
    next();
});

const GameHands = mongoose.model('GameHands', GameHandsSchema);

module.exports = GameHands;