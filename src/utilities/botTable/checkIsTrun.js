const checkIsTurn = async (teamOne, teamTwo, count) => {
    let userId;
    let isPlayingAlone = false

    let allPlayers = [teamOne[0], teamTwo[0], teamOne[1], teamTwo[1]];

    for (let i = 0; i < allPlayers.length; i++) {
        if (allPlayers[i].isPlayAlone) {
            isPlayingAlone = allPlayers[i].isPlayAlone
        }
        if (allPlayers[i].isTurn) {
            userId = allPlayers[i].UserId;
        }
    };


    for (let i = 0; i < allPlayers.length; i++) {
        if (allPlayers[i].isPartnerPlayingAlone && allPlayers[i].isTurn) {
            allPlayers[i].isTurn = false;
            let addition = i + 1;
            allPlayers[addition].isTurn = true;
            userId = allPlayers[addition].UserId;
            console.log('parter played alone', allPlayers[i])
        }
    }

    teamOne = [allPlayers[0], allPlayers[2]];
    teamTwo = [allPlayers[1], allPlayers[3]];

    return { userId, isPlayingAlone, teamOne, teamTwo }; // Return the updated teams and trumpRound
};


module.exports = checkIsTurn;