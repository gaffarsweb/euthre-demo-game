const express = require("express");
const path = require("path");
const cors = require("cors");
const httpStatus = require("http-status");
const config = require('./config/config');
const RoomHandler = require('./utilities/gameTable/RoomHandler'); // Import the RoomHandler class
const TrumpBoxManager = require('./utilities/gameTable/trumpBoxManager'); // Import the RoomHandler class
const morgan = require('./config/morgan');
// authentication
const cron = require('node-cron');
const session = require('express-session');
const passport = require('passport');
const { jwtStrategy } = require('./config/jwtStrategy');

const { authLimiter } = require('./middlewares/rateLimiter');
const ApiError = require("./utilities/apiErrors");
// routes
const BotNameGenerator = require('./utilities/getRandomUserNameForBots')
const routes = require('./routes');
const { errorConverter, errorHandler } = require("./middlewares/error");

const app = express();
const http = require('http');
const ioClient = require('socket.io-client');
const server = http.createServer(app);
const { Server } = require('socket.io');
const PlayingRoom = require("./modules/playingroom/playingRoom.model");
const { default: mongoose } = require("mongoose");
const sendResponse = require("./utilities/responseHandler");
const { GameManager } = require("./utilities/gameTable/gamePlayFunctions");
const TrumpSelectionManager = require("./utilities/gameTable/TrumpSelectionManager");
const client = require('./utilities/redisClient');
const PlayAloneHandler = require("./utilities/gameTable/PlayAloneHandler");
const getRandomAlphabeticChars = require("./utilities/getRendomUserIdBOT");
const checkIsTimeOutTurn = require("./utilities/timerTable/checkIsTimeOutTurn");
const checkIsTurn = require("./utilities/gameTable/checkIsTrun");
const checkIsBotTurn = require("./utilities/botTable/checkisBotTurn");
const { getTimePlus30Seconds } = require("./utilities/timerTable/setTimer");
const { updateRoomRoleToBot, updateRoomRoleToUser, checkIsBotToUserUpdated } = require("./utilities/updateRoomRoleToBot");
const checkIsLastCardThrow = require("./utilities/checkIslastCard");
const checkTournamentStarted = require("./utilities/checkTournamentStarted");

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
const corsOptions = {
	origin: "*", // Change to your frontend URL for production
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Authorization", "Content-Type"],
	credentials: true,
};
// enable cors
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
// app.use('/', (req, res) => {
// 	res.send('Server Started');
// });
app.use('/', express.static(path.join(__dirname, 'Disk/Build')));
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
const botJoinedRoom = [];
let totalCard = ['9h', '10h', 'jh', 'qh', 'kh', 'ah', '9d', '10d', 'jd', 'qd', 'kd', 'ad', '9c', '10c', 'jc', 'qc', 'kc', 'ac', '9s', '10s', 'js', 'qs', 'ks', 'as'];


// const updatedRoom = {
// 	id: 123, name: "Sample Room", players: [
// 		{ userName: 'gaffar' }, { userName: 'tester' }]
// };

// const fun = async () => {
// 	// Store the initial data as JSON
// 	await client.json.set('roomIdgaffar', '$', updatedRoom);

// 	// Retrieve the data and log it
// 	const getData = await client.json.get('roomIdgaffar');
// 	console.log('Data before update:', getData);

// 	// Update the 'name' field
// 	await client.json.set('roomIdgaffar', '$.players[0].userName', 'Gaffar Shaikh');

// 	// Retrieve the updated data
// 	const updatedRedis = await client.json.get('roomIdgaffar');
// 	console.log('Data after update:', updatedRedis);
// 	await client.del('roomIdgaffar');
// 	const deleted = await client.json.get('roomIdgaffar');
// 	console.log('deleted:', deleted);
// };
// fun()




io.on('connection', (socket) => {
	console.log('a user connected');

	const trumpBoxManager = new TrumpBoxManager(io, client);
	const roomHandler = new RoomHandler(io, socket, client);
	const trumpSelectionManager = new TrumpSelectionManager(io, client, socket);
	new PlayAloneHandler(io, socket)

	socket.on('disconnect', async () => {
		try {
			let roomId = socket.data.roomId;
			let socketId = socket.id;
			console.log('user disconnected')
			await updateRoomRoleToBot(roomId, socketId, client)
		} catch (error) {
			console.log('in disconnect', error)
		}

	});
	socket.on('passTrumpBox', async (e) => {
		await trumpBoxManager.handlePassTrumpBox(socket, e);
	});

	socket.on('gamPlayed', async (e) => {
		try {
			let data = e;
			console.log('game played', e)

			if (typeof e === 'string') {
				data = JSON.parse(e);
			}

			if (typeof data === 'string') {
				data = JSON.parse(data);
			}
			const roomId = data.roomId;
			let playedCard = {};


			if (roomId) {
				// playingRoom.push(roomId);
				let findedRoom = await client.json.get(roomId);
				let lastTrickUpdates = {};
				if (typeof findedRoom === 'string') {
					findedRoom = JSON.parse(findedRoom);
				}
				if (!findedRoom) {
					findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
				}
				if (findedRoom.teamOne[0].isTurn == true) {
					findedRoom.teamOne[0].isTurn = false;
					const updatedCart = await findedRoom.teamOne[0].cards.map((c) => {
						if (c == 0) {
							return 0
						} else if (c !== data.card) {

							return c
						} else {
							playedCard = { card: c, UserId: findedRoom.teamOne[0].UserId }
							return 0
						}
					});
					findedRoom.teamOne[0].cards = updatedCart;
					findedRoom.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];
					isTurnUpdated = true;

					let isPlayAlone = false
					isPlayAlone = await findedRoom.teamOne.some(player => player.isPlayAlone === true) || findedRoom.teamTwo.some(player => player.isPlayAlone === true);
					const cardPlayedUpdate = {
						card: playedCard.card,
						userId: playedCard.UserId,
						isPlayingAlone: isPlayAlone
					}
					io.to(roomId).emit('CardPlayed', { roomData: cardPlayedUpdate });

					if (findedRoom.playedCards.length == 4 || (findedRoom.playedCards.length == 3 && isPlayAlone)) {
						const gameManager = new GameManager(findedRoom, io);
						const { udpatedFindedRooom, lastTrickUpdate } = await gameManager.playerOne(findedRoom, client);
						lastTrickUpdates = lastTrickUpdate
						findedRoom = udpatedFindedRooom;
						isPlayAlone = false;
					} else {
						if (findedRoom.teamTwo[0].isPartnerPlayingAlone) {
							findedRoom.teamOne[1].isTurn = true;

							const timeOut = await getTimePlus30Seconds();

							findedRoom.teamOne[1].timeOut = timeOut;
							findedRoom.teamOne[1].timerCount = 30;
							let next = {
								nextTurnId: findedRoom.teamOne[1].UserId,
								isPlayingAlone: true,
								timeOut, timerCount: 27,
								leadSuit: findedRoom.playedCards.length > 0 && findedRoom.playedCards[0].card ? findedRoom.playedCards[0].card : '',
								trumpSuit: findedRoom.trumpSuit
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
							updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom.teamOne[1].UserId);
							await client.json.set(roomId, '$', updatedRoom);
							setTimeout(async () => {
								await checkIsTimeOutTurn(findedRoom, io, roomId, findedRoom.teamOne[1].UserId)
							}, 31000); // 40 seconds timer

							findedRoom = updatedRoom;

						} else {
							findedRoom.teamTwo[0].isTurn = true;
							const timeOut = await getTimePlus30Seconds();

							findedRoom.teamTwo[0].timeOut = timeOut;
							findedRoom.teamTwo[0].timerCount = 30;
							let next = {
								nextTurnId: findedRoom.teamTwo[0].UserId,
								isPlayingAlone: false,
								timeOut, timerCount: 27,
								leadSuit: findedRoom.playedCards.length > 0 && findedRoom.playedCards[0].card ? findedRoom.playedCards[0].card : '',
								trumpSuit: findedRoom.trumpSuit
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
							updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom.teamTwo[0].UserId);
							await client.json.set(roomId, '$', updatedRoom);
							setTimeout(async () => {
								await checkIsTimeOutTurn(findedRoom, io, roomId, findedRoom.teamTwo[0].UserId)
							}, 31000); // 40 seconds timer
							findedRoom = updatedRoom;

						}

					}


				} else if (findedRoom.teamTwo[0].isTurn == true) {
					findedRoom.teamTwo[0].isTurn = false;

					const updatedCart = await findedRoom.teamTwo[0].cards.map((c) => {
						if (c == 0) {
							return 0
						} else if (c !== data.card) {
							return c
						} else {
							playedCard = { card: c, UserId: findedRoom.teamTwo[0].UserId }
							return 0
						}
					});
					findedRoom.teamTwo[0].cards = updatedCart;
					findedRoom.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];

					isTurnUpdated = true;

					let isPlayAlone = false
					isPlayAlone = await findedRoom.teamOne.some(player => player.isPlayAlone === true) || findedRoom.teamTwo.some(player => player.isPlayAlone === true);
					const cardPlayedUpdate = {
						card: playedCard.card,
						userId: playedCard.UserId,
						isPlayingAlone: isPlayAlone
					}
					io.to(roomId).emit('CardPlayed', { roomData: cardPlayedUpdate });
					if (findedRoom.playedCards.length == 4 || (findedRoom.playedCards.length == 3 && isPlayAlone)) {

						const gameManager = new GameManager(findedRoom, io);
						const { udpatedFindedRooom, lastTrickUpdate } = await gameManager.playerOne(findedRoom, client);
						lastTrickUpdates = lastTrickUpdate
						findedRoom = udpatedFindedRooom;
						isPlayAlone = false;
					} else {
						if (findedRoom.teamOne[1].isPartnerPlayingAlone) {
							findedRoom.teamTwo[1].isTurn = true;
							const timeOut = await getTimePlus30Seconds();

							findedRoom.teamTwo[1].timeOut = timeOut;
							findedRoom.teamTwo[1].timerCount = 30;
							let next = {
								nextTurnId: findedRoom.teamTwo[1].UserId,
								isPlayingAlone: true,
								timeOut, timerCount: 27,
								leadSuit: findedRoom.playedCards.length > 0 && findedRoom.playedCards[0].card ? findedRoom.playedCards[0].card : '',
								trumpSuit: findedRoom.trumpSuit
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
							updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom.teamTwo[1].UserId);
							await client.json.set(roomId, '$', updatedRoom);
							setTimeout(async () => {
								await checkIsTimeOutTurn(findedRoom, io, roomId, findedRoom.teamTwo[1].UserId)
							}, 31000); // 40 seconds timer
							findedRoom = updatedRoom;

						} else {
							findedRoom.teamOne[1].isTurn = true;
							const timeOut = await getTimePlus30Seconds();

							findedRoom.teamOne[1].timeOut = timeOut;
							findedRoom.teamOne[1].timerCount = 30;
							let next = {
								nextTurnId: findedRoom.teamOne[1].UserId,
								isPlayingAlone: false,
								timeOut, timerCount: 27,
								leadSuit: findedRoom.playedCards.length > 0 && findedRoom.playedCards[0].card ? findedRoom.playedCards[0].card : '',
								trumpSuit: findedRoom.trumpSuit
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
							updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom.teamOne[1].UserId);
							await client.json.set(roomId, '$', updatedRoom);
							setTimeout(async () => {
								await checkIsTimeOutTurn(findedRoom, io, roomId, findedRoom.teamOne[1].UserId)
							}, 31000); // 40 seconds timer
							findedRoom = updatedRoom;

						}

					}



				} else if (findedRoom.teamOne[1].isTurn == true) {
					findedRoom.teamOne[1].isTurn = false;

					const updatedCart = await findedRoom.teamOne[1].cards.map((c) => {
						if (c == 0) {
							return 0
						} else if (c !== data.card) {
							return c
						} else {
							playedCard = { card: c, UserId: findedRoom.teamOne[1].UserId }
							return 0
						}
					});
					findedRoom.teamOne[1].cards = updatedCart;
					findedRoom.playedCards ? findedRoom.playedCards.push(playedCard) : findedRoom.playedCards = [playedCard];

					isTurnUpdated = true;
					let isPlayAlone = false
					isPlayAlone = await findedRoom.teamOne.some(player => player.isPlayAlone === true) || findedRoom.teamTwo.some(player => player.isPlayAlone === true);
					const cardPlayedUpdate = {
						card: playedCard.card,
						userId: playedCard.UserId,
						isPlayingAlone: isPlayAlone
					}
					io.to(roomId).emit('CardPlayed', { roomData: cardPlayedUpdate });
					if (findedRoom.playedCards.length == 4 || (findedRoom.playedCards.length == 3 && isPlayAlone)) {

						const gameManager = new GameManager(findedRoom, io);
						const { udpatedFindedRooom, lastTrickUpdate } = await gameManager.playerOne(findedRoom, client);
						lastTrickUpdates = lastTrickUpdate
						findedRoom = udpatedFindedRooom;
						isPlayAlone = false;
					} else {
						if (findedRoom.teamTwo[1].isPartnerPlayingAlone) {
							findedRoom.teamOne[0].isTurn = true;
							const timeOut = await getTimePlus30Seconds();

							findedRoom.teamOne[0].timeOut = timeOut;
							findedRoom.teamOne[0].timerCount = 30;
							let next = {
								nextTurnId: findedRoom.teamOne[0].UserId,
								isPlayingAlone: true,
								timeOut, timerCount: 27,
								leadSuit: findedRoom.playedCards.length > 0 && findedRoom.playedCards[0].card ? findedRoom.playedCards[0].card : '',
								trumpSuit: findedRoom.trumpSuit
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
							updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom.teamOne[0].UserId);
							await client.json.set(roomId, '$', updatedRoom);
							setTimeout(async () => {
								await checkIsTimeOutTurn(findedRoom, io, roomId, findedRoom.teamOne[0].UserId)
							}, 31000); // 40 seconds timer
							findedRoom = updatedRoom;

						} else {
							findedRoom.teamTwo[1].isTurn = true;
							const timeOut = await getTimePlus30Seconds();

							findedRoom.teamTwo[1].timeOut = timeOut;
							findedRoom.teamTwo[1].timerCount = 30;
							let next = {
								nextTurnId: findedRoom.teamTwo[1].UserId,
								isPlayingAlone: false,
								timeOut, timerCount: 27,
								leadSuit: findedRoom.playedCards.length > 0 && findedRoom.playedCards[0].card ? findedRoom.playedCards[0].card : '',
								trumpSuit: findedRoom.trumpSuit
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
							updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom.teamTwo[1].UserId);
							await client.json.set(roomId, '$', updatedRoom);
							setTimeout(async () => {
								await checkIsTimeOutTurn(findedRoom, io, roomId, findedRoom.teamTwo[1].UserId)
							}, 31000); // 40 seconds timer
							findedRoom = updatedRoom;

						}
					}


				} else if (findedRoom.teamTwo[1].isTurn == true) {
					findedRoom.teamTwo[1].isTurn = false;

					const updatedCart = await findedRoom.teamTwo[1].cards.map((c) => {
						if (c == 0) {
							return 0
						} else if (c !== data.card) {
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


					let isPlayAlone = false
					isPlayAlone = await findedRoom.teamOne.some(player => player.isPlayAlone === true) || findedRoom.teamTwo.some(player => player.isPlayAlone === true);
					const cardPlayedUpdate = {
						card: playedCard.card,
						userId: playedCard.UserId,
						isPlayingAlone: isPlayAlone
					}
					io.to(roomId).emit('CardPlayed', { roomData: cardPlayedUpdate });
					if (findedRoom.playedCards.length == 4 || (findedRoom.playedCards.length == 3 && isPlayAlone)) {

						const gameManager = new GameManager(findedRoom, io);
						const { udpatedFindedRooom, lastTrickUpdate } = await gameManager.playerOne(findedRoom, client);
						lastTrickUpdates = lastTrickUpdate
						findedRoom = udpatedFindedRooom;
						isPlayAlone = false;
					} else {
						if (findedRoom.teamOne[0].isPartnerPlayingAlone) {
							findedRoom.teamTwo[0].isTurn = true;
							const timeOut = await getTimePlus30Seconds();

							findedRoom.teamTwo[0].timeOut = timeOut;
							findedRoom.teamTwo[0].timerCount = 30;
							let next = {
								nextTurnId: findedRoom.teamTwo[0].UserId,
								isPlayingAlone: true,
								timeOut, timerCount: 27,
								leadSuit: findedRoom.playedCards.length > 0 && findedRoom.playedCards[0].card ? findedRoom.playedCards[0].card : '',
								trumpSuit: findedRoom.trumpSuit
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
							updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom.teamTwo[0].UserId);
							await client.json.set(roomId, '$', updatedRoom);
							setTimeout(async () => {
								await checkIsTimeOutTurn(findedRoom, io, roomId, findedRoom.teamTwo[0].UserId)
							}, 31000); // 40 seconds timer
							findedRoom = updatedRoom;

						} else {
							findedRoom.teamOne[0].isTurn = true;
							const timeOut = await getTimePlus30Seconds();

							findedRoom.teamOne[0].timeOut = timeOut;
							findedRoom.teamOne[0].timerCount = 30;
							let next = {
								nextTurnId: findedRoom.teamOne[0].UserId,
								isPlayingAlone: false,
								timeOut, timerCount: 27,
								leadSuit: findedRoom.playedCards.length > 0 && findedRoom.playedCards[0].card ? findedRoom.playedCards[0].card : '',
								trumpSuit: findedRoom.trumpSuit
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
							updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId, findedRoom.teamOne[0].UserId);
							await client.json.set(roomId, '$', updatedRoom);
							setTimeout(async () => {
								await checkIsTimeOutTurn(findedRoom, io, roomId, findedRoom.teamOne[0].UserId)
							}, 31000); // 40 seconds timer
							findedRoom = updatedRoom;

						}
					}
				}

				isTurnUpdated = false;
				const clients = io.sockets.adapter.rooms.get(roomId);

				if (clients) {
					console.log('Clients in room:', [...clients]);  // Convert the Set to an array to log
				} else {
					console.log('No clients in the room');
				}
				// const index = playingRoom.indexOf(roomId);
				// if (index !== -1) {
				// 	playingRoom.splice(index, 1);
				// }



				if (lastTrickUpdates) {
					// io.to(roomId).emit('roundEndResult', { roundEndResult: lastTrickUpdates });
				}
				io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
				lastTrickUpdates = {}
				const updateClient = await client.json.set(roomId, '$', findedRoom);
				if (updateClient != 'OK') {
					const updatedRoom = await PlayingRoom.findOneAndUpdate(
						{ _id: new mongoose.Types.ObjectId(roomId) },  // Filter condition
						findedRoom,              // Update data
						{ new: true }                                  // Options
					);
				}


				if (findedRoom.teamOnePoints && findedRoom.teamOnePoints.winningPoint >= 10) {
					findedRoom.teamOnePoints.isWinner = true;
					findedRoom.isStarted = false;
					findedRoom.status = 'complete';
					findedRoom.isWinner = 'teamOne';
					findedRoom.isGameEnd = true;
					await PlayingRoom.findOneAndUpdate(
						{ _id: new mongoose.Types.ObjectId(roomId) },
						findedRoom,
						{ new: true }
					)

					// await client.del(roomId);
					const room = io.sockets.adapter.rooms.get(roomId);

					if (room) {
						// Iterate over each socket in the room
						for (const socketId of room) {
							const socket = io.sockets.sockets.get(socketId);
							if (socket) {
								// Disconnect the socket
								socket.leave(roomId);
								// socket.disconnect(true);
							}
						}
					}
					await client.json.set(roomId, '$', findedRoom);
				}
				if (findedRoom.teamTwoPoints && findedRoom.teamTwoPoints.winningPoint >= 10) {
					findedRoom.teamTwoPoints.isWinner = true;
					findedRoom.isStarted = false;
					findedRoom.status = 'complete';
					findedRoom.isWinner = 'teamTwo';
					findedRoom.isGameEnd = true;
					await PlayingRoom.findOneAndUpdate(
						{ _id: new mongoose.Types.ObjectId(roomId) },
						findedRoom,
						{ new: true }
					);
					// await client.del(roomId);
					const room = io.sockets.adapter.rooms.get(roomId);

					if (room) {
						// Iterate over each socket in the room
						for (const socketId of room) {
							const socket = io.sockets.sockets.get(socketId);
							if (socket) {
								// Disconnect the socket
								socket.leave(roomId);
								// socket.disconnect(true);
							}
						}
					}
					await client.json.set(roomId, '$', findedRoom);
				}

				// const playedCardsTeamOne = findedRoom.teamOne.map((p) => {
				// 	const allZero = p.cards.every(card => card === 0);
				// 	return allZero;
				// });
				// const teamOneTrue = playedCardsTeamOne.every(c => c === true) ? true : false;
				// const playedCardsTeamTwo = findedRoom.teamTwo.map((p) => {
				// 	const allZero = p.cards.every(card => card === 0);
				// 	return allZero;
				// });
				// const teamTwoTrue = playedCardsTeamTwo.every(c => c === true) ? true : false;
				// if (teamOneTrue && teamTwoTrue) {
				// 	totalCard = ['9h', '10h', 'jh', 'qh', 'kh', 'ah', '9d', '10d', 'jd', 'qd', 'kd', 'ad', '9c', '10c', 'jc', 'qc', 'kc', 'ac', '9s', '10s', 'js', 'qs', 'ks', 'as'];
				// }



			}
			// const index = playingRoom.indexOf(roomId);
			// if (index !== -1) {
			// 	playingRoom.splice(index, 1);
			// }
			console.log('game played success')

		} catch (error) {
			console.error('Error in shuffleCards:', error);
		}
	});
	socket.on('playWithPartner', async (e) => {
		let data = e;
		let action = 'Playing With Partner';
		let playAlone = 0

		if (typeof e === 'string') {
			data = JSON.parse(e);
		}

		if (typeof data === 'string') {
			data = JSON.parse(data);
		}
		const roomId = data.roomId;
		const userId = data.userId;
		let findedRoom = await client.json.get(roomId);
		if (typeof findedRoom === 'string') {
			findedRoom = JSON.parse(findedRoom);
		}
		if (typeof findedRoom === 'string') {
			findedRoom = JSON.parse(findedRoom);
		}
		if (!findedRoom) {
			findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId) });
		}

		io.to(roomId).emit('lastAction', { action, userId });
		let NotifyAloneOrTeam = {
			userId,
			playingStatus: playAlone,
			trumpSuit: findedRoom.trumpSuit
		}
		io.to(roomId).emit('NotifyAloneOrTeam', { roomData: NotifyAloneOrTeam });

		const timeOut = await getTimePlus30Seconds();
		let isTurnData = await checkIsTurn(findedRoom.teamOne, findedRoom.teamTwo, 0, timeOut);
		findedRoom.teamOne = isTurnData.teamOne;
		findedRoom.teamTwo = isTurnData.teamTwo;
		let next = {
			nextTurnId: isTurnData.userId,
			isPlayingAlone: isTurnData.isPlayingAlone,
			timeOut, timerCount: 27,
			leadSuit: findedRoom.playedCards.length > 0 && findedRoom.playedCards[0].card ? findedRoom.playedCards[0].card : '',
			trumpSuit: findedRoom.trumpSuit
		}
		io.to(roomId).emit('NextTurn', { roomData: next });
		await client.json.set(roomId, '$', findedRoom);
		let updatedRoom = await checkIsBotTurn(findedRoom, io, roomId);
		// updatedRoom = await checkIsLastCardThrow(findedRoom, io, roomId);
		setTimeout(async () => {
			await checkIsTimeOutTurn(findedRoom, io, roomId, isTurnData.userId)
		}, 31000); // 40 seconds timer
		await client.json.set(roomId, '$', updatedRoom);

	})

	socket.on('rejoinPlayingGame', async (e) => {
		let data = e;
		if (typeof e === 'string') {
			data = JSON.parse(e);
		}

		if (typeof data === 'string') {
			data = JSON.parse(data);
		}
		let socketId = socket.id;
		const roomId = data.roomId;
		const userId = data.userId;

		await updateRoomRoleToUser(userId, roomId, socketId, client);


		let isRejoined = await checkIsBotToUserUpdated(userId, roomId, socketId, client);

		if (isRejoined) {
			socket.join(roomId);
		} else {
			await updateRoomRoleToUser(userId, roomId, socketId, client);
			isRejoined = await checkIsBotToUserUpdated(userId, roomId, socketId, client);
			if (isRejoined) {
				socket.join(roomId);
			}

		};

		io.to(roomId).emit('isRejoined', { roomData: { isJoined: isRejoined, userId, } });


	});

	socket.on('joinBot', async (e) => {
		let data = e;

		if (typeof e === 'string') {
			data = JSON.parse(e);
		}

		if (typeof data === 'string') {
			data = JSON.parse(data);
		}
		const userId = await getRandomAlphabeticChars();
		const botNameManager = await new BotNameGenerator();
		const userName = await botNameManager.getRandomBotName()
		const socket = ioClient('http://localhost:3001');
		const roomId = data.roomId;
		const findRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(roomId), status: 'finding' });

		const playerObj = {
			UserId: userId,
			email: 'bot@gmail.com',
			value: '',
			role: 'bot',
			userName: userName

		};
		if (findRoom && !botJoinedRoom.includes(roomId)) {
			botJoinedRoom.push(roomId)

			if (findRoom?.teamOne.length < 2) {
				findRoom?.teamOne.push(playerObj);
				findRoom?.players.push({ UserId: userId });
				if (findRoom?.players.length == 4) {
					findRoom.status = 'shuffling';
					await findRoom.save();
					const index = botJoinedRoom.indexOf(roomId);
					if (index !== -1) {
						botJoinedRoom.splice(index, 1);
					}
					await socket.emit('joinedRoom', { roomId });
				} else {
					await findRoom.save();
					const index = botJoinedRoom.indexOf(roomId);
					if (index !== -1) {
						botJoinedRoom.splice(index, 1);
					}
					await socket.emit('joinedRoom', { roomId });
				}


			} else if (findRoom?.teamTwo.length < 2) {
				findRoom?.teamTwo.push(playerObj);
				findRoom?.players.push({ UserId: userId });
				if (findRoom?.players.length == 4) {
					findRoom.status = 'shuffling';
					await findRoom.save();
					const index = botJoinedRoom.indexOf(roomId);
					if (index !== -1) {
						botJoinedRoom.splice(index, 1);
					}
					await socket.emit('joinedRoom', { roomId });
				} else {
					await findRoom.save();
					const index = botJoinedRoom.indexOf(roomId);
					if (index !== -1) {
						botJoinedRoom.splice(index, 1);
					}
					await socket.emit('joinedRoom', { roomId });

				}

			}

			const index = botJoinedRoom.indexOf(roomId);
			if (index !== -1) {
				botJoinedRoom.splice(index, 1);
			}
		}
	})
});




cron.schedule('*/1 * * * *', async () => {
	console.log('Running task every 5 minutes');
	await checkTournamentStarted()
	// Your task logic goes here
});



module.exports = { app, server };