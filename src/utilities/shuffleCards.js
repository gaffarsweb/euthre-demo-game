let alreadyDrawnCards = [];


async function shuffleCards(totalCard, count) {
	let drawnCards = [];
	while (drawnCards.length < count) {
		const randomIndex = Math.floor(Math.random() * totalCard.length);
		const randomCard = totalCard[randomIndex];
		if (!drawnCards.includes(randomCard) && !alreadyDrawnCards.includes(randomCard)) {
			drawnCards.push(randomCard);
			alreadyDrawnCards.push(randomCard);
		}
	}
	return drawnCards;
};
function clearAllreadyDrawnCards(){
	alreadyDrawnCards = [];
}
module.exports = {shuffleCards, clearAllreadyDrawnCards};


// class CardShuffler {
// 	constructor() {
// 	  this.alreadyDrawnCards = [];
// 	}
  
// 	async shuffleCards(totalCards, count) {
// 	  let drawnCards = [];
// 	  while (drawnCards.length < count) {
// 		const randomIndex = Math.floor(Math.random() * totalCards.length);
// 		const randomCard = totalCards[randomIndex];
// 		if (!drawnCards.includes(randomCard) && !this.alreadyDrawnCards.includes(randomCard)) {
// 		  drawnCards.push(randomCard);
// 		  this.alreadyDrawnCards.push(randomCard);
// 		}
// 	  }
// 	  this.alreadyDrawnCards = [];
// 	  return drawnCards;
// 	}
//   }
  
//   module.exports = CardShuffler;
  