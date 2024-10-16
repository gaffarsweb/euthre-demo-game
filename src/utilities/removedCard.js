const removedCard = (teamOne, teamTwo, removedCard)=>{

	for (let i = 0; i < teamOne.length; i++) {

		if(teamOne[i].cards.length > 5){
            teamOne[i].cards = teamOne[i].cards.filter(e => e !== removedCard);

			break;
		}
    }
	for (let i = 0; i < teamTwo.length; i++) {

		if(teamTwo[i].cards.length > 5){
            teamTwo[i].cards = teamTwo[i].cards.filter(e => e !== removedCard);

			break;
		}
    }
	return {teamOne, teamTwo};
};
module.exports =removedCard;