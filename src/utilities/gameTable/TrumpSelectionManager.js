const mongoose = require('mongoose');
const PlayingRoom = require('../../modules/playingroom/playingRoom.model'); // Adjust the import path as needed
const reciveTrumpSelectedCard = require('./reciveTrumpSelectedCard');
const removedCard = require('./removedCard');
const { getTrumpSuitFromSelectBTN } = require('./getLeadSuit');
const { cehckTrumShow } = require('./passTrumpBox');
const checkIsTurn = require('./checkIsTrun');
const checkIsBotDealer = require('../botTable/checkIsBotDealer');
const checkIsBotTurn = require('../botTable/checkisBotTurn');
const checkIsBotTrumpSelectionForPlayAlone = require('../botTable/checkIsPlayAlonSelectionWithTrumpBox');

class TrumpSelectionManager {
    constructor(io, client, socket) {
        this.io = io;
        this.client = client;
        this.socket = socket;

        this.initializeSocketEvents();
    }

    initializeSocketEvents() {
        this.socket.on('TrumpCardSuitSelected', async (e) => this.handleCallSuiteSelection(e));
        this.socket.on('TrumpSelected', async (e) => this.handleOrderUp(e));
        this.socket.on('removeExtraCard', async (e) => this.handleRemoveExtraCard(e));
    }

    async handleCallSuiteSelection(e) {
        console.log("Round 2")
        let data = e;
        let action = 2;

        if (typeof e === 'string') {
            data = JSON.parse(e);
        }

        if (typeof data === 'string') {
            data = JSON.parse(data);
        }

        const { roomId, card: selectedCard } = data;
        console.log("your selected card: ", selectedCard);
        if (roomId) {
            let findedRoom = await this.client.get(roomId);

            console.log('passtrumpbox client', findedRoom);
            if (typeof findedRoom === 'string') {
                findedRoom = JSON.parse(findedRoom);
            }
            let preTrupRound = 0;
            let { teamOne, teamTwo, trumpRound, userId } = await cehckTrumShow(
                findedRoom.teamOne,
                findedRoom.teamTwo,
                findedRoom.trumpRound
            );
            findedRoom.teamOne = teamOne;
            findedRoom.teamTwo = teamTwo;


            console.log('ged userid', userId)

            preTrupRound = findedRoom.trumpRound
            findedRoom.trumpSuit = selectedCard;
            findedRoom.trumpRound = 0;
            findedRoom.isTrumpSelected = true;
            findedRoom.isStarted = true;
            console.log("finded trump: ", findedRoom.trumpSuit)

            const clients = this.io.sockets.adapter.rooms.get(roomId);
            console.log(clients ? 'Clients in room:' : 'No clients in the room', [...(clients || [])]);
            let orderPassCell = {
                action,
                Suite: selectedCard,
                trumpRound: preTrupRound !== 0 ? preTrupRound : findedRoom.trumpRound,
                userId
            }
            let isTurnData = await checkIsTurn(findedRoom.teamOne, findedRoom.teamTwo);


            this.io.to(roomId).emit('OrderPassCall', { OrderUpdate: orderPassCell });
            this.io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
            this.io.to(roomId).emit('lastAction', { action, userId });
            // let next = {
            //     nextTurnId: isTurnData.userId,
            //     isPlayingAlone: isTurnData.isPlayingAlone
            // }
            // this.io.to(roomId).emit('NextTurn', { roomData: next });
            let askteamPlayerId = {
                AskTeamOrAloneId: userId
            }
            this.io.to(roomId).emit('AskTeamOrAlone', { roomData: askteamPlayerId });

            let PrevTrumpshowUserId;
        for (let i = 0; i < findedRoom.teamOne.length; i++) {
            if(findedRoom.teamOne[i].isTrumpShow) PrevTrumpshowUserId = findedRoom.teamOne[i].UserId;
            findedRoom.teamOne[i].isTrumpShow = false;
        }
        for (let i = 0; i < findedRoom.teamTwo.length; i++) {
            if(findedRoom.teamTwo[i].isTrumpShow) PrevTrumpshowUserId = findedRoom.teamTwo[i].UserId;
            findedRoom.teamTwo[i].isTrumpShow = false;
        }

            console.log("action: ", action, userId);
            let updateClient = await this.client.set(roomId, JSON.stringify(findedRoom));
            const updatedRoom = await checkIsBotTrumpSelectionForPlayAlone(findedRoom, roomId, PrevTrumpshowUserId, this.io)
            updateClient = await this.client.set(roomId, JSON.stringify(updatedRoom));

            console.log('Update client status:', updateClient);

            if (updateClient !== 'OK') {
                await PlayingRoom.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(roomId) },
                    { trumpSuit: selectedCard, isTrumpSelected: true, trumpRound: 0, isStarted: true },
                    { new: true }
                );
            }
            console.log('Emitted updates');
        }
    }

    async handleOrderUp(e) {
        console.log("Round 1")
        let data = e;
        let action = 1;
        if (typeof e === 'string') {
            data = JSON.parse(e);
        }

        if (typeof data === 'string') {
            data = JSON.parse(data);
        }

        const { roomId, selectedCard } = data;
        let selectedCardSuit = selectedCard;
        if (selectedCard.length >= 2) {
            console.log('inn if leng condition')
            selectedCardSuit = getTrumpSuitFromSelectBTN(selectedCard)
        }


        let findedRoom = await this.client.get(roomId);
        console.log('passtrumpbox client', findedRoom);
        if (typeof findedRoom === 'string') {
            findedRoom = JSON.parse(findedRoom);
        }
        if (!findedRoom) {
            findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
        }

        const { teamOnes, teamTwos, dealerId } = await reciveTrumpSelectedCard(findedRoom.teamOne, findedRoom.teamTwo, selectedCard);
        console.log('card recived')
        if (roomId) {
            let preTrupRound = 0;
            let { teamOne, teamTwo, trumpRound, userId } = await cehckTrumShow(
                teamOnes,
                teamTwos,
                findedRoom.trumpRound
            );


            console.log('ged userid', userId)
            preTrupRound = findedRoom.trumpRound;
            findedRoom.teamOne = teamOne;
            findedRoom.teamTwo = teamTwo;
            findedRoom.trumpSuit = selectedCardSuit.suit ? selectedCardSuit.suit : selectedCard;
            findedRoom.isTrumpSelected = true;
            findedRoom.trumpRound = 0;
            findedRoom.isStarted = true;

            const clients = this.io.sockets.adapter.rooms.get(roomId);
            console.log(clients ? 'Clients in room:' : 'No clients in the room', [...(clients || [])]);
            let isTurnData = await checkIsTurn(findedRoom.teamOne, findedRoom.teamTwo);
            let orderPassCell = {
                action,
                Suite: selectedCard,
                trumpRound: preTrupRound !== 0 ? preTrupRound : findedRoom.trumpRound,
                userId
            }

            this.io.to(roomId).emit('OrderPassCall', { OrderUpdate: orderPassCell });
            this.io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
            this.io.to(roomId).emit('lastAction', { action, userId });
            this.io.to(roomId).emit('NotifyDealerRemove', { roomData: dealerId });
            // let next = {
            //     nextTurnId: isTurnData.userId,
            //     isPlayingAlone: isTurnData.isPlayingAlone
            // }
            // this.io.to(roomId).emit('NextTurn', { roomData: next });
            await this.client.set(roomId, JSON.stringify(findedRoom));
            const updatedRom = await checkIsBotDealer(findedRoom, roomId, this.io);
            const updateClient = await this.client.set(roomId, JSON.stringify(updatedRom));
            console.log('Update client status:', updateClient);

            if (updateClient !== 'OK') {
                await PlayingRoom.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(roomId) },
                    { trumpSuit: selectedCard, isTrumpSelected: true, teamOne: findedRoom.teamOne, teamTwo: findedRoom.teamTwo, trumpRound: 0, isStarted: true },
                    { new: true }
                );
            }
            console.log('Emitted updates');
        }
    }

    async handleRemoveExtraCard(e) {
        console.log("Remove Card Called")
        let data = e;
        let action = 3;
        if (typeof e === 'string') {
            data = JSON.parse(e);
        }

        if (typeof data === 'string') {
            data = JSON.parse(data);
        }

        const { roomId, card: removedCardSelected } = data;

        let findedRoom = await this.client.get(roomId);
        console.log('passtrumpbox client', findedRoom);
        if (typeof findedRoom === 'string') {
            findedRoom = JSON.parse(findedRoom);
        }
        if (!findedRoom) {
            findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
        }

        const { teamOne, teamTwo, userId, AskTeamOrAloneId } = await removedCard(findedRoom.teamOne, findedRoom.teamTwo, removedCardSelected);
        findedRoom.teamOne = teamOne;
        findedRoom.teamTwo = teamTwo;
        findedRoom.isStarted = true;
        console.log('ged userid', userId)
        let removedCardOBJ = {
            action,
            removedCard: removedCardSelected,
            userId
        }

        if (roomId) {
            const clients = this.io.sockets.adapter.rooms.get(roomId);
            let isTurnData = await checkIsTurn(findedRoom.teamOne, findedRoom.teamTwo);

            console.log(clients ? 'Clients in room:' : 'No clients in the room', [...(clients || [])]);

            this.io.to(roomId).emit('RemovedCard', { roomData: removedCardOBJ });
            this.io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
            this.io.to(roomId).emit('lastAction', { action, userId });
            let askteamPlayerId = {
                AskTeamOrAloneId: AskTeamOrAloneId
            }
            this.io.to(roomId).emit('AskTeamOrAlone', { roomData: askteamPlayerId });

            // let next = {
            //     nextTurnId: isTurnData.userId,
            //     isPlayingAlone: isTurnData.isPlayingAlone
            // }
            // this.io.to(roomId).emit('NextTurn', { roomData: next });
            let PrevTrumpshowUserId;
            for (let i = 0; i < findedRoom.teamOne.length; i++) {
                if (findedRoom.teamOne[i].isTrumpShow) PrevTrumpshowUserId = findedRoom.teamOne[i].UserId;
                findedRoom.teamOne[i].isTrumpShow = false;
            }
            for (let i = 0; i < findedRoom.teamTwo.length; i++) {
                if (findedRoom.teamTwo[i].isTrumpShow) PrevTrumpshowUserId = findedRoom.teamTwo[i].UserId;
                findedRoom.teamTwo[i].isTrumpShow = false;
            }
            await this.client.set(roomId, JSON.stringify(findedRoom));
            const updatedRoom = await checkIsBotTrumpSelectionForPlayAlone(findedRoom, roomId, PrevTrumpshowUserId, this.io)
            const updateClient = await this.client.set(roomId, JSON.stringify(updatedRoom));
            console.log('Update client status:', updateClient);

            if (updateClient !== 'OK') {
                await PlayingRoom.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(roomId) },
                    { teamOne: findedRoom.teamOne, teamTwo: findedRoom.teamTwo, isStarted: true },
                    { new: true }
                );
            }
            console.log('Emitted updates');
        }
    }
}

module.exports = TrumpSelectionManager;
