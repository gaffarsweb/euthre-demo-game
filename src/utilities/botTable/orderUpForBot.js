const PlayingRoom = require("../../modules/playingroom/playingRoom.model");
const { cehckTrumShow } = require("./passTrumpBox");
const checkIsTurn = require("./checkIsTrun");
const { getTrumpSuitFromSelectBTN } = require("./getLeadSuit");
const reciveTrumpSelectedCard = require("./reciveTrumpSelectedCard");
const client = require("../redisClient");
const checkIsBotDealer = require("./checkIsBotDealer");

const  handleOrderUp = async (e) => {
    console.log("Round 1")
    let data = e;
    let action = 1;

    let { findedRoom, roomId, io, selectedCard } = data;
    let selectedCardSuit = selectedCard;
    if (selectedCard.length >= 2) {
        console.log('inn if leng condition')
        selectedCardSuit = getTrumpSuitFromSelectBTN(selectedCard)
    }

    if (typeof findedRoom === 'string') {
        console.log('in string for bot')
        findedRoom = JSON.parse(findedRoom);
    }

    if (typeof findedRoom === 'string') {
        findedRoom = JSON.parse(findedRoom);
    }
    // let findedRoom = await client.get(roomId);
    console.log('passtrumpbox client', findedRoom);
  

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
        // findedRoom.isStarted = true;

        const clients = io.sockets.adapter.rooms.get(roomId);
        console.log(clients ? 'Clients in room:' : 'No clients in the room', [...(clients || [])]);
        let isTurnData = await checkIsTurn(findedRoom.teamOne, findedRoom.teamTwo);
        let orderPassCell = {
            action,
            Suite: selectedCard,
            trumpRound: preTrupRound !== 0 ? preTrupRound : findedRoom.trumpRound,
            userId
        }

        io.to(roomId).emit('OrderPassCall', { OrderUpdate: orderPassCell });
        io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
        io.to(roomId).emit('lastAction', { action, userId });
        io.to(roomId).emit('NotifyDealerRemove', { roomData: dealerId });
        // let next = {
        //     nextTurnId: isTurnData.userId,
        //     isPlayingAlone: isTurnData.isPlayingAlone
        // }
        // io.to(roomId).emit('NextTurn', { roomData: next });
         await client.set(roomId, JSON.stringify(findedRoom));
        const updatedRom = await checkIsBotDealer(findedRoom, roomId, io);
        const updateClient = await client.set(roomId, JSON.stringify(updatedRom));
        console.log('Update client status:', updateClient);

        if (updateClient !== 'OK') {
            await PlayingRoom.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(roomId) },
                { trumpSuit: selectedCard, isTrumpSelected: true, teamOne: findedRoom.teamOne, teamTwo: findedRoom.teamTwo, trumpRound: 0, isStarted: true },
                { new: true }
            );
        }
        console.log('Emitted updates');
        return findedRoom
    }
};
module.exports = handleOrderUp;