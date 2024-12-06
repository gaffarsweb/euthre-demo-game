const client = require('../../../utilities/redisClient');
const User = require('../../user/user.model');
const PlayingRoom = require('../../playingroom/playingRoom.model');
const Wallet = require('../../wallet/wallet.model');
const mongoose = require('mongoose');
const GameDetails = require('../../games/games.model');
const Tournament = require('../tournament.model');

const joinTournamentRoom = async ({ user, body }) => {
    try {
        if (!user?.token?.UserId || !body?.id) {
            return { msg: "Invalid request parameters.", status: false, code: 400 };
        }

        const tournamentId = new mongoose.Types.ObjectId(body.id);
        const findTournament = await Tournament.findOne({ _id: tournamentId, status: "playing" });

        if (!findTournament) {
            return { msg: "Tournament not found.", status: false, code: 404 };
        }

        const gameDetails = findTournament.gameId
            ? await GameDetails.findById(new mongoose.Types.ObjectId(findTournament.gameId))
            : null;

        let isPlayer = false;
        if (findTournament.registeredUsers) {
            for (let i = 0; i < findTournament.registeredUsers.length; i++) {
                if (findTournament.registeredUsers[i].descopeId === user.token.UserId && findTournament.registeredUsers[i].lost) {

                    return { msg: "You have already played in this tournament and lost.", status: false, code: 400 };
                    break
                } else if (findTournament.registeredUsers[i].descopeId === user.token.UserId) {
                    findTournament.registeredUsers[i].status = 'joined';
                    isPlayer = true;
                    break;
                }
            }

            if (!isPlayer) {
                return { msg: "You are not a registered player for this tournament.", status: false, code: 400 };
            }
        }

        const entryFees = gameDetails?.entry || 500;

        const findedUser = await User.findOne({ descopeId: user.token.UserId });
        if (!findedUser) {
            return { msg: "User not found.", status: false, code: 404 };
        }

        const walletDetails = await Wallet.findOne({ descopeId: user.token.UserId });
        if (!walletDetails || walletDetails.balance < entryFees) {
            return { msg: "Insufficient balance to join.", status: false, code: 400 };
        }

        let findRoom = await PlayingRoom.findOne({
            status: 'finding',
            roomType: 'tournament',
            gameId: new mongoose.Types.ObjectId(findTournament.gameId)
        }).sort({ _id: -1 });

        let isAlreadyJoinedPlayer = false;
        if (findRoom && findRoom.players) {
            for (let i = 0; i < findRoom.players.length; i++) {
                if (findRoom.players[i].UserId === user.token.UserId) {
                    isAlreadyJoinedPlayer = true;
                    break;
                }
            }

            if (isAlreadyJoinedPlayer) {
                return { msg: "You are in this room already", status: false, code: 400 };
            }
        }

        const currentTimeUTC = new Date();
        const addedTime = findRoom?.dateOfCreation
            ? new Date(new Date(findRoom.dateOfCreation).getTime() + 20 * 60 * 1000)
            : null;

        const playerObj = {
            UserId: user.token.UserId,
            email: findedUser.email,
            value: '',
            role: findedUser.role,
            userName: findedUser.userName,
            paid: true,
            paidAmount: entryFees
        };

        if (findRoom && addedTime > currentTimeUTC) {
            if (findRoom.teamOne.length < 2) {
                findRoom.teamOne.push(playerObj);
            } else if (findRoom.teamTwo.length < 2) {
                findRoom.teamTwo.push(playerObj);
            } else {
                return { msg: "No available slots in the room.", status: false, code: 400 };
            }

            findRoom.players.push({ UserId: user.token.UserId });
            await findRoom.save();

            if (findRoom.players.length === 4) {
                findRoom.status = 'shuffling';
                await findRoom.save();
                return { msg: "Room started.", status: true, code: 200, data: findRoom };
            }

            return { msg: "Room joined.", status: true, code: 201, data: findRoom };
        } else {
            const newRoom = await PlayingRoom.create({
                teamOne: [playerObj],
                players: [{ UserId: user.token.UserId }],
                createrUserId: user.token.UserId,
                gameId: new mongoose.Types.ObjectId(findTournament.gameId),
                dateOfCreation: new Date().toISOString(),
                roomType: 'tournament',
                tournamentId: new mongoose.Types.ObjectId(findTournament?._id)
            });

            if (newRoom) {
                return { msg: "Room joined.", status: true, code: 201, data: newRoom };
            } else {
                return { msg: "Error creating room.", status: false, code: 500 };
            }
        }
    } catch (error) {
        console.error(error);
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = joinTournamentRoom;
