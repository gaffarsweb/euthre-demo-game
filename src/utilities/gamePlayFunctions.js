// const createDealer = require("./createDealer");
// const findTrickWinner = require("./findeWinner");
// const parseCards = require("./parseCards");
// const parseTrumCard = require("./parseTrumCard");
// const { clearAllreadyDrawnCards, shuffleCards } = require("./shuffleCards.js");
// let totalCard = ['9h', '10h', 'jh', 'qh', 'kh', 'ah', '9d', '10d', 'jd', 'qd', 'kd', 'ad', '9c', '10c', 'jc', 'qc', 'kc', 'ac', '9s', '10s', 'js', 'qs', 'ks', 'as'];

// async function playerOne(findedRoom) {
//     let allPlayers = [findedRoom.teamOne[0], findedRoom.teamTwo[0], findedRoom.teamOne[1], findedRoom.teamTwo[1]]
//     const parsedCards = await parseCards(findedRoom.playedCards);

//     const trumpSuit = parseTrumCard(findedRoom.totalCards[0])
//     const winner = findTrickWinner(parsedCards, trumpSuit.suit);
//     let updatedAllPlayers = await Promise.all(
//         allPlayers.map(async (player) => {
//             player.isTrumpShow = false;
//             if (player.UserId === winner) {
//                 // Assuming some asynchronous operation might happen here (like saving to the database)
//                 return {
//                     ...player,
//                     points: (player.points || 0) + 1,
//                     isTurn: true,
//                     isTrumpShow: true
//                 };
//             }
//             return player;
//         })
//     );

//     findedRoom.playedCards = []

//     const playerCards = updatedAllPlayers.map((p) => {

//         // Check if all elements in the cards array are 0
//         const allZero = p.cards.every(card => card === 0);

//         // Return true if all elements are 0, otherwise false
//         return allZero;
//     });
//     const allTrue = playerCards.every(c => c === true) ? true : false;

//     findedRoom.teamOne = [updatedAllPlayers[0], updatedAllPlayers[2]];
//     findedRoom.teamTwo = [updatedAllPlayers[1], updatedAllPlayers[3]];


//     if (findedRoom.playedCards.length == 0 && allTrue) {

//         const { teamOne, teamTwo } = await createDealer(findedRoom.teamOne, findedRoom.teamTwo);


//         await clearAllreadyDrawnCards()
//         totalCard = ['9h', '10h', 'jh', 'qh', 'kh', 'ah', '9d', '10d', 'jd', 'qd', 'kd', 'ad', '9c', '10c', 'jc', 'qc', 'kc', 'ac', '9s', '10s', 'js', 'qs', 'ks', 'as'];
//         let updatedteamOne = await Promise.all(teamOne.map(async (p, index) => {
//             if ((!p.cards || p.cards.length === 0) || allTrue) {
//                 const card = await shuffleCards(totalCard, 5);
//                 totalCard = totalCard.filter(tc => !card.includes(tc));
//                 if (index == 1) {
//                     return { ...p, cards: card };
//                 } else {
//                     return { ...p, cards: card };
//                 }
//             }
//             return p;
//         }));
//         let updatedteamTwo = await Promise.all(teamTwo.map(async (p, index) => {
//             if ((!p.cards || p.cards.length === 0) || allTrue) {
//                 const card = await shuffleCards(totalCard, 5);
//                 totalCard = totalCard.filter(tc => !card.includes(tc));
//                 if (index == 1) {
//                     return { ...p, cards: card };
//                 } else {
//                     return { ...p, cards: card };
//                 }
//             }
//             return p;
//         }));
//         findedRoom.teamOne = updatedteamOne;
//         findedRoom.teamTwo = updatedteamTwo;

//         // Update the total cards after player cards have been dealt
//         findedRoom.isTrumpSelected = false;
//         findedRoom.isStarted = false;
//         findedRoom.status = 'playing';
//         alreadyDrawnCards = [];
//         findedRoom.totalCards = totalCard;
//         // findedRoom.players = updatedPlayers;
//     }


//     totalCard = ['9h', '10h', 'jh', 'qh', 'kh', 'ah', '9d', '10d', 'jd', 'qd', 'kd', 'ad', '9c', '10c', 'jc', 'qc', 'kc', 'ac', '9s', '10s', 'js', 'qs', 'ks', 'as'];
//     return findedRoom;

// }
// module.exports = { playerOne };




const createDealer = require("./createDealer");
const findTrickWinner = require("./findeWinner");
const parseCards = require("./parseCards");
const parseTrumCard = require("./parseTrumCard");
const { clearAllreadyDrawnCards, shuffleCards } = require("./shuffleCards.js");

class GameManager {
    constructor(findedRoom) {
        this.findedRoom = findedRoom;
        this.totalCard = [
            '9h', '10h', 'jh', 'qh', 'kh', 'ah',
            '9d', '10d', 'jd', 'qd', 'kd', 'ad',
            '9c', '10c', 'jc', 'qc', 'kc', 'ac',
            '9s', '10s', 'js', 'qs', 'ks', 'as'
        ];
    }

    async playerOne() {
        let allPlayers = [this.findedRoom.teamOne[0], this.findedRoom.teamTwo[0], this.findedRoom.teamOne[1], this.findedRoom.teamTwo[1]];
        const parsedCards = await parseCards(this.findedRoom.playedCards);
        const trumpSuit = parseTrumCard(this.findedRoom.totalCards[0]);
        const winner = findTrickWinner(parsedCards, trumpSuit.suit);

        let updatedAllPlayers = await Promise.all(
            allPlayers.map(async (player) => {
                player.isTrumpShow = false;
                if (player.UserId === winner) {
                    return {
                        ...player,
                        points: (player.points || 0) + 1,
                        isTurn: true,
                        isTrumpShow: true
                    };
                }
                return player;
            })
        );

        this.findedRoom.playedCards = [];

        const playerCards = updatedAllPlayers.map((p) => p.cards.every(card => card === 0));
        const allTrue = playerCards.every(c => c === true);

        this.findedRoom.teamOne = [updatedAllPlayers[0], updatedAllPlayers[2]];
        this.findedRoom.teamTwo = [updatedAllPlayers[1], updatedAllPlayers[3]];

        if (this.findedRoom.playedCards.length == 0 && allTrue) {
            const { teamOne, teamTwo } = await createDealer(this.findedRoom.teamOne, this.findedRoom.teamTwo);
            await clearAllreadyDrawnCards();
            this.totalCard = [
                '9h', '10h', 'jh', 'qh', 'kh', 'ah',
                '9d', '10d', 'jd', 'qd', 'kd', 'ad',
                '9c', '10c', 'jc', 'qc', 'kc', 'ac',
                '9s', '10s', 'js', 'qs', 'ks', 'as'
            ];
            console.log('dealoer created')
            await this.updatePlayerCards(teamOne, teamTwo, allTrue);
            console.log('udpatedFindedRooom', this.findedRoom)

            this.findedRoom.isTrumpSelected = false;
            this.findedRoom.isStarted = false;
            this.findedRoom.status = 'playing';
        }

        return this.findedRoom;
    }

    async updatePlayerCards(one, two, allTrue) {
        const updatedteamOne = await Promise.all(one.map(async (p, index) => {
            if ((!p.cards || p.cards.length === 0) || allTrue) {
                const card = await shuffleCards(this.totalCard, 5);
                this.totalCard = this.totalCard.filter(tc => !card.includes(tc));
                return { ...p, cards: card };
            }
            return p;
        }));
        const updatedteamTwo = await Promise.all(two.map(async (p, index) => {
            if ((!p.cards || p.cards.length === 0) || allTrue) {
                const card = await shuffleCards(this.totalCard, 5);
                this.totalCard = this.totalCard.filter(tc => !card.includes(tc));
                return { ...p, cards: card };
            }
            return p;
        }));

            this.findedRoom.totalCards = this.totalCard;
            this.findedRoom.teamOne = updatedteamOne;
            this.findedRoom.teamTwo = updatedteamTwo;
    }
}

module.exports = { GameManager };
