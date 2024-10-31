const mongoose = require('mongoose');
const client = require('../redisClient');  // Adjust the path to your Redis client as needed
const PlayingRoom = require('../../modules/playingroom/playingRoom.model');
const checkIsTurn = require('./checkIsTrun');
const checkIsBotTurn = require('../botTable/checkisBotTurn');
class PlayAloneHandler {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;

    this.socket.on('playAlone', this.handlePlayAlone.bind(this));
  }

  async handlePlayAlone(e) {
    console.log('play alone called');
    let data = typeof e === 'string' ? JSON.parse(e) : e;
    data = typeof data === 'string' ? JSON.parse(data) : data;
    let playAlone = 1;
    const action = 'Play Alone';
    const roomId = data.roomId;
    const userId = data.userId;

    let findedRoom = await this.getRoomData(roomId);

    if (!findedRoom) {
      findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
    }

    if (findedRoom) {
      this.updateRoomState(findedRoom, userId);
      console.log('updated findedroom for alone', findedRoom);

      
      let NotifyAloneOrTeam = {
        userId,
        playingStatus: playAlone
      }
     
      let isTurnData = await checkIsTurn(findedRoom.teamOne, findedRoom.teamTwo);
      let next = {
        nextTurnId: isTurnData.userId,
        isPlayingAlone: isTurnData.isPlayingAlone
      };
      findedRoom.teamOne = isTurnData.teamOne
      findedRoom.teamTwo = isTurnData.teamTwo
      this.io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
      this.io.to(roomId).emit('NotifyAloneOrTeam', { roomData: NotifyAloneOrTeam });
      this.io.to(roomId).emit('lastAction', { action, userId });
      this.io.to(roomId).emit('NextTurn', { roomData: next });
      await client.set(roomId, JSON.stringify(findedRoom));
      const updatedRoom = await checkIsBotTurn(findedRoom, this.io, roomId)
      const updateClient = await client.set(roomId, JSON.stringify(updatedRoom));
      if (updateClient !== 'OK') {
        await PlayingRoom.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(roomId) },  // Filter condition
          findedRoom,              // Update data
          { new: true }                                  // Options
        );
      }
    }
  }

  async getRoomData(roomId) {
    let roomData = await client.get(roomId);
    if (typeof roomData === 'string') {
      roomData = JSON.parse(roomData);
    }
    return roomData;
  }

  updateRoomState(room, userId) {
    const playerInTeamOne = room.teamOne.find(player => player.UserId === userId);
    const playerInTeamTwo = room.teamTwo.find(player => player.UserId === userId);

    if (playerInTeamOne) {
      room.teamOne.forEach(player => {
        if (player.UserId !== userId) {
          player.isPartnerPlayingAlone = true;
          player.cards = [0, 0, 0, 0, 0];
        } else {
          player.isPlayAlone = true;
        }
      });
    } else if (playerInTeamTwo) {
      room.teamTwo.forEach(player => {
        if (player.UserId !== userId) {
          player.isPartnerPlayingAlone = true;
          player.cards = [0, 0, 0, 0, 0];
        } else {
          player.isPlayAlone = true;
        }
      });
    }
  }
}

module.exports = PlayAloneHandler;
