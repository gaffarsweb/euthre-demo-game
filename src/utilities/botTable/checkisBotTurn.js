const EuchreBotPlayer = require('../../botDemo');
const client = require('../redisClient');
const botGamePlay = require('./botGamePlay');
const delay = require('./delay')




async function checkIsBotTurn(findedRoom, io, roomId) {
    let botPlayed;
    let UpdatedRoom = findedRoom;

    // do {
    botPlayed = false;
    if (UpdatedRoom && UpdatedRoom?.isGameEnd) {
        await client.del(roomId);
    } else if(UpdatedRoom) {
        const teams = [UpdatedRoom.teamOne, UpdatedRoom.teamTwo];

        for (let i = 0; i < teams.length; i++) {
            const team = teams[i];

            for (let j = 0; j < team.length; j++) {
                const player = team[j];
                // const zeroCount = await player.cards.filter(card => card !== 0).length;

                if ((player.isTurn && player.role === 'bot') && (UpdatedRoom.isStarted)) {
                    await delay(2000);
                    const euchreBot = new EuchreBotPlayer(player.userName);
                    console.log('sended Cards to bot', player.cards)
                    await euchreBot.receiveCards(player.cards);
                    const isLeadCard = UpdatedRoom.playedCards.length > 0 ? UpdatedRoom.playedCards[0].card : null;
                    await euchreBot.setTrump(UpdatedRoom?.trumpSuit)
                    const playedCard = await euchreBot.playCard(isLeadCard);
                    console.log('played Card from bot', playedCard)
                    UpdatedRoom = await botGamePlay(UpdatedRoom, playedCard, roomId, io);
                    await client.json.set(roomId, '$', UpdatedRoom);
                    botPlayed = true;  // A bot played, so we need to check again for other bots
                    break;  // Break to recheck all players after a bot plays
                }
            }
            if (botPlayed) break;  // Break the outer loop as well to recheck all players
        }
    }
    // } while (botPlayed);  // Continue until no bot has played

    return UpdatedRoom;
}


// Call the function to start bot turns
// await playBotTurns(findedRoom, roomId, io);
module.exports = checkIsBotTurn;


