const checkIsLastCardThrow = require("../checkIslastCard");
const client = require("../redisClient");
const { addTimePlayersIsTurn } = require("../timerTable/addTimeInPlayers");
let checkIsTimeOutTurn;
const { getTimePlus30Seconds } = require("../timerTable/setTimer");
const checkIsBotTurn = require("./checkisBotTurn");
const checkIsTurn = require("./checkIsTrun");
const loadModule = async () => {
    checkIsTimeOutTurn = await require("../timerTable/checkIsTimeOutTurn");
};

// setTimeout(async () => {

// await loadModule();
//     console.log('checkIsTimeOutTurn',checkIsTimeOutTurn)
// }, 3100); // 31 seconds timer

const playWithPartner = async (findedRoomData, roomId, userId, io) => {
    try {
        console.log('play with partern aur alone')
        let action = 'Playing With Partner';
        let playAlone = 0

        let findedRoom = findedRoomData;


        io.to(roomId).emit('lastAction', { action, userId });
        let NotifyAloneOrTeam = {
            userId,
            playingStatus: playAlone,
            trumpSuit: findedRoom.trumpSuit
        }
        io.to(roomId).emit('NotifyAloneOrTeam', { roomData: NotifyAloneOrTeam });

        const timeOut = await getTimePlus30Seconds();
        let isTurnData = await checkIsTurn(findedRoom.teamOne, findedRoom.teamTwo, 0, timeOut);
        findedRoom.teamOne = isTurnData.teamOne;
        findedRoom.teamTwo = isTurnData.teamTwo;
        let next = {
            nextTurnId: isTurnData.userId,
            isPlayingAlone: isTurnData.isPlayingAlone,
            timeOut, timerCount: 30,
            leadSuit: findedRoom.playedCards.length > 0 && findedRoom.playedCards[0].card ? findedRoom.playedCards[0].card : '',
            trumpSuit: findedRoom.trumpSuit

        }
        io.to(roomId).emit('NextTurn', { roomData: next });
        const addedTimeOut = await addTimePlayersIsTurn(findedRoom.teamOne, findedRoom.teamTwo, isTurnData.userId, timeOut)
        console.log('in addedTimeOut', addedTimeOut)
        findedRoom.teamOne = addedTimeOut.teamOne;
        findedRoom.teamTwo = addedTimeOut.teamTwo;
        let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId)
        updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, isTurnData.userId)
        await client.json.set(roomId, '$', updatedRoom);
        setTimeout(async () => {
            await loadModule();
            console.log('in turn timeout function')
            await checkIsTimeOutTurn(findedRoom, io, roomId, isTurnData.userId)
        }, 31000); // 40 seconds timer
        findedRoom = updatedRoom;


        await client.json.set(roomId, '$', findedRoom);

        return findedRoom

    } catch (error) {
        console.error(error)
    }
};

module.exports = playWithPartner;


