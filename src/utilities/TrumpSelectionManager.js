const mongoose = require('mongoose');
const  PlayingRoom  = require('../modules/playingroom/playingRoom.model'); // Adjust the import path as needed
const reciveTrumpSelectedCard = require('./reciveTrumpSelectedCard');
const removedCard = require('./removedCard');

class TrumpSelectionManager {
    constructor(io, client, socket) {
        this.io = io;
        this.client = client;
        this.socket = socket;

        this.initializeSocketEvents();
    }

    initializeSocketEvents() {
        this.socket.on('TrumpCardSuitSelected', async (e) => this.handleTrumpCardSuitSelected(e));
        this.socket.on('TrumpSelected', async (e) => this.handleTrumpSelected(e));
        this.socket.on('removeExtraCard', async (e) => this.handleRemoveExtraCard(e));
    }

    async handleTrumpCardSuitSelected(e) {
        const { roomId, card: selectedCard } = e;
        if (roomId) {
            let findedRoom = await this.client.get(roomId);
            console.log('passtrumpbox client', findedRoom);
            if (typeof findedRoom === 'string') {
                findedRoom = JSON.parse(findedRoom);
            }

            findedRoom.trumpSuit = selectedCard;
            findedRoom.trumpRound = 0;
            findedRoom.isTrumpSelected = true;
            findedRoom.isStarted = true;

            const clients = this.io.sockets.adapter.rooms.get(roomId);
            console.log(clients ? 'Clients in room:' : 'No clients in the room', [...(clients || [])]);

            this.io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
            const updateClient = await this.client.set(roomId, JSON.stringify(findedRoom));
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

    async handleTrumpSelected(e) {
        const { roomId, selectedCard } = e;

        let findedRoom = await this.client.get(roomId);
        console.log('passtrumpbox client', findedRoom);
        if (typeof findedRoom === 'string') {
            findedRoom = JSON.parse(findedRoom);
        }
        if (!findedRoom) {
            findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
        }

        const { teamOne, teamTwo } = await reciveTrumpSelectedCard(findedRoom.teamOne, findedRoom.teamTwo, selectedCard);

        if (roomId) {
            findedRoom.teamOne = teamOne;
            findedRoom.teamTwo = teamTwo;
            findedRoom.trumpSuit = selectedCard;
            findedRoom.isTrumpSelected = true;
            findedRoom.trumpRound = 0;
            findedRoom.isStarted = true;

            const clients = this.io.sockets.adapter.rooms.get(roomId);
            console.log(clients ? 'Clients in room:' : 'No clients in the room', [...(clients || [])]);

            this.io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
            const updateClient = await this.client.set(roomId, JSON.stringify(findedRoom));
            console.log('Update client status:', updateClient);
            
            if (updateClient !== 'OK') {
                await PlayingRoom.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(roomId) },
                    { trumpSuit: selectedCard, isTrumpSelected: true, teamOne: findedRoom.teamOne, teamTwo: findedRoom.teamTwo, trumpRound: 0, isStarted : true },
                    { new: true }
                );
            }
            console.log('Emitted updates');
        }
    }

    async handleRemoveExtraCard(e) {
        const { roomId, card: removedCardSelected } = e;

        let findedRoom = await this.client.get(roomId);
        console.log('passtrumpbox client', findedRoom);
        if (typeof findedRoom === 'string') {
            findedRoom = JSON.parse(findedRoom);
        }
        if (!findedRoom) {
            findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
        }

        const { teamOne, teamTwo } = await removedCard(findedRoom.teamOne, findedRoom.teamTwo, removedCardSelected);
        findedRoom.teamOne = teamOne;
        findedRoom.teamTwo = teamTwo;
        findedRoom.isStarted = true;

        if (roomId) {
            const clients = this.io.sockets.adapter.rooms.get(roomId);
            console.log(clients ? 'Clients in room:' : 'No clients in the room', [...(clients || [])]);

            this.io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
            const updateClient = await this.client.set(roomId, JSON.stringify(findedRoom));
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
