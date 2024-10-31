const client = require("../redisClient");
const checkIsBotTrumpSelectionForPlayAlone = require("./checkIsPlayAlonSelectionWithTrumpBox");
const { cehckTrumShow } = require("./passTrumpBox");

const handleCallSuiteSelection = async (selectedCard, roomId, io, findedRoom) => {
    console.log("handle bot call suite")
    let action = 2;


    console.log("your selected card: ", selectedCard);
    if (roomId) {
        let preTrupRound = 0;
        let { teamOne, teamTwo, trumpRound, userId } = await cehckTrumShow(
            findedRoom.teamOne,
            findedRoom.teamTwo,
            findedRoom.trumpRound
        );
        findedRoom.teamOne = teamOne;
        findedRoom.teamTwo = teamTwo;


        console.log('ged userid', userId)
        let orderPassCell = {
            action,
            Suite: selectedCard,
            trumpRound: preTrupRound !== 0 ? preTrupRound : findedRoom.trumpRound,
            userId
        }
        preTrupRound = findedRoom.trumpRound
        findedRoom.trumpSuit = selectedCard;
        findedRoom.trumpRound = 0;
        findedRoom.isTrumpSelected = true;
        findedRoom.isStarted = true;
        console.log("finded trump: ", findedRoom.trumpSuit)

        io.to(roomId).emit('OrderPassCall', { OrderUpdate: orderPassCell });
        io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
        io.to(roomId).emit('lastAction', { action, userId });
        // let next = {
        //     nextTurnId: isTurnData.userId,
        //     isPlayingAlone: isTurnData.isPlayingAlone
        // }
        // io.to(roomId).emit('NextTurn', { roomData: next });
        let askteamPlayerId = {
            AskTeamOrAloneId: userId
        }
        io.to(roomId).emit('AskTeamOrAlone', { roomData: askteamPlayerId });

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
         await client.set(roomId, JSON.stringify(findedRoom));
        const updatedRoom = await checkIsBotTrumpSelectionForPlayAlone(findedRoom, roomId, PrevTrumpshowUserId, io)
        // const updatedRoom = await checkIsBotTurn(findedRoom, io, roomId)
        const updateClient = await client.set(roomId, JSON.stringify(updatedRoom));
        console.log('Update client status:', updateClient);

        console.log('Emitted updates');
    }
};
module.exports = handleCallSuiteSelection;