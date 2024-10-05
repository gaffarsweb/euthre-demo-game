const User = require('../../user/user.model');
const PlayingRoom = require('../playingRoom.model');


const createRoomandUPdate = async ({ body }) => {
	try {

		const e = body
console.log(e)


		if (e.userName != null || e.userName != '') {
			const findedUser = await User.findOne({ userName: e.userName })
			if (findedUser) {
				const findRoom = await PlayingRoom.findOne({ status: 'finding' });


				const playerObj = {
					userName: e.userName,
					email : findedUser.email,
					value: '',

				};
				if (findRoom) {

					if (findRoom?.players.length < 4) {
						findRoom?.players.push(playerObj);
						findRoom.save();
						if (findRoom?.players.length == 4) {
							findRoom.status = 'playing';
							return { msg: "Room Started.", status: true, code: 200, data: findRoom };
						}else{
							return { msg: "Room Joined.", status: true, code: 201, data: findRoom };
						}

					} else if (findRoom?.players.length == 4) {
						findRoom.status = 'playing';
						findRoom.save()
						return { msg: "Room Started.", status: true, code: 200, data: findRoom };
					}
				} else {
					const playerObj = [{
						userName: e.userName,
						value: '',
						email : findedUser.email,
					}];
					const createRoom = await PlayingRoom.create({ players: playerObj });
					console.log('roome created', createRoom)
					if (createRoom) {
						return { msg: "Room Joined.", status: true, code: 201, data: createRoom };

					}

				}

			} else {

			}

		}




	} catch (error) {
		return { msg: error.message, status: false, code: 500 };
	}
};

module.exports = createRoomandUPdate;