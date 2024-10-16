// RoomHandler.js

const mongoose = require('mongoose');
const PlayingRoom = require('../modules/playingroom/playingRoom.model'); // Update the path accordingly
const { shuffleCards, clearAllreadyDrawnCards } = require('./shuffleCards.js');

class RoomHandler {
    constructor(io, socket, client) {
        this.io = io;
        this.socket = socket;
        this.client = client;
        this.totalCard = [
            '9h', '10h', 'jh', 'qh', 'kh', 'ah',
            '9d', '10d', 'jd', 'qd', 'kd', 'ad',
            '9c', '10c', 'jc', 'qc', 'kc', 'ac',
            '9s', '10s', 'js', 'qs', 'ks', 'as'
        ];
        this.playingRoom = [];
        this.alreadyDrawnCards = [];

        this.socket.on('joinedRoom', this.handleJoinedRoom.bind(this));
    }

    async handleJoinedRoom(e) {
        let data = e;
        console.log("joined ", e);

        if (typeof e === 'string') {
            data = JSON.parse(e);
        }

        if (data.roomId) {
            this.socket.join(data.roomId);
            const findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(data.roomId) });

            if (findedRoom) {
                console.log('in findedRoom');
                if (findedRoom.status === 'shuffling' && !this.playingRoom.includes(findedRoom._id)) {
                    await this.initializeRoom(findedRoom);
                } else {
                    this.io.to(data.roomId).emit('roomUpdates', { roomData: findedRoom });
                }
            }
        }
    }

    async initializeRoom(findedRoom) {
        this.playingRoom.push(findedRoom._id);
        await clearAllreadyDrawnCards();
        findedRoom.teamOne[0].isDealer = true;

        const [teamOneUpdated, teamTwoUpdated] = await Promise.all([
            this.updateTeamCards(findedRoom.teamOne, null),
            this.updateTeamCards(findedRoom.teamTwo, 0)
        ]);

        findedRoom.status = 'playing';
        findedRoom.totalCards = this.totalCard;
        findedRoom.teamOne = teamOneUpdated;
        findedRoom.teamTwo = teamTwoUpdated;
        this.alreadyDrawnCards = [];
        await findedRoom.save();

        this.io.to(findedRoom._id.toString()).emit('roomUpdates', { roomData: findedRoom });
        await this.client.set(findedRoom._id.toString(), JSON.stringify(findedRoom));
        this.resetTotalCard();
    }

    async updateTeamCards(team, turnIndex) {
        return Promise.all(team.map(async (gamer, index) => {
            if (!gamer.cards || gamer.cards.length === 0) {
                const card = await shuffleCards(this.totalCard, 5);
                this.totalCard = this.totalCard.filter(tc => !card.includes(tc));

                return {
                    ...gamer,
                    cards: card,
                    isTurn: index === turnIndex,
                    isTrumpShow: index === turnIndex
                };
            }
            return gamer;
        }));
    }

    resetTotalCard() {
        this.totalCard = [
            '9h', '10h', 'jh', 'qh', 'kh', 'ah',
            '9d', '10d', 'jd', 'qd', 'kd', 'ad',
            '9c', '10c', 'jc', 'qc', 'kc', 'ac',
            '9s', '10s', 'js', 'qs', 'ks', 'as'
        ];
    }
}

module.exports = RoomHandler;
