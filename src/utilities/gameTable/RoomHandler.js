// RoomHandler.js

const mongoose = require('mongoose');
const PlayingRoom = require('../../modules/playingroom/playingRoom.model'); // Update the path accordingly
const GameHands = require('../../models/hands.model.js'); // Update the path accordingly
const { shuffleCards, } = require('./shuffleCards.js');
const checkIsTurn = require('./checkIsTrun.js');
const checkIsBotTrumpSelection = require('../botTable/checkisTrumpSelection.js')

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
        this.dealerIds = "";
        this.allPlayers = "";

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
            let { dealerId, players } = await this.getPlayers(findedRoom);
            this.dealerIds = dealerId;
            this.allPlayers = players
            if (findedRoom) {
                console.log('in findedRoom');
                if (findedRoom.status === 'shuffling' && !this.playingRoom.includes(findedRoom._id)) {
                    this.io.to(data.roomId).emit('PlayerJoined', { roomData: players });
                    await this.delay(3000);
                    await this.initializeRoom(findedRoom);
                } else {
                    this.io.to(data.roomId).emit('roomUpdates', { roomData: findedRoom });
                    this.io.to(data.roomId).emit('PlayerJoined', { roomData: players });
                }
            }
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async initializeRoom(findedRoom) {
        this.playingRoom.push(findedRoom._id);
        // await clearAllreadyDrawnCards();
        findedRoom.teamOne[0].isDealer = true;
        const shufflecards = new shuffleCards();
        const dealtCards = await shufflecards.dealCards();
        const [teamOneUpdated, teamTwoUpdated] = await Promise.all([
            this.updateTeamCards(findedRoom.teamOne, null, dealtCards, 0),
            this.updateTeamCards(findedRoom.teamTwo, 0, dealtCards, 2)
        ]);

        findedRoom.status = 'playing';
        findedRoom.totalCards = dealtCards.trumpSelectionCards;
        findedRoom.teamOne = teamOneUpdated;
        findedRoom.teamTwo = teamTwoUpdated;
        this.alreadyDrawnCards = [];
        const payload = {
            roomId: findedRoom._id,
            teamOne: findedRoom.teamOne,
            teamTwo: findedRoom.teamTwo,
        }

        const handCreated = await GameHands.create(payload);
        if (handCreated) {
            console.log('handcreated', handCreated)

            findedRoom.handId = handCreated._id
        }
        console.log('updated finded room', findedRoom)
        await findedRoom.save();
        let { dealerId, players } = await this.getPlayers(findedRoom);
        let isTurnData = await checkIsTurn(findedRoom.teamOne, findedRoom.teamTwo);
        let InitializeRound = {
            players: players,
            kitty: findedRoom.totalCards,
            dealerId: dealerId
        }
        let NotifyTrumpSelectorPlayer = {
            userId: isTurnData.userId,
            trumpRound: 0,
            disabledSuite: ''
        }
        let next = {
            nextTurnId: isTurnData.userId,
            isPlayingAlone: isTurnData.isPlayingAlone
        }
        this.io.to(findedRoom._id.toString()).emit('InitializeRound', { roomData: InitializeRound });
        // this.io.to(findedRoom._id.toString()).emit('NextTurn', { roomData: next });
        await this.delay(5000);
        this.io.to(findedRoom._id.toString()).emit('NotifyTrumpSelectorPlayer', { roomData: NotifyTrumpSelectorPlayer });
        this.io.to(findedRoom._id.toString()).emit('roomUpdates', { roomData: findedRoom });
        await this.client.set(findedRoom._id.toString(), JSON.stringify(findedRoom));
        const updatedRoom = await checkIsBotTrumpSelection(findedRoom, this.io, findedRoom._id.toString())
        await this.client.set(findedRoom._id.toString(), JSON.stringify(updatedRoom));
        const index = this.playingRoom.indexOf(findedRoom._id);
        if (index > -1) {
            this.playingRoom.splice(index, 1); // Remove the ID from the array
        }
    }
    async getPlayers(findedRoom) {
        let dealerId = null;

        const playersPromises = findedRoom.players.map(async (player) => {
            let matchedPlayer = null;
            const playerUserId = player.UserId;
            findedRoom.teamOne.find((e, index) => {
                if (e.isDealer) {
                    dealerId = e.UserId;
                }
                if (e.UserId === playerUserId) {
                    matchedPlayer = { ...e, indexInTeam: index, team: 'teamOne' };
                    return true;
                }
                return false;
            });

            if (!matchedPlayer || matchedPlayer == null) {
                findedRoom.teamTwo.find((e, index) => {
                    console.log('is in team two  ', index)
                    if (e.isDealer) {
                        dealerId = e.UserId;
                    }
                    if (e.UserId === playerUserId) {
                        matchedPlayer = { ...e, indexInTeam: index, team: 'teamTwo' };
                        return true;
                    }
                    return false;
                });
            }

            return matchedPlayer || null;
        });

        const playersResults = await Promise.all(playersPromises);

        const filteredPlayers = playersResults.filter((player) => player !== null);

        // Return both the dealerId and the filtered players
        return {
            dealerId,
            players: filteredPlayers
        };
    }



    async updateTeamCards(team, turnIndex, dealtCards, adistional) {

        console.log('dealtCards', dealtCards)
        this.totalCard = dealtCards.trumpSelectionCards;
        return Promise.all(team.map(async (gamer, index) => {
            if (!gamer.cards || gamer.cards.length === 0) {
                const indexNumber = await adistional ? `player${adistional + index + 1}` : `player${index + 1}`
                const card = dealtCards.players[indexNumber];

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

}

module.exports = RoomHandler;
