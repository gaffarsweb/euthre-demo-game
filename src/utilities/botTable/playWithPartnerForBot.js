const checkIsBotTurn = require("./checkisBotTurn");
const checkIsTurn = require("./checkIsTrun");


const playWithPartner = async (findedRoomData, roomId, userId, io) => {
    try {
        console.log('playing parter for bot')
        let action = 'Playing With Partner';
        let playAlone = 0

        let findedRoom = findedRoomData;


        io.to(roomId).emit('lastAction', { action, userId });
        let NotifyAloneOrTeam = {
            userId,
            playingStatus: playAlone
        }
        io.to(roomId).emit('NotifyAloneOrTeam', { roomData: NotifyAloneOrTeam });

        let isTurnData = await checkIsTurn(findedRoom.teamOne, findedRoom.teamTwo);
        let next = {
            nextTurnId: isTurnData.userId,
            isPlayingAlone: isTurnData.isPlayingAlone
        }
        io.to(roomId).emit('NextTurn', { roomData: next });
        const updatedRoom = await checkIsBotTurn(findedRoom, io, roomId)
        findedRoom = updatedRoom;

        return findedRoom

    } catch (error) {
        console.error(error)
    }
};

module.exports = playWithPartner;


