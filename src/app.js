const express = require("express");
const path = require("path");
const cors = require("cors");
const httpStatus = require("http-status");
const config = require('./config/config');
const redis = require('redis');
const RoomHandler = require('./utilities/RoomHandler'); // Import the RoomHandler class
const TrumpBoxManager = require('./utilities/trumpBoxManager'); // Import the RoomHandler class
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
const sendResponse = require("./utilities/responseHandler");
const { GameManager } = require("./utilities/gamePlayFunctions");
const TrumpSelectionManager = require("./utilities/TrumpSelectionManager");
const io = new Server(server, {
	cors: {
		origin: "*", // Change to your frontend URL for production
		methods: ["GET", "POST"],
		allowedHeaders: ["Authorization"],
		credentials: true
	}
});

// Redis setup
const client = redis.createClient();

client.on('error', (err) => {
	console.error('Error:', err);
});
client.connect();

//   async function playgameChache(roomId, findedRoom) {
// 	try {
// 	  // Connect to Redis
// 	  console.log('Connected to Redis');

// 	  // Set a key-value pair
// 	  const reply = await client.set(roomId, JSON.stringify(findedRoom));
// 	  console.log('Set key response:', reply);

// 	  // Get the value back
// 	  const value = await client.get(roomId);
// 	  console.log('Value of testKey:', value);
// 	  return value
// 	} catch (err) {
// 	  console.error('Error in Redis operations:', err);
// 	} finally {
// 	  // Close the connection
// 	  await client.quit();
// 	}
//   }
//   playgameChache('gaffar','vakye')
// Call the async function to run Redis operations





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
app.use('/', (req, res) => {
	res.send('Server Started');
});

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
let totalCard = ['9h', '10h', 'jh', 'qh', 'kh', 'ah', '9d', '10d', 'jd', 'qd', 'kd', 'ad', '9c', '10c', 'jc', 'qc', 'kc', 'ac', '9s', '10s', 'js', 'qs', 'ks', 'as'];










io.on('connection', (socket) => {
	console.log('a user connected');
	const roomHandler = new RoomHandler(io, socket, client);
	const trumpSelectionManager = new TrumpSelectionManager(io, client, socket);
	const trumpBoxManager = new TrumpBoxManager(io, client);
	
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
	socket.on('passTrumpBox', async (e) => {
		await trumpBoxManager.handlePassTrumpBox(socket, e);
	});

	socket.on('gamPlayed', async (e) => {
		try {
			const roomId = e.roomId;
			let playedCard = e.card;


			if (roomId && isTurnUpdated == false) {
				let findedRoom = await client.get(roomId);
				console.log('game played', findedRoom)
				if (typeof findedRoom === 'string') {
					findedRoom = JSON.parse(findedRoom);
				}
				if (!findedRoom) {
					findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
				}
				if (findedRoom.teamOne[0].isTurn == true) {
					findedRoom.teamOne[0].isTurn = false;
					const updatedCart = findedRoom.teamOne[0].cards.map((c) => {
						if (c == 0) {
							return 0
						} else if (c !== playedCard) {

							return c
						} else {
							playedCard = { card: c, UserId: findedRoom.teamOne[0].UserId }
							return 0
						}
					});
					findedRoom.teamOne[0].cards = updatedCart;
					findedRoom.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];
					isTurnUpdated = true;
					console.log('user 1 updated')

					if (findedRoom.playedCards.length == 4) {
						const gameManager = new GameManager(findedRoom);
						const udpatedFindedRooom = await gameManager.playerOne(findedRoom);
						console.log('updated findedRoom', udpatedFindedRooom)
						findedRoom = udpatedFindedRooom
					} else {
						findedRoom.teamTwo[0].isTurn = true;
					}



				} else if (findedRoom.teamTwo[0].isTurn == true) {
					findedRoom.teamTwo[0].isTurn = false;

					const updatedCart = findedRoom.teamTwo[0].cards.map((c) => {
						if (c == 0) {
							return 0
						} else if (c !== playedCard) {
							return c
						} else {
							playedCard = { card: c, UserId: findedRoom.teamTwo[0].UserId }
							return 0
						}
					});
					findedRoom.teamTwo[0].cards = updatedCart;
					findedRoom.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];

					isTurnUpdated = true;
					console.log('user 2 updated')

					if (findedRoom.playedCards.length == 4) {

						const gameManager = new GameManager(findedRoom);
						const udpatedFindedRooom = await gameManager.playerOne(findedRoom);
						console.log('updated findedRoom', udpatedFindedRooom)
						findedRoom = udpatedFindedRooom
					} else {
						findedRoom.teamOne[1].isTurn = true;
					}



				} else if (findedRoom.teamOne[1].isTurn == true) {
					findedRoom.teamOne[1].isTurn = false;

					const updatedCart = findedRoom.teamOne[1].cards.map((c) => {
						if (c == 0) {
							return 0
						} else if (c !== playedCard) {
							return c
						} else {
							playedCard = { card: c, UserId: findedRoom.teamOne[1].UserId }
							return 0
						}
					});
					findedRoom.teamOne[1].cards = updatedCart;
					findedRoom.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];

					isTurnUpdated = true;
					console.log('user 3 updated')
					if (findedRoom.playedCards.length == 4) {

						const gameManager = new GameManager(findedRoom);
						const udpatedFindedRooom = await gameManager.playerOne(findedRoom);
						console.log('updated findedRoom', udpatedFindedRooom)
						findedRoom = udpatedFindedRooom
					} else {
						findedRoom.teamTwo[1].isTurn = true;
					}


				} else if (findedRoom.teamTwo[1].isTurn == true) {
					findedRoom.teamTwo[1].isTurn = false;

					const updatedCart = findedRoom.teamTwo[1].cards.map((c) => {
						if (c == 0) {
							return 0
						} else if (c !== playedCard) {
							return c
						} else {
							playedCard = { card: c, UserId: findedRoom.teamTwo[1].UserId }
							return 0
						}
					});
					findedRoom.teamTwo[1].cards = updatedCart;
					findedRoom.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];

					// findedRoom.teamTwo[1].isTurn = true;
					isTurnUpdated = true;
					console.log('user 4 updated');


					if (findedRoom.playedCards.length == 4) {

						const gameManager = new GameManager(findedRoom);
						const udpatedFindedRooom = await gameManager.playerOne(findedRoom);
						console.log('updated findedRoom', udpatedFindedRooom)
						findedRoom = udpatedFindedRooom
					} else {
						findedRoom.teamOne[0].isTurn = true;
					}
				}
				// const updatedRoom = await PlayingRoom.findOneAndUpdate(
				// 	{ _id: new mongoose.Types.ObjectId(roomId) },  // Filter condition
				// 	{ players: findedRoom.players, playedCards: findedRoom.playedCards, totalCards: findedRoom.totalCards, isStarted : findedRoom.isStarted, isTrumpSelected:findedRoom.isTrumpSelected },              // Update data
				// 	{ new: true }                                  // Options
				// );
				isTurnUpdated = false;
				const clients = io.sockets.adapter.rooms.get(roomId);

				if (clients) {
					console.log('Clients in room:', [...clients]);  // Convert the Set to an array to log
				} else {
					console.log('No clients in the room');
				}

				io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
				await client.set(roomId, JSON.stringify(findedRoom));
				console.log('emited',)
				const playedCardsTeamOne = findedRoom.teamOne.map((p) => {
					const allZero = p.cards.every(card => card === 0);
					return allZero;
				});
				const teamOneTrue = playedCardsTeamOne.every(c => c === true) ? true : false;
				const playedCardsTeamTwo = findedRoom.teamTwo.map((p) => {
					const allZero = p.cards.every(card => card === 0);
					return allZero;
				});
				const teamTwoTrue = playedCardsTeamTwo.every(c => c === true) ? true : false;
				if (teamOneTrue && teamTwoTrue) {
					totalCard = ['9h', '10h', 'jh', 'qh', 'kh', 'ah', '9d', '10d', 'jd', 'qd', 'kd', 'ad', '9c', '10c', 'jc', 'qc', 'kc', 'ac', '9s', '10s', 'js', 'qs', 'ks', 'as'];
				}

			}

		} catch (error) {
			console.error('Error in shuffleCards:', error);
		}
	});


	


});
module.exports = { app, server };