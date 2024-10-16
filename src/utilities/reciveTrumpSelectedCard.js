const reciveTrumpSelectedCard = (teamOne, teamTwo, selectedCard)=>{

	for (let i = 0; i < teamOne.length; i++) {

		if(teamOne[i].isDealer){
			teamOne[i].cards.push(selectedCard)

			break;
		}
    }
	for (let i = 0; i < teamTwo.length; i++) {

		if(teamTwo[i].isDealer){
			teamTwo[i].cards.push(selectedCard)

			break;
		}
    }
	return {teamOne, teamTwo};
};
module.exports = reciveTrumpSelectedCard;