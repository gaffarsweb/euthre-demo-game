
const createDealer = require("./createDealer.js");
const findTrickWinner = require("./findeWinner.js");
const { getLeadSuit } = require("./getLeadSuit.js");
const parseCards = require("./parseCards.js");
const parseTrumCard = require("./parseTrumCard.js");
const { shuffleCards } = require("./shuffleCards.js");
const GameRounds = require("../../models/rounds.model.js");
const GameHands = require("../../models/hands.model.js");
const { default: mongoose } = require("mongoose");
const PlayingRoom = require("../../modules/playingroom/playingRoom.model.js");
const checkIsTurn = require("./checkIsTrun.js");
let checkIsBotTrumpSelection;

const loadModule = async () => {
    checkIsBotTrumpSelection = await import("./checkisTrumpSelection.js");
    console.log('checkIsBotTrumpSelection', checkIsBotTrumpSelection);
};


class GameManager {
    constructor(findedRoom, io) {
        this.findedRoom = findedRoom;
        this.io = io;
    }

    async playerOne() {
        let sendNextTurn = true;
        let lastTrickUpdate = {};
        let allPlayers = [this.findedRoom.teamOne[0], this.findedRoom.teamTwo[0], this.findedRoom.teamOne[1], this.findedRoom.teamTwo[1]];
        const parsedCards = await parseCards(this.findedRoom.playedCards);
        const trumpSuit = parseTrumCard(this.findedRoom.trumpSuit);
        const leadSuit = getLeadSuit(this.findedRoom.playedCards[0].card);
        console.log('trump shoietsss', trumpSuit)
        console.log('leadSuit', leadSuit)
        // const TrickWinner = new findTrickWinner(trumpSuit.suit);
        console.log('parsed cards in winner fun', parsedCards)
        const winner = findTrickWinner(parsedCards, trumpSuit.suit, leadSuit.suit);
        console.log('winner', winner)
        lastTrickUpdate.winnerId = winner;
        console.log('allPlayers', allPlayers)
        let updatedAllPlayers = await Promise.all(
            allPlayers.map(async (player) => {
                player.isTrumpShow = false;
                if (player.UserId === winner) {
                    return {
                        ...player,
                        points: (player.points || 0) + 1,
                        isTurn: true,
                        isTrumpShow: true
                    };
                }
                return player;
            })
        );


        const playerCards = updatedAllPlayers.map((p) => p.cards.every(card => card === 0));
        const allTrue = playerCards.every(c => c === true);

        this.findedRoom.teamOne = [updatedAllPlayers[0], updatedAllPlayers[2]];
        this.findedRoom.teamTwo = [updatedAllPlayers[1], updatedAllPlayers[3]];

        this.findedRoom.teamOnePoints = {
            trikPoint: this.findedRoom.teamOnePoints?.trikPoint || 0,
            winningPoint: this.findedRoom.teamOnePoints?.winningPoint || 0,
            increasedWinningPoint: this.findedRoom.teamOnePoints?.increasedWinningPoint || 0,
            playerOneUserId: this.findedRoom.teamOne[0].UserId,
            playerTwoUserId: this.findedRoom.teamOne[1].UserId,
            isWinner: false
        };

        this.findedRoom.teamTwoPoints = {
            trikPoint: this.findedRoom.teamTwoPoints?.trikPoint || 0,
            winningPoint: this.findedRoom.teamTwoPoints?.winningPoint || 0,
            increasedWinningPoint: this.findedRoom.teamTwoPoints?.increasedWinningPoint || 0,
            playerOneUserId: this.findedRoom.teamTwo[0].UserId,
            playerTwoUserId: this.findedRoom.teamTwo[1].UserId,
            isWinner: false
        };

        let teamOneTrikPoint = 0;
        let teamTwoTrikPoint = 0;

        Promise.all([
            this.findedRoom.teamOne.map((e) => {
                teamOneTrikPoint += e.points || 0; // Add points if they exist, otherwise add 0
            }),
            this.findedRoom.teamTwo.map((e) => {
                teamTwoTrikPoint += e.points || 0; // Add points if they exist, otherwise add 0
            })
        ]).then(() => {
            console.log("Total points calculated for both teams");
            console.log("Team One Points:", teamOneTrikPoint);
            console.log("Team Two Points:", teamTwoTrikPoint);
        }).catch((error) => {
            console.error("Error calculating points:", error);
        });

        this.findedRoom.lastPlayedCards = this.findedRoom.playedCards;
        const payload = {
            playedCards: this.findedRoom.playedCards,
            status: 'complete',
            roomId: this.findedRoom._id,
            handId: this.findedRoom.handId,
            players: this.findedRoom.players,
            teamOne: this.findedRoom.teamOne,
            teamTwo: this.findedRoom.teamTwo,
            trumpSuit: this.findedRoom.trumpSuit,
            isRoundWinnerId: winner,
        }
        await GameRounds.create(payload);
        this.findedRoom.playedCards = [];

        this.findedRoom.teamOnePoints.trikPoint = teamOneTrikPoint;
        this.findedRoom.teamTwoPoints.trikPoint = teamTwoTrikPoint;

        let { userId, isPlayingAlone } = await checkIsTurn(this.findedRoom.teamOne, this.findedRoom.teamTwo);

        if (this.findedRoom.playedCards.length == 0 && allTrue) {
            sendNextTurn = false;
            let isHandWinner = '';
            let isRoundEnd = false;
            if (this.findedRoom.teamOnePoints.trikPoint >= 4) {
                isHandWinner = 'teamOne';
                isRoundEnd = true;
                lastTrickUpdate.teamOneTrikPoint = this.findedRoom.teamOnePoints.trikPoint;
                this.findedRoom.teamOnePoints.winningPoint = this.findedRoom.teamOnePoints.winningPoint ? this.findedRoom.teamOnePoints.winningPoint + 2 : 2;
                this.findedRoom.teamOnePoints.increasedWinningPoint = 2;
                this.findedRoom.teamOnePoints.trikPoint = 0;
            } else if (this.findedRoom.teamOnePoints.trikPoint == 3) {
                isHandWinner = 'teamOne';
                isRoundEnd = true;
                lastTrickUpdate.teamOneTrikPoint = this.findedRoom.teamOnePoints.trikPoint;
                this.findedRoom.teamOnePoints.winningPoint = this.findedRoom.teamOnePoints.winningPoint ? this.findedRoom.teamOnePoints.winningPoint + 1 : 1;
                this.findedRoom.teamOnePoints.increasedWinningPoint = 1;
                this.findedRoom.teamOnePoints.trikPoint = 0;
            } else if (this.findedRoom.teamOnePoints.trikPoint < 3) {
                isRoundEnd = true;
                lastTrickUpdate.teamOneTrikPoint = this.findedRoom.teamOnePoints.trikPoint;
                this.findedRoom.teamOnePoints.winningPoint = this.findedRoom.teamOnePoints.winningPoint ? this.findedRoom.teamOnePoints.winningPoint : 0;
                this.findedRoom.teamOnePoints.increasedWinningPoint = 0;
                this.findedRoom.teamOnePoints.trikPoint = 0;
            }
            if (this.findedRoom.teamTwoPoints.trikPoint >= 4) {
                isHandWinner = 'teamTwo';
                isRoundEnd = true;
                lastTrickUpdate.teamTwoTrikPoint = this.findedRoom.teamTwoPoints.trikPoint;
                this.findedRoom.teamTwoPoints.winningPoint = this.findedRoom.teamTwoPoints.winningPoint ? this.findedRoom.teamTwoPoints.winningPoint + 2 : 2;
                this.findedRoom.teamTwoPoints.increasedWinningPoint = 2;
                this.findedRoom.teamTwoPoints.trikPoint = 0;
            } else if (this.findedRoom.teamTwoPoints.trikPoint == 3) {
                isHandWinner = 'teamTwo';
                isRoundEnd = true;
                lastTrickUpdate.teamTwoTrikPoint = this.findedRoom.teamTwoPoints.trikPoint;
                this.findedRoom.teamTwoPoints.winningPoint = this.findedRoom.teamTwoPoints.winningPoint ? this.findedRoom.teamTwoPoints.winningPoint + 1 : 1;
                this.findedRoom.teamTwoPoints.increasedWinningPoint = 1;
                this.findedRoom.teamTwoPoints.trikPoint = 0;
            } else if (this.findedRoom.teamTwoPoints.trikPoint < 3) {
                isRoundEnd = true;
                lastTrickUpdate.teamTwoTrikPoint = this.findedRoom.teamTwoPoints.trikPoint;
                this.findedRoom.teamTwoPoints.winningPoint = this.findedRoom.teamTwoPoints.winningPoint ? this.findedRoom.teamTwoPoints.winningPoint : 0;
                this.findedRoom.teamTwoPoints.increasedWinningPoint = 0;
                this.findedRoom.teamTwoPoints.trikPoint = 0;
            }
            this.findedRoom.teamOne.forEach((player) => {
                player.lastPoints = player.points;
                player.points = 0;
            });

            this.findedRoom.teamTwo.forEach((player) => {
                player.lastPoints = player.points;
                player.points = 0;
            });
            const payload = {
                teamOne: this.findedRoom.teamOne,
                teamTwo: this.findedRoom.teamTwo,
                teamOnePoints: this.findedRoom.teamOnePoints,
                teamTwoPoints: this.findedRoom.teamTwoPoints,
                status: 'complete',
                isHandWinner,


            }
            console.log('last pointes of the team ', this.findedRoom)

            await GameHands.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(this.findedRoom.handId) },
                { $set: payload },
                { new: true }
            );
            if (this.findedRoom.teamOnePoints.winningPoint >= 10) {
                this.findedRoom.teamOnePoints.isWinner = true;
                this.findedRoom.status = 'complete';
                this.findedRoom.isWinner = 'teamOne';
                let RoundEndResult = {
                    isRoundWinner: isHandWinner,
                    teamOnePoints: this.findedRoom.teamOnePoints,
                    teamTwoPoints: this.findedRoom.teamTwoPoints,
                }
                if (isRoundEnd) {
                    this.io.to(this.findedRoom._id.toString()).emit('RoundEndResult', { roomData: RoundEndResult });
                }
                let trickEndResult = {
                    teamOnePoints: this.findedRoom.teamOnePoints,
                    teamTwoPoints: this.findedRoom.teamTwoPoints,
                    trickWinnerUserId: winner
                }
                this.io.to(this.findedRoom._id.toString()).emit('TrickEndResult', { roomData: trickEndResult });
                return { udpatedFindedRooom: this.findedRoom, lastTrickUpdate }
            }
            if (this.findedRoom.teamTwoPoints.winningPoint >= 10) {
                this.findedRoom.teamTwoPoints.isWinner = true;
                this.findedRoom.status = 'complete';
                this.findedRoom.isWinner = 'teamTwo';
                let RoundEndResult = {
                    isRoundWinner: isHandWinner,
                    teamOnePoints: this.findedRoom.teamOnePoints,
                    teamTwoPoints: this.findedRoom.teamTwoPoints,
                }
                if (isRoundEnd) {
                    this.io.to(this.findedRoom._id.toString()).emit('RoundEndResult', { roomData: RoundEndResult });
                }
                let trickEndResult = {
                    teamOnePoints: this.findedRoom.teamOnePoints,
                    teamTwoPoints: this.findedRoom.teamTwoPoints,
                    trickWinnerUserId: winner
                }
                this.io.to(this.findedRoom._id.toString()).emit('TrickEndResult', { roomData: trickEndResult });
                return { udpatedFindedRooom: this.findedRoom, lastTrickUpdate };
            }

            const { teamOne, teamTwo } = await createDealer(this.findedRoom.teamOne, this.findedRoom.teamTwo);

            console.log('dealoer created')
            await this.updatePlayerCards(teamOne, teamTwo, allTrue);
            console.log('udpatedFindedRooom', this.findedRoom)

            this.findedRoom.isTrumpSelected = false;
            this.findedRoom.isStarted = false;
            this.findedRoom.status = 'playing';

            let { dealerId, players } = await this.getPlayers(this.findedRoom);
            let getUpdatedTurnPlayer = await checkIsTurn(this.findedRoom.teamOne, this.findedRoom.teamTwo);
            userId = getUpdatedTurnPlayer.userId
            isPlayingAlone = getUpdatedTurnPlayer.isPlayingAlone
            let InitializeRound = {
                players,
                kitty: this.findedRoom.totalCards,
                dealerId
            }
            let RoundEndResult = {
                isRoundWinner: isHandWinner,
                teamOnePoints: this.findedRoom.teamOnePoints,
                teamTwoPoints: this.findedRoom.teamTwoPoints,
            }
            let next = {
                nextTurnId: userId,
                isPlayingAlone: isPlayingAlone
            }
            let NotifyTrumpSelectorPlayer = {
                userId: userId,
                trumpRound: 0,
                disabledSuite: ''
            }
            let trickEndResult = {
                teamOnePoints: this.findedRoom.teamOnePoints,
                teamTwoPoints: this.findedRoom.teamTwoPoints,
                trickWinnerUserId: winner
            }

            if (isRoundEnd) {
                this.io.to(this.findedRoom._id.toString()).emit('TrickEndResult', { roomData: trickEndResult });
                this.io.to(this.findedRoom._id.toString()).emit('RoundEndResult', { roomData: RoundEndResult });
                this.io.to(this.findedRoom._id.toString()).emit('InitializeRound', { roomData: InitializeRound });
                this.io.to(this.findedRoom._id.toString()).emit('NotifyTrumpSelectorPlayer', { roomData: NotifyTrumpSelectorPlayer });
                let updatedRoom = this.findedRoom;
                // let updatedRoom = await checkIsBotTrumpSelection(this.findedRoom, this.io, this.findedRoom._id.toString());
                loadModule().then(() => {
                    updatedRoom = checkIsBotTrumpSelection.default(this.findedRoom, this.io, this.findedRoom._id.toString())
                    console.log('in loadmodulesss')
                });
                this.findedRoom = updatedRoom
            } else {
                this.io.to(this.findedRoom._id.toString()).emit('NextTurn', { roomData: next });
            }

            const payloads = {
                roomId: this.findedRoom._id,
                teamOne: this.findedRoom.teamOne,
                teamTwo: this.findedRoom.teamTwo,
            }

            const handCreated = await GameHands.create(payloads);
            if (handCreated) {
                console.log('handcreated', handCreated)

                this.findedRoom.handId = handCreated._id
            }



        }
        let trickEndResult = {
            teamOnePoints: this.findedRoom.teamOnePoints,
            teamTwoPoints: this.findedRoom.teamTwoPoints,
            trickWinnerUserId: winner
        }
        let next = {
            nextTurnId: userId,
            isPlayingAlone: isPlayingAlone
        }
        //chec
        if (sendNextTurn) {
            this.io.to(this.findedRoom._id.toString()).emit('TrickEndResult', { roomData: trickEndResult });
            this.io.to(this.findedRoom._id.toString()).emit('NextTurn', { roomData: next });
        }

        return { udpatedFindedRooom: this.findedRoom, lastTrickUpdate };
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


    async updatePlayerCards(one, two, allTrue) {
        const shufflecards = new shuffleCards();
        const dealtCards = await shufflecards.dealCards();
        const updatedteamOne = await Promise.all(one.map(async (p, index) => {
            if ((!p.cards || p.cards.length === 0) || allTrue) {
                const indexNumber = `player${index + 1}`
                const card = dealtCards.players[indexNumber];
                return { ...p, cards: card, isPlayAlone: false, isPartnerPlayingAlone: false };
            }
            return p;
        }));
        const updatedteamTwo = await Promise.all(two.map(async (p, index) => {
            if ((!p.cards || p.cards.length === 0) || allTrue) {
                const indexNumber = `player${(2 + index) + 1}`
                const card = dealtCards.players[indexNumber];
                return { ...p, cards: card, isPlayAlone: false, isPartnerPlayingAlone: false };
            }
            return p;
        }));

        this.findedRoom.totalCards = dealtCards.trumpSelectionCards;
        this.findedRoom.teamOne = updatedteamOne;
        this.findedRoom.teamTwo = updatedteamTwo;
    }
}

module.exports = { GameManager };
