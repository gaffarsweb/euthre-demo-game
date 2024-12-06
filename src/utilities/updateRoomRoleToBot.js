
async function updateRoomRoleToBot(roomId, socketId, client) {
    try {
        let isUpdate = false;

        let findedRoom;
        if (roomId) {
            findedRoom = await client.json.get(roomId);
        }
        console.log('finded room', findedRoom)
        if (typeof findedRoom === 'string') {
            findedRoom = JSON.parse(findedRoom);
        }
        if (typeof findedRoom === 'string') {
            findedRoom = JSON.parse(findedRoom);
        }

        if (findedRoom) {
            const updateTeamRole = async (team) => {
                return team.map(player => {
                    if (player.socketId === socketId && player.role !== 'bot') {
                        isUpdate = true
                        player.role = 'bot';
                    }
                    return player;
                });
            };

            const [updatedTeamOne, updatedTeamTwo] = await Promise.all([
                updateTeamRole(findedRoom.teamOne),
                updateTeamRole(findedRoom.teamTwo)
            ]);

            findedRoom.teamOne = updatedTeamOne;
            findedRoom.teamTwo = updatedTeamTwo;

            // Store the updated room data back to Redis
            if (isUpdate) {
                await client.json.set(roomId, '$', findedRoom);
            }
            return findedRoom;  // Return the updated room data if needed for further use
        }


    } catch (error) {
        console.error('Error updating room role:', error);
        throw error;  // Rethrow the error for the caller to handle
    }
}
async function updateRoomRoleToUser(userId, roomId, socketId, client) {
    try {
        let isUpdate = false;

        let findedRoom;
        if (roomId) {
            findedRoom = await client.json.get(roomId);
        }
        console.log('finded room', findedRoom)
        if (typeof findedRoom === 'string') {
            findedRoom = JSON.parse(findedRoom);
        }
        if (typeof findedRoom === 'string') {
            findedRoom = JSON.parse(findedRoom);
        }

        if (findedRoom) {
            let isTeam = '';
            let isTeamPlayerIndex;
            const updateTeamRole = async (team, teamName) => {
                return team.map((player, index) => {
                    if (player.UserId === userId) {
                        isUpdate = true
                        player.role = 'user';
                        player.socketId = socketId;
                        isTeam = teamName;
                        isTeamPlayerIndex = index
                    }
                    return player;
                });
            };

            const [updatedTeamOne, updatedTeamTwo] = await Promise.all([
                updateTeamRole(findedRoom.teamOne, 'teamOne'),
                updateTeamRole(findedRoom.teamTwo, 'teamTwo')
            ]);

            findedRoom.teamOne = updatedTeamOne;
            findedRoom.teamTwo = updatedTeamTwo;

            // Store the updated room data back to Redis
            if (isUpdate) {
                await client.json.set(roomId, `$.${isTeam}[${isTeamPlayerIndex}].role`, 'user');
                await client.json.set(roomId, `$.${isTeam}[${isTeamPlayerIndex}].socketId`, socketId);
                // await client.json.set(roomId, '$', findedRoom);
            }
            return findedRoom;  // Return the updated room data if needed for further use
        }


    } catch (error) {
        console.error('Error updating room role:', error);
        throw error;  // Rethrow the error for the caller to handle
    }
}
async function checkIsBotToUserUpdated(userId, roomId, socketId, client) {
    try {
        let isUpdate = false;

        let findedRoom;
        if (roomId) {
            findedRoom = await client.json.get(roomId);
        }
        console.log('finded room', findedRoom)
        if (typeof findedRoom === 'string') {
            findedRoom = JSON.parse(findedRoom);
        }
        if (typeof findedRoom === 'string') {
            findedRoom = JSON.parse(findedRoom);
        }

        if (findedRoom) {
            const updateTeamRole = async (team) => {
                return team.map(player => {
                    if ((player.UserId === userId && player.role === 'user') && player.socketId === socketId) {
                        isUpdate = true
                    }
                    return player;
                });
            };

            const [updatedTeamOne, updatedTeamTwo] = await Promise.all([
                updateTeamRole(findedRoom.teamOne),
                updateTeamRole(findedRoom.teamTwo)
            ]);



        }
        return isUpdate;  // Return the updated room data if needed for further use


    } catch (error) {
        console.error('Error updating room role:', error);
        throw error;  // Rethrow the error for the caller to handle
    }
}

module.exports = { updateRoomRoleToBot, updateRoomRoleToUser, checkIsBotToUserUpdated };
