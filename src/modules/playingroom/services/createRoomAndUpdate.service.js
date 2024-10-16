const User = require('../../user/user.model');
const PlayingRoom = require('../playingRoom.model');


const createRoomandUPdate = async ({  user }) => {
	try {

		console.log('user',user.token.UserId)


		if (user.token.UserId != null || user.token.UserId != '') {
			const findedUser = await User.findOne({ descopeId: user.token.UserId })
			if (findedUser) {
				const findRoom = await PlayingRoom.findOne({ status: 'finding' });


				const playerObj = {
					UserId: user.token.UserId,
					email: findedUser.email,
					value: '',
					userName: findedUser.userName

				};
				if (findRoom) {

					if (findRoom?.teamOne.length < 2) {
						findRoom?.teamOne.push(playerObj);
						findRoom?.players.push({UserId: user.token.UserId});
						findRoom.save();
						if (findRoom?.players.length == 4) {
							findRoom.status = 'shuffling';
							return { msg: "Room Started.", status: true, code: 200, data: findRoom };
						} else {
							return { msg: "Room Joined.", status: true, code: 201, data: findRoom };
						}

					} else if (findRoom?.teamTwo.length < 2) {
						findRoom?.teamTwo.push(playerObj);
						findRoom?.players.push({UserId: user.token.UserId});
						findRoom.save();
						if (findRoom?.players.length == 4 ) {
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
						userName: findedUser.userName
					}];
					const player = {UserId: user.token.UserId};
					const createRoom = await PlayingRoom.create({ teamOne: playerObj, players:player });
					if (createRoom) {
						return { msg: "Room Joined.", status: true, code: 201, data: createRoom };

					}

				}

			} else {
				return { msg: "User Not Found", status: false, code: 400 }
			}

		}




	} catch (error) {
		return { msg: error.message, status: false, code: 500 };
	}
};

module.exports = createRoomandUPdate;