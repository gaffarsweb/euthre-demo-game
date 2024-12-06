const client = require('../../../utilities/redisClient');
const User = require('../../user/user.model');
const PlayingRoom = require('../playingRoom.model');
const Wallet = require('../../wallet/wallet.model');
const { default: mongoose } = require('mongoose');
const GameDetails = require('../../games/games.model');


const createRoomandUPdate = async ({ user, body }) => {
	try {
		let gameDetails

		if (body.gameId) {
			gameDetails = await GameDetails.findOne({ _id: new mongoose.Types.ObjectId(body.gameId) })
		}

		console.log("USER: ", user);
		const entryFees = gameDetails?.entry ? gameDetails?.entry : 500


		if (user.token.UserId != null || user.token.UserId != '') {
			const findedUser = await User.findOne({ descopeId: user.token.UserId });
			const walletDetails = await Wallet.findOne({ descopeId: user.token.UserId })
			if (walletDetails && walletDetails.balance < entryFees) {
				return { msg: "Insufficient balance for Join", status: false, code: 400 }
			}
			if (findedUser) {

				if (findedUser && user.token.UserId) {
					const userId = user.token.UserId;

					const alreadyJoinedRoom = await PlayingRoom.aggregate([
						{
							$match: {
								status: { $in: ['playing', 'finding'] },
								players: {
									$elemMatch: { UserId: userId }
								}
							}
						}

					]);
					// if (alreadyJoinedRoom.length > 0) {
					// 	console.log(alreadyJoinedRoom[0]._id.toString())
					// 	const roomId = alreadyJoinedRoom[0]._id.toString();
					// 	let redisData = await client.json.get(roomId);
					// 	if(redisData){
					// 		console.log('alresdy joined room', redisData)
					// 		return { msg: "User Already Playing Other Game Please rejoin the user.", status: false, code: 400, data: redisData };
					// 	}else{
					// 		console.log('alresdy joined room', alreadyJoinedRoom[0])
					// 		return { msg: "User Already Playing Other Game Please rejoin the user.", status: false, code: 400, data: alreadyJoinedRoom[0] };
					// 	}
					// }
				}
				let findRoom = await PlayingRoom.findOne({ status: 'finding', roomType: 'public', gameId: new mongoose.Types.ObjectId(body.gameId) }).sort({ _id: -1 });;

				let dateOfCreation;
				let currentTime
				let addedTime
				let currentTimeUTC
				console.log('findRoom', findRoom)
				if (findRoom && findRoom?.dateOfCreation) {
					console.log("findRoom?.dateOfCreation:", findRoom?.dateOfCreation);
					dateOfCreation = new Date(findRoom.dateOfCreation); // Convert dateOfCreation to Date object
					currentTime = new Date(); // Get current time
					currentTimeUTC = new Date(currentTime.toISOString()); // Convert local time to UTC
					addedTime = new Date(dateOfCreation.getTime() + 22 * 1000);
					console.log('dateOfCreation',dateOfCreation)
					console.log('currentTimeUTC',currentTimeUTC)
					console.log('addedTime',addedTime)
				}

				const playerObj = {
					UserId: user.token.UserId,
					email: findedUser.email,
					value: '',
					role: findedUser.role,
					userName: findedUser.userName

				};

				if (findRoom && addedTime > currentTimeUTC) {

					if (findRoom?.teamOne.length < 2) {
						findRoom?.teamOne.push(playerObj);
						findRoom?.players.push({ UserId: user.token.UserId });
						findRoom.save();
						if (findRoom?.players.length == 4) {
							findRoom.status = 'shuffling';
							return { msg: "Room Started.", status: true, code: 200, data: findRoom };
						} else {
							return { msg: "Room Joined.", status: true, code: 201, data: findRoom };
						}

					} else if (findRoom?.teamTwo.length < 2) {
						findRoom?.teamTwo.push(playerObj);
						findRoom?.players.push({ UserId: user.token.UserId });
						findRoom.save();
						if (findRoom?.players.length == 4) {
							findRoom.status = 'shuffling';
							return { msg: "Room Started.", status: true, code: 200, data: findRoom };
						} else {
							return { msg: "Room Joined.", status: true, code: 201, data: findRoom };
						}
					}
				} else {
					const playerObj = [{
						UserId: user.token.UserId,
						value: '',
						email: findedUser.email,
						role: findedUser.role,
						userName: findedUser.userName
					}];
					const player = { UserId: user.token.UserId };
					const dateOfCreation = new Date();
					const createRoom = await PlayingRoom.create({ teamOne: playerObj, players: player, createrUserId: user.token.UserId, gameId: new mongoose.Types.ObjectId(body.gameId), dateOfCreation: dateOfCreation.toISOString() });
					if (createRoom) {
						return { msg: "Room Joined.", status: true, code: 201, data: createRoom };

					}

				}

			} else {
				console.log("400 else")
				return { msg: "User Not Found", status: false, code: 400 }
			}

		}




	} catch (error) {
		return { msg: error.message, status: false, code: 500 };
	}
};

module.exports = createRoomandUPdate;