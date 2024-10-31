const { passTrumpBox } = require("./passTrumpBox.js");
const { shuffleCards, } = require("./shuffleCards.js");

// TrumpBoxManager.js
const PlayingRoom = require("../../modules/playingroom/playingRoom.model.js");
const { default: mongoose } = require("mongoose");
const createDealer = require("./createDealer.js");
const checkIsTurn = require("./checkIsTrun.js");
const { getTrumpSuitFromSelectBTN } = require("./getLeadSuit.js");

class TrumpBoxManager {
  constructor(io, client) {
    this.io = io;
    this.client = client;
  }

  async handlePassTrumpBox(findedRoom, roomId) {

    if (roomId) {
      console.log('pass ')
      let action = 0
      let isDealed = false;
      let disabledSuite = ""

      let { teamOne, teamTwo, trumpRound, userId, isShowTrumpBoxNewUser } = await passTrumpBox(
        findedRoom.teamOne,
        findedRoom.teamTwo,
        findedRoom.trumpRound
      );

      findedRoom.teamOne = teamOne;
      findedRoom.teamTwo = teamTwo;
      findedRoom.trumpRound = trumpRound;


      let orderPassCell = {
        action,
        Suite: '',
        trumpRound,
        userId
      }


      
      
      if (trumpRound === 2) {
        isDealed = true;
        findedRoom = await this.resetRound(findedRoom); // Capture the updated findedRoom
      }else if(trumpRound === 1){
        let desabledCard = await getTrumpSuitFromSelectBTN(findedRoom.totalCards[0]);
        disabledSuite = desabledCard.suit;
      }
      let NotifyTrumpSelectorPlayer = {
        userId: isShowTrumpBoxNewUser,
        trumpRound,
        disabledSuite
      }
      this.io.to(roomId).emit('OrderPassCall', { OrderUpdate: orderPassCell });
      if(!isDealed){
        this.io.to(roomId).emit('NotifyTrumpSelectorPlayer', { roomData: NotifyTrumpSelectorPlayer });
      }
      console.log('totla cardssss befor update', findedRoom)
      this.notifyClients(roomId, findedRoom, action, userId, isDealed);

      return findedRoom
    }
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

    return findedRoom; // Return the updated findedRoom
  }

  async dealCards(findedRoom) {
    const shufflecards = new shuffleCards();
    const dealtCards = await shufflecards.dealCards();
    const updatedteamOne = await Promise.all(
      findedRoom.teamOne.map(async (player, index) => {
        console.log('in card map');
        const indexNumber = `player${index + 1}`
        const card = dealtCards.players[indexNumber];
        return { ...player, cards: card }; // Return the updated player object
      })
    );
    const updatedteamTwo = await Promise.all(
      findedRoom.teamTwo.map(async (player, index) => {
        console.log('in card map');
        const indexNumber = `player${(2 + index) + 1}`
        const card = dealtCards.players[indexNumber];
        return { ...player, cards: card }; // Return the updated player object
      })
    );

    findedRoom.totalCards = dealtCards.trumpSelectionCards;
    findedRoom.teamOne = updatedteamOne;
    findedRoom.teamTwo = updatedteamTwo;
    return findedRoom; // Return the updated findedRoom
  }


  async notifyClients(roomId, roomData, action, userId, isDealed) {
    const clients = this.io.sockets.adapter.rooms.get(roomId);
    if (clients) {
      console.log('Clients in room:', [...clients]);
    } else {
      console.log('No clients in the room');
    }
    console.log('ged userid', userId)
    let { dealerId, players } = await this.getPlayers(roomData);
    if (isDealed) {
      let isTurnData = await checkIsTurn(roomData.teamOne, roomData.teamTwo);
      let InitializeRound = {
        players,
        kitty: roomData.totalCards,
        dealerId
      }

      this.io.to(roomId).emit('InitializeRound', { roomData: InitializeRound });

      let NotifyTrumpSelectorPlayer = {
        userId: isTurnData.userId,
        trumpRound: 0,
        disabledSuite:''
      }
      this.io.to(roomId).emit('NotifyTrumpSelectorPlayer', { roomData: NotifyTrumpSelectorPlayer });


      // let next = {
      //   nextTurnId: isTurnData.userId,
      //   isPlayingAlone: isTurnData.isPlayingAlone
      // }
      // this.io.to(roomId).emit('NextTurn', { roomData: next });
    }



    this.io.to(roomId).emit('roomUpdates', { roomData });
    this.io.to(roomId).emit('lastAction', { action, userId });
  }
  async getPlayers(findedRoom) {
    let dealerId = null;

    const playersPromises = findedRoom.players.map(async (player) => {
        const playerUserId = player.UserId;
        let matchedPlayer = null;
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

}

module.exports = TrumpBoxManager;
