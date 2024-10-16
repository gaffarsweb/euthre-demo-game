function findTrickWinner(cards, trumpSuit) {
	// Define the rank values of cards (highest to lowest)
	const rankOrder = ['9', '10', 'J', 'Q', 'K', 'A'];

	// Helper function to get the rank of a card
	const getCardRank = (card) => rankOrder.indexOf(card.rank);

	// Helper function to check if a card is the Right or Left Bower
	const isRightBower = (card, trumpSuit) => card.rank === 'J' && card.suit === trumpSuit;
	const isLeftBower = (card, trumpSuit) => {
		const leftBowerSuit = trumpSuit === 'hearts' ? 'diamonds' :
			trumpSuit === 'diamonds' ? 'hearts' :
				trumpSuit === 'spades' ? 'clubs' : 'spades';
		return card.rank === 'J' && card.suit === leftBowerSuit;
	};

	// The first card played determines the leading suit
	const leadingSuit = cards[0].suit;

	// Track the current winner
	let winningCard = null;
	let winningPlayerId = null;

	// Loop through the cards to find the highest card according to the rules
	for (let i = 0; i < cards.length; i++) {
		const card = cards[i];

		// Check if the current card beats the current winner
		if (winningCard === null) {
			winningCard = card;
			winningPlayerId = card.playerId;
			continue;
		}

		// Check if the current card is a Right or Left Bower
		if (isRightBower(card, trumpSuit)) {
			winningCard = card;
			winningPlayerId = card.playerId;
		} else if (isLeftBower(card, trumpSuit) && !isRightBower(winningCard, trumpSuit)) {
			winningCard = card;
			winningPlayerId = card.playerId;
		}
		// Check if the current card is a trump card
		else if (card.suit === trumpSuit && winningCard.suit !== trumpSuit) {
			winningCard = card;
			winningPlayerId = card.playerId;
		}
		// If both cards are trump cards, the higher rank wins
		else if (card.suit === trumpSuit && winningCard.suit === trumpSuit && getCardRank(card) > getCardRank(winningCard)) {
			winningCard = card;
			winningPlayerId = card.playerId;
		}
		// If neither card is a trump card, the leading suit wins
		else if (card.suit === leadingSuit && winningCard.suit === leadingSuit && getCardRank(card) > getCardRank(winningCard)) {
			winningCard = card;
			winningPlayerId = card.playerId;
		}
		// Leading suit beats non-trump, non-leading suit
		else if (card.suit === leadingSuit && winningCard.suit !== trumpSuit && winningCard.suit !== leadingSuit) {
			winningCard = card;
			winningPlayerId = card.playerId;
		}
	}

	return winningPlayerId;  // Return the playerId of the player who won the trick
};

module.exports = findTrickWinner;