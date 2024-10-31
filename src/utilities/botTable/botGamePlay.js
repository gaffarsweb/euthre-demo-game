const { GameManager } = require("./gamePlayFunctions");
const client = require("../redisClient");
const PlayingRoom = require("../../modules/playingroom/playingRoom.model");

const botGamePlay = async (findedRoom, playedCard, roomId, io)=>{
    try {

        console.log('params getted', findedRoom)
        console.log('params getted', playedCard)
        console.log('params getted', roomId)
        console.log('params getted', io)
        if (roomId ) {
            let lastTrickUpdates = {};
          
            if (findedRoom.teamOne[0].isTurn == true) {
                findedRoom.teamOne[0].isTurn = false;
                const updatedCart = findedRoom.teamOne[0].cards.map((c) => {
                    if (c == 0) {
                        return 0
                    } else if (c !== playedCard) {

                        return c
                    } else {
                        playedCard = { card: c, UserId: findedRoom.teamOne[0].UserId }
                        return 0
                    }
                });
                findedRoom.teamOne[0].cards = updatedCart;
                findedRoom.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];
                console.log('user 1 updated')

                let isPlayAlone = false
                isPlayAlone = await findedRoom.teamOne.some(player => player.isPlayAlone === true) || findedRoom.teamTwo.some(player => player.isPlayAlone === true);
                const cardPlayedUpdate = {
                    card: playedCard.card,
                    userId: playedCard.UserId,
                    isPlayingAlone: isPlayAlone
                }

                io.to(roomId).emit('CardPlayed', { roomData: cardPlayedUpdate });

                if (findedRoom.playedCards.length == 4 || (findedRoom.playedCards.length == 3 && isPlayAlone)) {
                    const gameManager = new GameManager(findedRoom, io);
                    const { udpatedFindedRooom, lastTrickUpdate } = await gameManager.playerOne(findedRoom, client);
                    console.log('updated findedRoom', udpatedFindedRooom)
                    lastTrickUpdates = lastTrickUpdate
                    findedRoom = udpatedFindedRooom;
                    isPlayAlone = false;
                } else {
                    if (findedRoom.teamTwo[0].isPartnerPlayingAlone) {
                        findedRoom.teamOne[1].isTurn = true
                        let next = {
                            nextTurnId: findedRoom.teamOne[1].UserId,
                            isPlayingAlone: true
                        }
                        io.to(roomId).emit('NextTurn', { roomData: next });
                    } else {
                        findedRoom.teamTwo[0].isTurn = true;
                        let next = {
                            nextTurnId: findedRoom.teamTwo[0].UserId,
                            isPlayingAlone: false
                        }
                        io.to(roomId).emit('NextTurn', { roomData: next });
                    }

                }


            } else if (findedRoom.teamTwo[0].isTurn == true) {
                findedRoom.teamTwo[0].isTurn = false;

                const updatedCart = findedRoom.teamTwo[0].cards.map((c) => {
                    if (c == 0) {
                        return 0
                    } else if (c !== playedCard) {
                        return c
                    } else {
                        playedCard = { card: c, UserId: findedRoom.teamTwo[0].UserId }
                        return 0
                    }
                });
                findedRoom.teamTwo[0].cards = updatedCart;
                findedRoom.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];

                console.log('user 2 updated')

                let isPlayAlone = false
                isPlayAlone = await findedRoom.teamOne.some(player => player.isPlayAlone === true) || findedRoom.teamTwo.some(player => player.isPlayAlone === true);
                const cardPlayedUpdate = {
                    card: playedCard.card,
                    userId: playedCard.UserId,
                    isPlayingAlone: isPlayAlone
                }

                io.to(roomId).emit('CardPlayed', { roomData: cardPlayedUpdate });
                if (findedRoom.playedCards.length == 4 || (findedRoom.playedCards.length == 3 && isPlayAlone)) {

                    const gameManager = new GameManager(findedRoom, io);
                    const { udpatedFindedRooom, lastTrickUpdate } = await gameManager.playerOne(findedRoom, client);
                    console.log('updated findedRoom', udpatedFindedRooom)
                    lastTrickUpdates = lastTrickUpdate
                    findedRoom = udpatedFindedRooom;
                    isPlayAlone = false;
                } else {
                    if (findedRoom.teamOne[1].isPartnerPlayingAlone) {
                        findedRoom.teamTwo[1].isTurn = true;
                        let next = {
                            nextTurnId: findedRoom.teamTwo[1].UserId,
                            isPlayingAlone: true
                        }
                        io.to(roomId).emit('NextTurn', { roomData: next });
                    } else {
                        findedRoom.teamOne[1].isTurn = true;
                        let next = {
                            nextTurnId: findedRoom.teamOne[1].UserId,
                            isPlayingAlone: false
                        }
                        io.to(roomId).emit('NextTurn', { roomData: next });
                    }

                }



            } else if (findedRoom.teamOne[1].isTurn == true) {
                findedRoom.teamOne[1].isTurn = false;

                const updatedCart = findedRoom.teamOne[1].cards.map((c) => {
                    if (c == 0) {
                        return 0
                    } else if (c !== playedCard) {
                        return c
                    } else {
                        playedCard = { card: c, UserId: findedRoom.teamOne[1].UserId }
                        return 0
                    }
                });
                findedRoom.teamOne[1].cards = updatedCart;
                findedRoom.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];

                console.log('user 3 updated')
                let isPlayAlone = false
                isPlayAlone = await findedRoom.teamOne.some(player => player.isPlayAlone === true) || findedRoom.teamTwo.some(player => player.isPlayAlone === true);
                const cardPlayedUpdate = {
                    card: playedCard.card,
                    userId: playedCard.UserId,
                    isPlayingAlone: isPlayAlone
                }

                io.to(roomId).emit('CardPlayed', { roomData: cardPlayedUpdate });
                if (findedRoom.playedCards.length == 4 || (findedRoom.playedCards.length == 3 && isPlayAlone)) {

                    const gameManager = new GameManager(findedRoom, io);
                    const { udpatedFindedRooom, lastTrickUpdate } = await gameManager.playerOne(findedRoom, client);
                    console.log('updated findedRoom', udpatedFindedRooom)
                    lastTrickUpdates = lastTrickUpdate
                    findedRoom = udpatedFindedRooom;
                    isPlayAlone = false;
                } else {
                    if (findedRoom.teamTwo[1].isPartnerPlayingAlone) {
                        findedRoom.teamOne[0].isTurn = true;
                        let next = {
                            nextTurnId: findedRoom.teamOne[0].UserId,
                            isPlayingAlone: true
                        }
                        io.to(roomId).emit('NextTurn', { roomData: next });
                    } else {
                        findedRoom.teamTwo[1].isTurn = true;
                        let next = {
                            nextTurnId: findedRoom.teamTwo[1].UserId,
                            isPlayingAlone: false
                        }
                        io.to(roomId).emit('NextTurn', { roomData: next });
                    }
                }


            } else if (findedRoom.teamTwo[1].isTurn == true) {
                findedRoom.teamTwo[1].isTurn = false;

                const updatedCart = findedRoom.teamTwo[1].cards.map((c) => {
                    if (c == 0) {
                        return 0
                    } else if (c !== playedCard) {
                        return c
                    } else {
                        playedCard = { card: c, UserId: findedRoom.teamTwo[1].UserId }
                        return 0
                    }
                });
                findedRoom.teamTwo[1].cards = updatedCart;
                findedRoom.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];

                // findedRoom.teamTwo[1].isTurn = true;
                console.log('user 4 updated');


                let isPlayAlone = false
                isPlayAlone = await findedRoom.teamOne.some(player => player.isPlayAlone === true) || findedRoom.teamTwo.some(player => player.isPlayAlone === true);
                const cardPlayedUpdate = {
                    card: playedCard.card,
                    userId: playedCard.UserId,
                    isPlayingAlone: isPlayAlone
                }

                io.to(roomId).emit('CardPlayed', { roomData: cardPlayedUpdate });
                if (findedRoom.playedCards.length == 4 || (findedRoom.playedCards.length == 3 && isPlayAlone)) {

                    const gameManager = new GameManager(findedRoom, io);
                    const { udpatedFindedRooom, lastTrickUpdate } = await gameManager.playerOne(findedRoom, client);
                    console.log('updated findedRoom', udpatedFindedRooom)
                    lastTrickUpdates = lastTrickUpdate
                    findedRoom = udpatedFindedRooom;
                    isPlayAlone = false;
                } else {
                    if (findedRoom.teamOne[0].isPartnerPlayingAlone) {
                        findedRoom.teamTwo[0].isTurn = true;
                        let next = {
                            nextTurnId: findedRoom.teamTwo[0].UserId,
                            isPlayingAlone: true
                        }
                        io.to(roomId).emit('NextTurn', { roomData: next });
                    } else {
                        findedRoom.teamOne[0].isTurn = true;
                        let next = {
                            nextTurnId: findedRoom.teamOne[0].UserId,
                            isPlayingAlone: false
                        }
                        io.to(roomId).emit('NextTurn', { roomData: next });
                    }
                }
            }

            
            if (lastTrickUpdates) {
                // io.to(roomId).emit('roundEndResult', { roundEndResult: lastTrickUpdates });
            }
            io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
            lastTrickUpdates = {}
            console.log('game roompudatesss', findedRoom)
            const updateClient = await client.set(roomId, JSON.stringify(findedRoom));

            if (findedRoom.teamOnePoints && findedRoom.teamOnePoints.winningPoint >= 10) {
                findedRoom.teamOnePoints.isWinner = true;
                findedRoom.status = 'complete';
                findedRoom.isWinner = 'teamOne';
                await PlayingRoom.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(roomId) },
                    findedRoom,
                    { new: true }
                )
                await client.del(roomId)
            }
            if (findedRoom.teamTwoPoints && findedRoom.teamTwoPoints.winningPoint >= 10) {
                findedRoom.teamTwoPoints.isWinner = true;
                findedRoom.status = 'complete';
                findedRoom.isWinner = 'teamTwo';
                await PlayingRoom.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(roomId) },
                    findedRoom,
                    { new: true }
                );
                await client.del(roomId);
            }

            console.log('emited',)
            // const playedCardsTeamOne = findedRoom.teamOne.map((p) => {
            // 	const allZero = p.cards.every(card => card === 0);
            // 	return allZero;
            // });
            // const teamOneTrue = playedCardsTeamOne.every(c => c === true) ? true : false;
            // const playedCardsTeamTwo = findedRoom.teamTwo.map((p) => {
            // 	const allZero = p.cards.every(card => card === 0);
            // 	return allZero;
            // });
            // const teamTwoTrue = playedCardsTeamTwo.every(c => c === true) ? true : false;
            // if (teamOneTrue && teamTwoTrue) {
            // 	totalCard = ['9h', '10h', 'jh', 'qh', 'kh', 'ah', '9d', '10d', 'jd', 'qd', 'kd', 'ad', '9c', '10c', 'jc', 'qc', 'kc', 'ac', '9s', '10s', 'js', 'qs', 'ks', 'as'];
            // }
        return findedRoom
        }
        console.log('game played success')

    } catch (error) {
        console.error('Error in shuffleCards:', error);
    }
};
module.exports = botGamePlay;