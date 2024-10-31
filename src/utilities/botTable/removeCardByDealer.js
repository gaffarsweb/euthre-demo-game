const client = require("../redisClient");
const checkIsBotTrumpSelectionForPlayAlone = require("./checkIsPlayAlonSelectionWithTrumpBox");
const checkIsTurn = require("./checkIsTrun");
const removedCard = require("./removedCard");

const handleRemoveExtraCard = async (removedCardSelected, roomId, findedRoom, io) => {
    console.log('in remove extra card')
    let action = 3;

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
        //for check next turn is true for is parter playing alone aur not
        await checkIsTurn(findedRoom.teamOne, findedRoom.teamTwo);


        io.to(roomId).emit('RemovedCard', { roomData: removedCardOBJ });
        io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
        io.to(roomId).emit('lastAction', { action, userId });
        let askteamPlayerId = {
            AskTeamOrAloneId: AskTeamOrAloneId
        }
        io.to(roomId).emit('AskTeamOrAlone', { roomData: askteamPlayerId });

        // let next = {
        //     nextTurnId: isTurnData.userId,
        //     isPlayingAlone: isTurnData.isPlayingAlone
        // }
        // io.to(roomId).emit('NextTurn', { roomData: next });
        let PrevTrumpshowUserId;
        for (let i = 0; i < findedRoom.teamOne.length; i++) {
            if(findedRoom.teamOne[i].isTrumpShow) PrevTrumpshowUserId = findedRoom.teamOne[i].UserId;
            findedRoom.teamOne[i].isTrumpShow = false;
        }
        for (let i = 0; i < findedRoom.teamTwo.length; i++) {
            if(findedRoom.teamTwo[i].isTrumpShow) PrevTrumpshowUserId = findedRoom.teamTwo[i].UserId;
            findedRoom.teamTwo[i].isTrumpShow = false;
        }
        
         await client.set(roomId, JSON.stringify(findedRoom));
        const updatedRoom = await checkIsBotTrumpSelectionForPlayAlone(findedRoom, roomId, PrevTrumpshowUserId, io)
        const updateClient = await client.set(roomId, JSON.stringify(updatedRoom));
        console.log('Update client status:', updateClient);

        console.log('Emitted updates');
        return findedRoom
    }
};
module.exports = handleRemoveExtraCard;