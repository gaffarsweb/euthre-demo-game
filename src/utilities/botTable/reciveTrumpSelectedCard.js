const reciveTrumpSelectedCard = (teamOnes, teamTwos, selectedCard)=>{
	let dealerId;
	for (let i = 0; i < teamOnes.length; i++) {

		if(teamOnes[i].isDealer && teamOnes[i]){
			dealerId = teamOnes[i].UserId;
			teamOnes[i].cards.push(selectedCard)

			break;
		}
    }
	for (let i = 0; i < teamTwos.length; i++) {

		if(teamTwos[i].isDealer && teamTwos[i]){
			dealerId = teamTwos[i].UserId;
			teamTwos[i].cards.push(selectedCard)

			break;
		}
    }
	return {teamOnes, teamTwos, dealerId};
};
module.exports = reciveTrumpSelectedCard;