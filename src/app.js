const express = require("express");
const path = require("path");
const cors = require("cors");
const httpStatus = require("http-status");
const config = require('./config/config');
const RoomHandler = require('./utilities/gameTable/RoomHandler'); // Import the RoomHandler class
const TrumpBoxManager = require('./utilities/gameTable/trumpBoxManager'); // Import the RoomHandler class
const morgan = require('./config/morgan');
// authentication
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
const checkIsTurn = require("./utilities/gameTable/checkIsTrun");
const checkIsBotTurn = require("./utilities/botTable/checkisBotTurn");
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
let totalCard = ['9h', '10h', 'jh', 'qh', 'kh', 'ah', '9d', '10d', 'jd', 'qd', 'kd', 'ad', '9c', '10c', 'jc', 'qc', 'kc', 'ac', '9s', '10s', 'js', 'qs', 'ks', 'as'];










io.on('connection', (socket) => {
	console.log('a user connected');
	const trumpBoxManager = new TrumpBoxManager(io, client);
	const roomHandler = new RoomHandler(io, socket, client);
	const trumpSelectionManager = new TrumpSelectionManager(io, client, socket);
	new PlayAloneHandler(io, socket)

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
	socket.on('passTrumpBox', async (e) => {
		await trumpBoxManager.handlePassTrumpBox(socket, e);
	});

	socket.on('gamPlayed', async (e) => {
		try {
			console.log('game played :', e)
			let data = e;

			if (typeof e === 'string') {
				data = JSON.parse(e);
			}

			if (typeof data === 'string') {
				data = JSON.parse(data);
			}
			const roomId = data.roomId;
			let playedCard = data.card;


			if (roomId && !playingRoom.includes(roomId)) {
				playingRoom.push(roomId);
				let findedRoom = await client.get(roomId);
				let lastTrickUpdates = {};
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
						console.log('updated findedRoom', udpatedFindedRooom)
						lastTrickUpdates = lastTrickUpdate
						findedRoom = udpatedFindedRooom;
						isPlayAlone = false;
					} else {
						if (findedRoom.teamTwo[0].isPartnerPlayingAlone) {
							findedRoom.teamOne[1].isTurn = true
							let next = {
								nextTurnId: findedRoom.teamOne[1].UserId,
								isPlayingAlone: true
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							const updatedRoom = await checkIsBotTurn(findedRoom, io, roomId)
							findedRoom = updatedRoom;

						} else {
							findedRoom.teamTwo[0].isTurn = true;
							let next = {
								nextTurnId: findedRoom.teamTwo[0].UserId,
								isPlayingAlone: false
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							const updatedRoom = await checkIsBotTurn(findedRoom, io, roomId)
							findedRoom = updatedRoom;

						}

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
						console.log('updated findedRoom', udpatedFindedRooom)
						lastTrickUpdates = lastTrickUpdate
						findedRoom = udpatedFindedRooom;
						isPlayAlone = false;
					} else {
						if (findedRoom.teamOne[1].isPartnerPlayingAlone) {
							findedRoom.teamTwo[1].isTurn = true;
							let next = {
								nextTurnId: findedRoom.teamTwo[1].UserId,
								isPlayingAlone: true
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							const updatedRoom = await checkIsBotTurn(findedRoom, io, roomId)
							findedRoom = updatedRoom;

						} else {
							findedRoom.teamOne[1].isTurn = true;
							let next = {
								nextTurnId: findedRoom.teamOne[1].UserId,
								isPlayingAlone: false
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							const updatedRoom = await checkIsBotTurn(findedRoom, io, roomId)
							findedRoom = updatedRoom;

						}

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
						console.log('updated findedRoom', udpatedFindedRooom)
						lastTrickUpdates = lastTrickUpdate
						findedRoom = udpatedFindedRooom;
						isPlayAlone = false;
					} else {
						if (findedRoom.teamTwo[1].isPartnerPlayingAlone) {
							findedRoom.teamOne[0].isTurn = true;
							let next = {
								nextTurnId: findedRoom.teamOne[0].UserId,
								isPlayingAlone: true
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							const updatedRoom = await checkIsBotTurn(findedRoom, io, roomId)
							findedRoom = updatedRoom;

						} else {
							findedRoom.teamTwo[1].isTurn = true;
							let next = {
								nextTurnId: findedRoom.teamTwo[1].UserId,
								isPlayingAlone: false
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							const updatedRoom = await checkIsBotTurn(findedRoom, io, roomId)
							findedRoom = updatedRoom;

						}
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
						console.log('updated findedRoom', udpatedFindedRooom)
						lastTrickUpdates = lastTrickUpdate
						findedRoom = udpatedFindedRooom;
						isPlayAlone = false;
					} else {
						if (findedRoom.teamOne[0].isPartnerPlayingAlone) {
							findedRoom.teamTwo[0].isTurn = true;
							let next = {
								nextTurnId: findedRoom.teamTwo[0].UserId,
								isPlayingAlone: true
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							const updatedRoom = await checkIsBotTurn(findedRoom, io, roomId)
							findedRoom = updatedRoom;

						} else {
							findedRoom.teamOne[0].isTurn = true;
							let next = {
								nextTurnId: findedRoom.teamOne[0].UserId,
								isPlayingAlone: false
							}
							io.to(roomId).emit('NextTurn', { roomData: next });
							const updatedRoom = await checkIsBotTurn(findedRoom, io, roomId)
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
				const index = playingRoom.indexOf(roomId);
				if (index !== -1) {
					playingRoom.splice(index, 1);
				}



				if (lastTrickUpdates) {
					// io.to(roomId).emit('roundEndResult', { roundEndResult: lastTrickUpdates });
				}
				io.to(roomId).emit('roomUpdates', { roomData: findedRoom });
				lastTrickUpdates = {}
				console.log('game roompudatesss', findedRoom)
				const updateClient = await client.set(roomId, JSON.stringify(findedRoom));
				if (updateClient != 'OK') {
					const updatedRoom = await PlayingRoom.findOneAndUpdate(
						{ _id: new mongoose.Types.ObjectId(roomId) },  // Filter condition
						findedRoom,              // Update data
						{ new: true }                                  // Options
					);
				}


				if (findedRoom.teamOnePoints && findedRoom.teamOnePoints.winningPoint >= 10) {
					findedRoom.teamOnePoints.isWinner = true;
					findedRoom.status = 'complete';
					findedRoom.isWinner = 'teamOne';
					await PlayingRoom.findOneAndUpdate(
						{ _id: new mongoose.Types.ObjectId(roomId) },
						findedRoom,
						{ new: true }
					)
					await client.del(roomId)
				}
				if (findedRoom.teamTwoPoints && findedRoom.teamTwoPoints.winningPoint >= 10) {
					findedRoom.teamTwoPoints.isWinner = true;
					findedRoom.status = 'complete';
					findedRoom.isWinner = 'teamTwo';
					await PlayingRoom.findOneAndUpdate(
						{ _id: new mongoose.Types.ObjectId(roomId) },
						findedRoom,
						{ new: true }
					);
					await client.del(roomId);
				}

				console.log('emited',)
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
		let findedRoom = await client.get(roomId);
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
			playingStatus: playAlone
		}
		io.to(roomId).emit('NotifyAloneOrTeam', { roomData: NotifyAloneOrTeam });

		let isTurnData = await checkIsTurn(findedRoom.teamOne, findedRoom.teamTwo);
		let next = {
			nextTurnId: isTurnData.userId,
			isPlayingAlone: isTurnData.isPlayingAlone
		}
		io.to(roomId).emit('NextTurn', { roomData: next });
		await client.set(roomId, JSON.stringify(findedRoom));
		const updatedRoom = await checkIsBotTurn(findedRoom, io, roomId)
		await client.set(roomId, JSON.stringify(updatedRoom));

	})

	socket.on('rejoinPlayingGame', async (e) => {
		let data = e;


		if (typeof e === 'string') {
			data = JSON.parse(e);
		}

		if (typeof data === 'string') {
			data = JSON.parse(data);
		}
		const roomId = data.roomId;
		const userId = data.userId;

		const findRoom = await PlayingRoom.aggregate([
			{
				$match: {
					_id: mongoose.Types.ObjectId(roomId),
					status: 'playing',
					players: {
						$elemMatch: { UserId: userId }
					}
				}
			}

		]);
		if (findRoom.length > 0) {
			socket.join(roomId);
			let redisData = await client.get(roomId);
			socket.emit('roomUpdates', { roomData: redisData });

		} else {
			console.log('no have finded room for this player')
		}
	});

	socket.on('joinBot', async (e) => {
		let data = e;
		console.log('joined bot')

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
		if (findRoom) {

			if (findRoom?.teamOne.length < 2) {
				findRoom?.teamOne.push(playerObj);
				findRoom?.players.push({ UserId: userId });
				if (findRoom?.players.length == 4) {
					findRoom.status = 'shuffling';
					findRoom.save();
					socket.emit('joinedRoom', { roomId });
					console.log('joined called')
				} else {
					findRoom.save();
				}


			} else if (findRoom?.teamTwo.length < 2) {
				findRoom?.teamTwo.push(playerObj);
				findRoom?.players.push({ UserId: userId });
				if (findRoom?.players.length == 4) {
					findRoom.status = 'shuffling';
					findRoom.save();
					socket.emit('joinedRoom', { roomId });
					console.log('joined called')
				} else {
					findRoom.save();
				}

			}
		}
	})
});
module.exports = { app, server };