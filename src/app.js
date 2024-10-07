const express = require("express");
const path = require("path");
const cors = require("cors");
const httpStatus = require("http-status");
const config = require('./config/config');
const morgan = require('./config/morgan');
// authentication
const session = require('express-session');
const passport = require('passport');
const { jwtStrategy } = require('./config/jwtStrategy');

const { authLimiter } = require('./middlewares/rateLimiter');
const ApiError = require("./utilities/apiErrors");
// routes
const routes = require('./routes');
const { errorConverter, errorHandler } = require("./middlewares/error");

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const PlayingRoom = require("./modules/playingroom/playingRoom.model");
const { default: mongoose } = require("mongoose");
const io = new Server(server, {
	cors: {
		origin: "*", // Change to your frontend URL for production
		methods: ["GET", "POST"],
		allowedHeaders: ["Authorization"],
		credentials: true
	}
});

if (config.env !== 'test') {
	app.use(morgan.successHandler);
	app.use(morgan.errorHandler);
}

// parse json request body
app.use(express.json({ limit: '50mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// enable cors
app.use(cors());
app.options('*', cors());

// Limit repeated failed requests to auth endpoints
if (config.env === 'production') {
	// Apply authLimiter middleware to authentication endpoints
	app.use('/v1/auth', authLimiter);
}

//Middleware
app.use(session({
	secret: process.env.JWT_SECRET || "nodeinitialsecretkey",
	resave: false,
	saveUninitialized: true,
}))

// User serialization and deserialization
passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

// Initialize Passport and use session middleware
app.use(passport.initialize());
app.use(passport.session());

// Register JWT authentication strategy
passport.use('jwt', jwtStrategy);

app.use('/v1', routes);

app.use((req, res, next) => {
	const error = new ApiError(httpStatus.NOT_FOUND, 'API Not Found');
	next(error); // Passes the error to the error-handling middleware
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);
const rooms = {};
let isTurnUpdated = false;
const playingRoom = [];
let totalCard = ['9h','10h','jh','qh','kh','ah','9d','10d','jd','qd','kd','ad','9c','10c','jc','qc','kc','ac','9s','10s','js','qs','ks','as'];
// let totalCard = [7, 2, 3, 4, 5, 6, 10, 8, 9, 1, 11, 12, 13, 14, 19, 16, 17, 18, 15, 20, 21, 22, 23, 24];
let alreadyDrawnCards = [];
async function getRandomCards(totalCard, count) {
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
}


function findTrickWinner(cards, trumpSuit) {
	console.log('suid', trumpSuit)
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
  }
  

function parseCards(playersCards) {
	// Helper to extract rank and suit from the card string
	const getCardDetails = (cardString) => {
	  const rank = cardString.slice(0, -1);  // Everything except the last character is the rank
	  const suitChar = cardString.slice(-1); // Last character is the suit
  
	  // Map the suit character to a full suit name
	  const suitMap = {
		's': 'spades',
		'h': 'hearts',
		'd': 'diamonds',
		'c': 'clubs'
	  };
  
	  return {
		rank,
		suit: suitMap[suitChar] || 'unknown'  // Handle invalid suit gracefully
	  };
	};
  
	// Map through the input array and convert the card string into rank and suit
	return playersCards.map(playerCard => {
	  const cardDetails = getCardDetails(playerCard.card);
	  return {
		playerId: playerCard.userName,
		rank: cardDetails.rank,
		suit: cardDetails.suit
	  };
	});
  }
  
function parseTrumCard(trumb) {
	// Helper to extract rank and suit from the card string
	const getCardDetails = (cardString) => {
	  const rank = cardString.slice(0, -1);  // Everything except the last character is the rank
	  const suitChar = cardString.slice(-1); // Last character is the suit
  
	  // Map the suit character to a full suit name
	  const suitMap = {
		's': 'spades',
		'h': 'hearts',
		'd': 'diamonds',
		'c': 'clubs'
	  };
  
	  return {
		rank,
		suit: suitMap[suitChar] || 'unknown'  // Handle invalid suit gracefully
	  };
	};
  
	// Map through the input array and convert the card string into rank and suit
	  const cardDetails = getCardDetails(trumb);
	  return {
		rank: cardDetails.rank,
		suit: cardDetails.suit
	  };
  }

io.on('connection', (socket) => {
	console.log('a user connected');

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on('joinedRoom', async (e) => {

		console.log(e.roomId)
		if (e.roomId) {
			socket.join(e.roomId);
			const findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(e.roomId) });
			if (findedRoom) {
				if (findedRoom.status == 'shuffling' && !playingRoom.includes(findedRoom._id)) {
					console.log('plying')
					playingRoom.push(findedRoom._id)
					console.log('added playing room for check')
					let updatedPlayers = await Promise.all(findedRoom.players.map(async (p, index) => {
						console.log(`Player ${p.userName} current cards:`, p.cards);
						if (!p.cards || p.cards.length === 0) {
							const card = await getRandomCards(totalCard, 5);
							console.log('Cards drawn:', card);
							totalCard = totalCard.filter(tc => !card.includes(tc));
							console.log('Updated totalCard:', totalCard);
							if (index == 0) {
								return { ...p, cards: card, isTurn: true };
							} else {
								return { ...p, cards: card };
							}
						}
						return p;
					}));

					// Update the total cards after player cards have been dealt
					findedRoom.status = 'playing'
					findedRoom.totalCards = totalCard;
					findedRoom.players = updatedPlayers;
					console.log('final findedRoom', findedRoom);
					alreadyDrawnCards = [];
					await findedRoom.save();
					io.to(e.roomId).emit('roomUpdates', { roomData: findedRoom });
				} else {
					io.to(e.roomId).emit('roomUpdates', { roomData: findedRoom });
				}


			}
		}

	})

	socket.on('gamPlayed', async (e) => {
		try {
			const roomId = e.roomId;
			let playedCard = e.card;
			if (roomId && isTurnUpdated == false) {
				console.log('game played')
				const findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
				if (findedRoom.players[0].isTurn == true) {
					findedRoom.players[0].isTurn = false;
					const updatedCart = findedRoom.players[0].cards.map((c)=> {
						if(c == 0){
							return 0
						}else if(c !== playedCard ){
							
							return c
						}else{
							playedCard = {card : c  , userName : findedRoom.players[0].userName }
							return 0
						}
					});
					console.log('updated cards', updatedCart)
					findedRoom.players[0].cards = updatedCart;
					findedRoom.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];
					findedRoom.players[1].isTurn = true;
					isTurnUpdated = true;
					console.log('user 1 updated')

				} else if (findedRoom.players[1].isTurn == true) {
					findedRoom.players[1].isTurn = false;

					const updatedCart = findedRoom.players[1].cards.map((c)=> {
						if(c == 0){
							return 0
						}else if(c !== playedCard){
							return c
						}else{
							playedCard = {card : c  , userName : findedRoom.players[1].userName }
							return 0
						}
					});
					console.log('updated cards', updatedCart)
					findedRoom.players[1].cards = updatedCart;
					findedRoom.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];

					findedRoom.players[2].isTurn = true;
					isTurnUpdated = true;
					console.log('user 2 updated')

				} else if (findedRoom.players[2].isTurn == true) {
					findedRoom.players[2].isTurn = false;

					const updatedCart = findedRoom.players[2].cards.map((c)=> {
						if(c == 0){
							return 0
						}else if(c !== playedCard){
							return c
						}else{
							playedCard = {card : c  , userName : findedRoom.players[2].userName }
							return 0
						}
					});
					console.log('updated cards', updatedCart)
					findedRoom.players[2].cards = updatedCart;
					findedRoom.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];

					findedRoom.players[3].isTurn = true;
					isTurnUpdated = true;
					console.log('user 3 updated')


				} else if (findedRoom.players[3].isTurn == true) {
					findedRoom.players[3].isTurn = false;

					const updatedCart = findedRoom.players[3].cards.map((c)=> {
						if(c == 0){
							return 0
						}else if(c !== playedCard){
							return c
						}else{
							playedCard = {card : c  , userName : findedRoom.players[3].userName }
							return 0
						}
					});
					console.log('updated cards', updatedCart)
					findedRoom.players[3].cards = updatedCart;
					findedRoom.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];

					findedRoom.players[0].isTurn = true;
					isTurnUpdated = true;
					console.log('user 4 updated');


					if(findedRoom.playedCards.length == 4){
						const parsedCards = await parseCards(findedRoom.playedCards);
						console.log('parsedCards', parsedCards)
						
						const trumpSuit = await parseTrumCard(findedRoom.totalCards[0])
							console.log('trumpSuid ', trumpSuit)
						const winner = findTrickWinner(parsedCards, trumpSuit.suit);
						console.log('findedWinner', winner)
						
						console.log('winnerUsername', winner);
						findedRoom.players = findedRoom.players.map((player) => {
							if (player.userName === winner) {
								return {
									...player,
									points: (player.points || 0) + 1
								};
							}
							return player;
						});
					}

					findedRoom.playedCards = []
				}
				console.log('here have updajte issue')
				const updatedRoom = await PlayingRoom.findOneAndUpdate(
					{ _id: new mongoose.Types.ObjectId(roomId) },  // Filter condition
					{ players: findedRoom.players , playedCards : findedRoom.playedCards },              // Update data
					{ new: true }                                  // Options
				);
				console.log('updated', updatedRoom)
				isTurnUpdated = false;
				const clients = io.sockets.adapter.rooms.get(roomId);

				if (clients) {
					console.log('Clients in room:', [...clients]);  // Convert the Set to an array to log
				} else {
					console.log('No clients in the room');
				}

				io.to(roomId).emit('roomUpdates', { roomData: updatedRoom });
				console.log('emited',)

			}

		} catch (error) {
			console.error('Error in shuffleCards:', error);
		}
	});




});
module.exports = { app, server };