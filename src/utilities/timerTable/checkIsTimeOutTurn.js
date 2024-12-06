const EuchreBotPlayer = require("../../botDemo");
let botGamePlay;
const delay = require("../botTable/delay");
const client = require("../redisClient");
const { isCurrentTimeGreaterThan } = require("./setTimer");
const loadModule = async () => {
    botGamePlay = await require("../botTable/botGamePlay");
};
// setTimeout(async () => {

// await loadModule();
//     console.log('botGamePlay',botGamePlay)
// }, 3100); // 31 seconds timer
async function checkIsTimeOutTurn(findedRoom, io, roomId, userID) {
    let UpdatedRoom = await client.json.get(roomId);
    if (typeof UpdatedRoom === 'string') {
        UpdatedRoom = JSON.parse(UpdatedRoom);
    }
    if (typeof UpdatedRoom === 'string') {
        UpdatedRoom = JSON.parse(UpdatedRoom);
    }
    if (!UpdatedRoom) {
        UpdatedRoom;
    }
    let botPlayed;
    console.log('in time out turn function')

    // do {
    botPlayed = false;
    if (UpdatedRoom && UpdatedRoom?.isGameEnd) {
        await client.del(roomId);
    } else if (UpdatedRoom) {
        let teams = [UpdatedRoom.teamOne, UpdatedRoom.teamTwo];
        for (let i = 0; i < teams.length; i++) {
            let team = teams[i];

            for (let j = 0; j < team.length; j++) {
                let player = team[j];

                if ((player.isTurn && UpdatedRoom.isStarted) && (player.UserId === userID)) {
                    console.log('in if is turn ')
                    await delay(1000);
                    let CheckIsTimeOut = await isCurrentTimeGreaterThan(player.timeOut)
                    console.log('in check is time out', CheckIsTimeOut)
                    if (CheckIsTimeOut) {
                        console.log('in timout greter than current time')
                        let euchreBot = new EuchreBotPlayer(player.userName);
                        console.log('sended Cards to bot', player.cards)
                        await euchreBot.receiveCards(player.cards);
                        let isLeadCard = UpdatedRoom.playedCards.length > 0 ? UpdatedRoom.playedCards[0].card : null;
                        await euchreBot.setTrump(UpdatedRoom?.trumpSuit)
                        let playedCard = await euchreBot.playCard(isLeadCard);
                        console.log('played Card from bot', playedCard)
                        console.log('in time true')
                        await loadModule();
                        UpdatedRoom = await botGamePlay(UpdatedRoom, playedCard, roomId, io);

                        botPlayed = true;
                        await client.json.set(roomId, '$', UpdatedRoom);


                        break;  // Break to recheck all players after a bot plays
                    }
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
module.exports = checkIsTimeOutTurn;