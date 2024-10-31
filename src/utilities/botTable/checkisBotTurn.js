const EuchreBotPlayer = require('../../botDemo');
const botGamePlay = require('./botGamePlay');
const delay = require('./delay')

// const checkIsBotTurn = async (findedRoom, io, roomId) => {





//     if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {

//         await delay(3000);
//         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//         await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//         const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//         const playedCard = euchreBot.playCard(isLeadCard);
//         console.log('played card from bot', playedCard)
//         const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//         console.log('updated room from botGamePlay', updatedRoom)
//         findedRoom = await updatedRoom;

//         if (findedRoom.teamTwo[0].isTurn == true && findedRoom.teamTwo[0].role === 'bot') {

//             await delay(3000);
//             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
//             await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
//             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//             const playedCard = euchreBot.playCard(isLeadCard);
//             console.log('played card from bot', playedCard)
//             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//             console.log('updated room from botGamePlay', updatedRoom)
//             findedRoom = await updatedRoom;

//             if (findedRoom.teamOne[1].isTurn == true && findedRoom.teamOne[1].role === 'bot') {

//                 await delay(3000);
//                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
//                 await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
//                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                 const playedCard = euchreBot.playCard(isLeadCard);
//                 console.log('played card from bot', playedCard)
//                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                 console.log('updated room from botGamePlay', updatedRoom)
//                 findedRoom = await updatedRoom;

//                 if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//                     await delay(3000);
//                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//                     await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//                     const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                     const playedCard = euchreBot.playCard(isLeadCard);
//                     console.log('played card from bot', playedCard)
//                     const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                     console.log('updated room from botGamePlay', updatedRoom)
//                     findedRoom = await updatedRoom;

//                     if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                         await delay(3000);
//                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                         await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                         const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                         const playedCard = euchreBot.playCard(isLeadCard);
//                         console.log('played card from bot', playedCard)
//                         const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                         console.log('updated room from botGamePlay', updatedRoom)
//                         findedRoom = await updatedRoom;

//                         if (findedRoom.teamTwo[0].isTurn == true && findedRoom.teamTwo[0].role === 'bot') {

//                             await delay(3000);
//                             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
//                             await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
//                             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                             const playedCard = euchreBot.playCard(isLeadCard);
//                             console.log('played card from bot', playedCard)
//                             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                             console.log('updated room from botGamePlay', updatedRoom)
//                             findedRoom = await updatedRoom;

//                             if (findedRoom.teamOne[1].isTurn == true && findedRoom.teamOne[1].role === 'bot') {

//                                 await delay(3000);
//                                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
//                                 await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
//                                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                                 const playedCard = euchreBot.playCard(isLeadCard);
//                                 console.log('played card from bot', playedCard)
//                                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                                 console.log('updated room from botGamePlay', updatedRoom)
//                                 findedRoom = await updatedRoom;

//                                 if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//                                     await delay(3000);
//                                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//                                     await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//                                     const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                                     const playedCard = euchreBot.playCard(isLeadCard);
//                                     console.log('played card from bot', playedCard)
//                                     const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                                     console.log('updated room from botGamePlay', updatedRoom)
//                                     findedRoom = await updatedRoom;

//                                     if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                                         await delay(3000);
//                                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                                         await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                                         const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                                         const playedCard = euchreBot.playCard(isLeadCard);
//                                         console.log('played card from bot', playedCard)
//                                         const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                                         console.log('updated room from botGamePlay', updatedRoom)
//                                         findedRoom = await updatedRoom;

//                                     }

//                                 }

//                             }
//                         }
//                     }

//                 }

//             }
//         } else if (findedRoom.teamOne[1].isTurn == true && findedRoom.teamOne[1].role === 'bot') {

//             await delay(3000);
//             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
//             await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
//             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//             const playedCard = euchreBot.playCard(isLeadCard);
//             console.log('played card from bot', playedCard)
//             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//             console.log('updated room from botGamePlay', updatedRoom)
//             findedRoom = await updatedRoom;

//             if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//                 await delay(3000);
//                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//                 await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                 const playedCard = euchreBot.playCard(isLeadCard);
//                 console.log('played card from bot', playedCard)
//                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                 console.log('updated room from botGamePlay', updatedRoom)
//                 findedRoom = await updatedRoom;

//                 if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                     await delay(3000);
//                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                     await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                     const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                     const playedCard = euchreBot.playCard(isLeadCard);
//                     console.log('played card from bot', playedCard)
//                     const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                     console.log('updated room from botGamePlay', updatedRoom)
//                     findedRoom = await updatedRoom;

//                     if (findedRoom.teamTwo[0].isTurn == true && findedRoom.teamTwo[0].role === 'bot') {

//                         await delay(3000);
//                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
//                         await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
//                         const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                         const playedCard = euchreBot.playCard(isLeadCard);
//                         console.log('played card from bot', playedCard)
//                         const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                         console.log('updated room from botGamePlay', updatedRoom)
//                         findedRoom = await updatedRoom;

//                         if (findedRoom.teamOne[1].isTurn == true && findedRoom.teamOne[1].role === 'bot') {

//                             await delay(3000);
//                             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
//                             await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
//                             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                             const playedCard = euchreBot.playCard(isLeadCard);
//                             console.log('played card from bot', playedCard)
//                             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                             console.log('updated room from botGamePlay', updatedRoom)
//                             findedRoom = await updatedRoom;

//                             if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//                                 await delay(3000);
//                                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//                                 await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//                                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                                 const playedCard = euchreBot.playCard(isLeadCard);
//                                 console.log('played card from bot', playedCard)
//                                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                                 console.log('updated room from botGamePlay', updatedRoom)
//                                 findedRoom = await updatedRoom;

//                                 if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                                     await delay(3000);
//                                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                                     await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                                     const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                                     const playedCard = euchreBot.playCard(isLeadCard);
//                                     console.log('played card from bot', playedCard)
//                                     const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                                     console.log('updated room from botGamePlay', updatedRoom)
//                                     findedRoom = await updatedRoom;

//                                 }

//                             }

//                         }
//                     }
//                 }

//             }

//         }else  if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//             await delay(3000);
//             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//             await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//             const playedCard = euchreBot.playCard(isLeadCard);
//             console.log('played card from bot', playedCard)
//             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//             console.log('updated room from botGamePlay', updatedRoom)
//             findedRoom = await updatedRoom;

//             if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                 await delay(3000);
//                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                 await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                 const playedCard = euchreBot.playCard(isLeadCard);
//                 console.log('played card from bot', playedCard)
//                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                 console.log('updated room from botGamePlay', updatedRoom)
//                 findedRoom = await updatedRoom;

//                 if (findedRoom.teamTwo[0].isTurn == true && findedRoom.teamTwo[0].role === 'bot') {

//                     await delay(3000);
//                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
//                     await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
//                     const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                     const playedCard = euchreBot.playCard(isLeadCard);
//                     console.log('played card from bot', playedCard)
//                     const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                     console.log('updated room from botGamePlay', updatedRoom)
//                     findedRoom = await updatedRoom;

//                     if (findedRoom.teamOne[1].isTurn == true && findedRoom.teamOne[1].role === 'bot') {

//                         await delay(3000);
//                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
//                         await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
//                         const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                         const playedCard = euchreBot.playCard(isLeadCard);
//                         console.log('played card from bot', playedCard)
//                         const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                         console.log('updated room from botGamePlay', updatedRoom)
//                         findedRoom = await updatedRoom;

//                         if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//                             await delay(3000);
//                             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//                             await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//                             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                             const playedCard = euchreBot.playCard(isLeadCard);
//                             console.log('played card from bot', playedCard)
//                             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                             console.log('updated room from botGamePlay', updatedRoom)
//                             findedRoom = await updatedRoom;

//                             if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                                 await delay(3000);
//                                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                                 await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                                 const playedCard = euchreBot.playCard(isLeadCard);
//                                 console.log('played card from bot', playedCard)
//                                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                                 console.log('updated room from botGamePlay', updatedRoom)
//                                 findedRoom = await updatedRoom;

//                             }

//                         }

//                     }
//                 }
//             }

//         }else if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//             await delay(3000);
//             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//             await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//             const playedCard = euchreBot.playCard(isLeadCard);
//             console.log('played card from bot', playedCard)
//             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//             console.log('updated room from botGamePlay', updatedRoom)
//             findedRoom = await updatedRoom;

//             if (findedRoom.teamTwo[0].isTurn == true && findedRoom.teamTwo[0].role === 'bot') {

//                 await delay(3000);
//                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
//                 await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
//                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                 const playedCard = euchreBot.playCard(isLeadCard);
//                 console.log('played card from bot', playedCard)
//                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                 console.log('updated room from botGamePlay', updatedRoom)
//                 findedRoom = await updatedRoom;

//                 if (findedRoom.teamOne[1].isTurn == true && findedRoom.teamOne[1].role === 'bot') {

//                     await delay(3000);
//                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
//                     await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
//                     const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                     const playedCard = euchreBot.playCard(isLeadCard);
//                     console.log('played card from bot', playedCard)
//                     const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                     console.log('updated room from botGamePlay', updatedRoom)
//                     findedRoom = await updatedRoom;

//                     if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//                         await delay(3000);
//                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//                         await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//                         const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                         const playedCard = euchreBot.playCard(isLeadCard);
//                         console.log('played card from bot', playedCard)
//                         const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                         console.log('updated room from botGamePlay', updatedRoom)
//                         findedRoom = await updatedRoom;

//                         if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                             await delay(3000);
//                             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                             await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                             const playedCard = euchreBot.playCard(isLeadCard);
//                             console.log('played card from bot', playedCard)
//                             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                             console.log('updated room from botGamePlay', updatedRoom)
//                             findedRoom = await updatedRoom;

//                         }

//                     }

//                 }
//             }
//         }
//     } else if (findedRoom.teamTwo[0].isTurn == true && findedRoom.teamTwo[0].role === 'bot') {

//         await delay(3000);
//         const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
//         await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
//         const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//         const playedCard = euchreBot.playCard(isLeadCard);
//         console.log('played card from bot', playedCard)
//         const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//         console.log('updated room from botGamePlay', updatedRoom)
//         findedRoom = await updatedRoom;

//         if (findedRoom.teamOne[1].isTurn == true && findedRoom.teamOne[1].role === 'bot') {

//             await delay(3000);
//             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
//             await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
//             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//             const playedCard = euchreBot.playCard(isLeadCard);
//             console.log('played card from bot', playedCard)
//             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//             console.log('updated room from botGamePlay', updatedRoom)
//             findedRoom = await updatedRoom;

//             if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//                 await delay(3000);
//                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//                 await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                 const playedCard = euchreBot.playCard(isLeadCard);
//                 console.log('played card from bot', playedCard)
//                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                 console.log('updated room from botGamePlay', updatedRoom)
//                 findedRoom = await updatedRoom;

//                 if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                     await delay(3000);
//                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                     await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                     const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                     const playedCard = euchreBot.playCard(isLeadCard);
//                     console.log('played card from bot', playedCard)
//                     const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                     console.log('updated room from botGamePlay', updatedRoom)
//                     findedRoom = await updatedRoom;
//                     if (findedRoom.teamTwo[0].isTurn == true && findedRoom.teamTwo[0].role === 'bot') {

//                         await delay(3000);
//                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
//                         await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
//                         const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                         const playedCard = euchreBot.playCard(isLeadCard);
//                         console.log('played card from bot', playedCard)
//                         const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                         console.log('updated room from botGamePlay', updatedRoom)
//                         findedRoom = await updatedRoom;

//                         if (findedRoom.teamOne[1].isTurn == true && findedRoom.teamOne[1].role === 'bot') {

//                             await delay(3000);
//                             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
//                             await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
//                             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                             const playedCard = euchreBot.playCard(isLeadCard);
//                             console.log('played card from bot', playedCard)
//                             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                             console.log('updated room from botGamePlay', updatedRoom)
//                             findedRoom = await updatedRoom;

//                             if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//                                 await delay(3000);
//                                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//                                 await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//                                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                                 const playedCard = euchreBot.playCard(isLeadCard);
//                                 console.log('played card from bot', playedCard)
//                                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                                 console.log('updated room from botGamePlay', updatedRoom)
//                                 findedRoom = await updatedRoom;

//                                 if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                                     await delay(3000);
//                                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                                     await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                                     const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                                     const playedCard = euchreBot.playCard(isLeadCard);
//                                     console.log('played card from bot', playedCard)
//                                     const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                                     console.log('updated room from botGamePlay', updatedRoom)
//                                     findedRoom = await updatedRoom;

//                                 }

//                             }

//                         }
//                     }
//                 }
//             }

//         }else if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//             await delay(3000);
//             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//             await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//             const playedCard = euchreBot.playCard(isLeadCard);
//             console.log('played card from bot', playedCard)
//             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//             console.log('updated room from botGamePlay', updatedRoom)
//             findedRoom = await updatedRoom;

//             if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                 await delay(3000);
//                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                 await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                 const playedCard = euchreBot.playCard(isLeadCard);
//                 console.log('played card from bot', playedCard)
//                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                 console.log('updated room from botGamePlay', updatedRoom)
//                 findedRoom = await updatedRoom;
//                 if (findedRoom.teamTwo[0].isTurn == true && findedRoom.teamTwo[0].role === 'bot') {

//                     await delay(3000);
//                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
//                     await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
//                     const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                     const playedCard = euchreBot.playCard(isLeadCard);
//                     console.log('played card from bot', playedCard)
//                     const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                     console.log('updated room from botGamePlay', updatedRoom)
//                     findedRoom = await updatedRoom;

//                     if (findedRoom.teamOne[1].isTurn == true && findedRoom.teamOne[1].role === 'bot') {

//                         await delay(3000);
//                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
//                         await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
//                         const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                         const playedCard = euchreBot.playCard(isLeadCard);
//                         console.log('played card from bot', playedCard)
//                         const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                         console.log('updated room from botGamePlay', updatedRoom)
//                         findedRoom = await updatedRoom;

//                         if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//                             await delay(3000);
//                             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//                             await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//                             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                             const playedCard = euchreBot.playCard(isLeadCard);
//                             console.log('played card from bot', playedCard)
//                             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                             console.log('updated room from botGamePlay', updatedRoom)
//                             findedRoom = await updatedRoom;

//                             if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                                 await delay(3000);
//                                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                                 await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                                 const playedCard = euchreBot.playCard(isLeadCard);
//                                 console.log('played card from bot', playedCard)
//                                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                                 console.log('updated room from botGamePlay', updatedRoom)
//                                 findedRoom = await updatedRoom;

//                             }

//                         }

//                     }
//                 }
//             }
//         }else if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//             await delay(3000);
//             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//             await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//             const playedCard = euchreBot.playCard(isLeadCard);
//             console.log('played card from bot', playedCard)
//             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//             console.log('updated room from botGamePlay', updatedRoom)
//             findedRoom = await updatedRoom;
//             if (findedRoom.teamTwo[0].isTurn == true && findedRoom.teamTwo[0].role === 'bot') {

//                 await delay(3000);
//                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
//                 await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
//                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                 const playedCard = euchreBot.playCard(isLeadCard);
//                 console.log('played card from bot', playedCard)
//                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                 console.log('updated room from botGamePlay', updatedRoom)
//                 findedRoom = await updatedRoom;

//                 if (findedRoom.teamOne[1].isTurn == true && findedRoom.teamOne[1].role === 'bot') {

//                     await delay(3000);
//                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
//                     await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
//                     const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                     const playedCard = euchreBot.playCard(isLeadCard);
//                     console.log('played card from bot', playedCard)
//                     const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                     console.log('updated room from botGamePlay', updatedRoom)
//                     findedRoom = await updatedRoom;

//                     if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//                         await delay(3000);
//                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//                         await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//                         const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                         const playedCard = euchreBot.playCard(isLeadCard);
//                         console.log('played card from bot', playedCard)
//                         const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                         console.log('updated room from botGamePlay', updatedRoom)
//                         findedRoom = await updatedRoom;

//                         if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                             await delay(3000);
//                             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                             await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                             const playedCard = euchreBot.playCard(isLeadCard);
//                             console.log('played card from bot', playedCard)
//                             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                             console.log('updated room from botGamePlay', updatedRoom)
//                             findedRoom = await updatedRoom;

//                         }

//                     }

//                 }
//             }
//         }else  if (findedRoom.teamTwo[0].isTurn == true && findedRoom.teamTwo[0].role === 'bot') {

//             await delay(3000);
//             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
//             await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
//             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//             const playedCard = euchreBot.playCard(isLeadCard);
//             console.log('played card from bot', playedCard)
//             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//             console.log('updated room from botGamePlay', updatedRoom)
//             findedRoom = await updatedRoom;

//             if (findedRoom.teamOne[1].isTurn == true && findedRoom.teamOne[1].role === 'bot') {

//                 await delay(3000);
//                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
//                 await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
//                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                 const playedCard = euchreBot.playCard(isLeadCard);
//                 console.log('played card from bot', playedCard)
//                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                 console.log('updated room from botGamePlay', updatedRoom)
//                 findedRoom = await updatedRoom;

//                 if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//                     await delay(3000);
//                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//                     await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//                     const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                     const playedCard = euchreBot.playCard(isLeadCard);
//                     console.log('played card from bot', playedCard)
//                     const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                     console.log('updated room from botGamePlay', updatedRoom)
//                     findedRoom = await updatedRoom;

//                     if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                         await delay(3000);
//                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                         await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                         const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                         const playedCard = euchreBot.playCard(isLeadCard);
//                         console.log('played card from bot', playedCard)
//                         const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                         console.log('updated room from botGamePlay', updatedRoom)
//                         findedRoom = await updatedRoom;

//                     }

//                 }

//             }
//         }else  if (findedRoom.teamOne[1].isTurn == true && findedRoom.teamOne[1].role === 'bot') {

//             await delay(3000);
//             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
//             await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
//             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//             const playedCard = euchreBot.playCard(isLeadCard);
//             console.log('played card from bot', playedCard)
//             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//             console.log('updated room from botGamePlay', updatedRoom)
//             findedRoom = await updatedRoom;

//             if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//                 await delay(3000);
//                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//                 await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                 const playedCard = euchreBot.playCard(isLeadCard);
//                 console.log('played card from bot', playedCard)
//                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                 console.log('updated room from botGamePlay', updatedRoom)
//                 findedRoom = await updatedRoom;

//                 if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                     await delay(3000);
//                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                     await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                     const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                     const playedCard = euchreBot.playCard(isLeadCard);
//                     console.log('played card from bot', playedCard)
//                     const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                     console.log('updated room from botGamePlay', updatedRoom)
//                     findedRoom = await updatedRoom;

//                 }

//             }

//         }else  if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//             await delay(3000);
//             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//             await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//             const playedCard = euchreBot.playCard(isLeadCard);
//             console.log('played card from bot', playedCard)
//             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//             console.log('updated room from botGamePlay', updatedRoom)
//             findedRoom = await updatedRoom;

//             if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                 await delay(3000);
//                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                 await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                 const playedCard = euchreBot.playCard(isLeadCard);
//                 console.log('played card from bot', playedCard)
//                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                 console.log('updated room from botGamePlay', updatedRoom)
//                 findedRoom = await updatedRoom;

//             }

//         }
//     } else if (findedRoom.teamOne[1].isTurn == true && findedRoom.teamOne[1].role === 'bot') {

//         await delay(3000);
//         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
//         await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
//         const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//         const playedCard = euchreBot.playCard(isLeadCard);
//         console.log('played card from bot', playedCard)
//         const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//         console.log('updated room from botGamePlay', updatedRoom)
//         findedRoom = await updatedRoom;

//         if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//             await delay(3000);
//             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//             await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//             const playedCard = euchreBot.playCard(isLeadCard);
//             console.log('played card from bot', playedCard)
//             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//             console.log('updated room from botGamePlay', updatedRoom)
//             findedRoom = await updatedRoom;

//             if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                 await delay(3000);
//                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                 await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                 const playedCard = euchreBot.playCard(isLeadCard);
//                 console.log('played card from bot', playedCard)
//                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                 console.log('updated room from botGamePlay', updatedRoom)
//                 findedRoom = await updatedRoom;
//                 if (findedRoom.teamTwo[0].isTurn == true && findedRoom.teamTwo[0].role === 'bot') {

//                     await delay(3000);
//                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
//                     await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
//                     const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                     const playedCard = euchreBot.playCard(isLeadCard);
//                     console.log('played card from bot', playedCard)
//                     const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                     console.log('updated room from botGamePlay', updatedRoom)
//                     findedRoom = await updatedRoom;

//                     if (findedRoom.teamOne[1].isTurn == true && findedRoom.teamOne[1].role === 'bot') {

//                         await delay(3000);
//                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
//                         await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
//                         const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                         const playedCard = euchreBot.playCard(isLeadCard);
//                         console.log('played card from bot', playedCard)
//                         const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                         console.log('updated room from botGamePlay', updatedRoom)
//                         findedRoom = await updatedRoom;

//                         if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//                             await delay(3000);
//                             const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//                             await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//                             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                             const playedCard = euchreBot.playCard(isLeadCard);
//                             console.log('played card from bot', playedCard)
//                             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                             console.log('updated room from botGamePlay', updatedRoom)
//                             findedRoom = await updatedRoom;

//                             if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                                 await delay(3000);
//                                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                                 await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                                 const playedCard = euchreBot.playCard(isLeadCard);
//                                 console.log('played card from bot', playedCard)
//                                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                                 console.log('updated room from botGamePlay', updatedRoom)
//                                 findedRoom = await updatedRoom;

//                             }

//                         }

//                     }
//                 }
//             }
//         }

//     } else if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//         await delay(3000);
//         const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//         await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//         const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//         const playedCard = euchreBot.playCard(isLeadCard);
//         console.log('played card from bot', playedCard)
//         const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//         console.log('updated room from botGamePlay', updatedRoom)
//         findedRoom = await updatedRoom;

//         if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//             await delay(3000);
//             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//             await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//             const playedCard = euchreBot.playCard(isLeadCard);
//             console.log('played card from bot', playedCard)
//             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//             console.log('updated room from botGamePlay', updatedRoom)
//             findedRoom = await updatedRoom;
//             if (findedRoom.teamTwo[0].isTurn == true && findedRoom.teamTwo[0].role === 'bot') {

//                 await delay(3000);
//                 const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[0].userName);
//                 await euchreBot.receiveCards(findedRoom.teamTwo[0].cards);
//                 const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                 const playedCard = euchreBot.playCard(isLeadCard);
//                 console.log('played card from bot', playedCard)
//                 const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                 console.log('updated room from botGamePlay', updatedRoom)
//                 findedRoom = await updatedRoom;

//                 if (findedRoom.teamOne[1].isTurn == true && findedRoom.teamOne[1].role === 'bot') {

//                     await delay(3000);
//                     const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[1].userName);
//                     await euchreBot.receiveCards(findedRoom.teamOne[1].cards);
//                     const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                     const playedCard = euchreBot.playCard(isLeadCard);
//                     console.log('played card from bot', playedCard)
//                     const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                     console.log('updated room from botGamePlay', updatedRoom)
//                     findedRoom = await updatedRoom;

//                     if (findedRoom.teamTwo[1].isTurn == true && findedRoom.teamTwo[1].role === 'bot') {

//                         await delay(3000);
//                         const euchreBot = await new EuchreBotPlayer(findedRoom.teamTwo[1].userName);
//                         await euchreBot.receiveCards(findedRoom.teamTwo[1].cards);
//                         const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                         const playedCard = euchreBot.playCard(isLeadCard);
//                         console.log('played card from bot', playedCard)
//                         const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                         console.log('updated room from botGamePlay', updatedRoom)
//                         findedRoom = await updatedRoom;

//                         if (findedRoom.teamOne[0].isTurn == true && findedRoom.teamOne[0].role === 'bot') {
//                             await delay(3000);
//                             const euchreBot = await new EuchreBotPlayer(findedRoom.teamOne[0].userName);
//                             await euchreBot.receiveCards(findedRoom.teamOne[0].cards);
//                             const isLeadCard = findedRoom.playedCards.length > 0 ? findedRoom.playedCards[0].card : null;
//                             const playedCard = euchreBot.playCard(isLeadCard);
//                             console.log('played card from bot', playedCard)
//                             const updatedRoom = await botGamePlay(findedRoom, playedCard, roomId, io);
//                             console.log('updated room from botGamePlay', updatedRoom)
//                             findedRoom = await updatedRoom;

//                         }

//                     }

//                 }
//             }
//         }

//     }



//     return findedRoom
// };





async function checkIsBotTurn(findedRoom, io, roomId) {
    console.log('in check bot trun')
    let botPlayed;
    let UpdatedRoom = findedRoom ;

    do {
        botPlayed = false;
        const teams = [UpdatedRoom.teamOne, UpdatedRoom.teamTwo];

        for (let i = 0; i < teams.length; i++) {
            const team = teams[i];

            for (let j = 0; j < team.length; j++) {
                const player = team[j];

                if (player.isTurn && player.role === 'bot' && UpdatedRoom.isStarted) {
                    await delay(3000);
                    const euchreBot = new EuchreBotPlayer(player.userName);
                    await euchreBot.receiveCards(player.cards);
                    const isLeadCard = UpdatedRoom.playedCards.length > 0 ? UpdatedRoom.playedCards[0].card : null;
                    const playedCard = euchreBot.playCard(isLeadCard);
                    console.log('played card from bot', playedCard);

                    UpdatedRoom = await botGamePlay(UpdatedRoom, playedCard, roomId, io);
                    console.log('updated room from botGamePlay', UpdatedRoom);

                    botPlayed = true;  // A bot played, so we need to check again for other bots
                    break;  // Break to recheck all players after a bot plays
                }
            }
            if (botPlayed) break;  // Break the outer loop as well to recheck all players
        }
    } while (botPlayed);  // Continue until no bot has played

    return UpdatedRoom;
}


// Call the function to start bot turns
// await playBotTurns(findedRoom, roomId, io);
module.exports = checkIsBotTurn;


