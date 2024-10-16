const passTrumpBox = require("./passTrumpBox");
const { shuffleCards, clearAllreadyDrawnCards } = require("./shuffleCards.js");

// TrumpBoxManager.js
const PlayingRoom = require("../modules/playingroom/playingRoom.model");
const { default: mongoose } = require("mongoose");
const createDealer = require("./createDealer");

class TrumpBoxManager {
  constructor(io, client) {
    this.io = io;
    this.client = client;
  }

  async handlePassTrumpBox(socket, e) {
    const roomId = e.roomId;

    if (roomId) {
      let findedRoom = await this.getRoomData(roomId);

      let { teamOne, teamTwo, trumpRound } = await passTrumpBox(
        findedRoom.teamOne,
        findedRoom.teamTwo,
        findedRoom.trumpRound
      );

      findedRoom.teamOne = teamOne;
      findedRoom.teamTwo = teamTwo;
      findedRoom.trumpRound = trumpRound;

      if (trumpRound === 2) {
        findedRoom = await this.resetRound(findedRoom); // Capture the updated findedRoom
      }
      console.log('totla cardssss befor update', findedRoom)
      this.notifyClients(roomId, findedRoom);
      await this.updateRoomData(roomId, findedRoom);
    }
  }

  async getRoomData(roomId) {
    let findedRoom = await this.client.get(roomId);
    if (typeof findedRoom === 'string') {
      findedRoom = JSON.parse(findedRoom);
    }
    if (!findedRoom) {
      findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
    }
    return findedRoom;
  }

  async resetRound(findedRoom) {
    findedRoom.trumpRound = 0;
    const { teamOne, teamTwo } = await createDealer(findedRoom.teamOne, findedRoom.teamTwo);
    findedRoom.teamOne = teamOne;
    findedRoom.teamTwo = teamTwo;
    // Pass findedRoom to dealCards to update it within that method
    const udpatedFindedRooom = await this.dealCards(findedRoom);
    findedRoom = udpatedFindedRooom;
    findedRoom.totalCards = udpatedFindedRooom.totalCards;

    findedRoom.status = 'playing';
    await clearAllreadyDrawnCards();

    return findedRoom; // Return the updated findedRoom
  }

  async dealCards(findedRoom) {
    await clearAllreadyDrawnCards();
    let totalCard = this.generateTotalCards();

    const updatedteamOne = await Promise.all(
      findedRoom.teamOne.map(async (player) => {
        console.log('in card map');
        const card = await shuffleCards(totalCard, 5);
        totalCard = totalCard.filter(tc => !card.includes(tc));
        console.log('in card maptotalCard', totalCard);
        return { ...player, cards: card }; // Return the updated player object
      })
    );
    const updatedteamTwo = await Promise.all(
      findedRoom.teamTwo.map(async (player) => {
        console.log('in card map');
        const card = await shuffleCards(totalCard, 5);
        totalCard = totalCard.filter(tc => !card.includes(tc));
        console.log('in card maptotalCard', totalCard);
        return { ...player, cards: card }; // Return the updated player object
      })
    );

    findedRoom.totalCards = totalCard;
    findedRoom.teamOne = updatedteamOne;
    findedRoom.teamTwo = updatedteamTwo;
    return findedRoom; // Return the updated findedRoom
  }

  generateTotalCards() {
    return [
      '9h', '10h', 'jh', 'qh', 'kh', 'ah',
      '9d', '10d', 'jd', 'qd', 'kd', 'ad',
      '9c', '10c', 'jc', 'qc', 'kc', 'ac',
      '9s', '10s', 'js', 'qs', 'ks', 'as'
    ];
  }

  notifyClients(roomId, roomData) {
    const clients = this.io.sockets.adapter.rooms.get(roomId);
    if (clients) {
      console.log('Clients in room:', [...clients]);
    } else {
      console.log('No clients in the room');
    }
    this.io.to(roomId).emit('roomUpdates', { roomData });
  }

  async updateRoomData(roomId, findedRoom) {
    const updateClient = await this.client.set(roomId, JSON.stringify(findedRoom));
    if (updateClient !== 'OK') {
      await PlayingRoom.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(roomId) },
        findedRoom,
        { new: true }
      );
    }
  }
}

module.exports = TrumpBoxManager;
