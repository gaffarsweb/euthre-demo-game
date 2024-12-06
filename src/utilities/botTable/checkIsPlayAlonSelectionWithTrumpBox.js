const delay = require('./delay');
const playWithPartner = require('./playWithPartnerForBot');



const checkIsBotTrumpSelectionForPlayAlone = async (findedRoom, roomId, PrevTrumpshowUserId, io) => {

    if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId && findedRoom.teamOne[0].role === 'bot') {

        await delay(3000);
        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        findedRoom = UpdatedRoom;

        if (findedRoom.teamTwo[0].UserId === PrevTrumpshowUserId && findedRoom.teamTwo[0].role === 'bot') {

            await delay(3000);
            const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
            findedRoom = UpdatedRoom;

            if (findedRoom.teamOne[1].UserId === PrevTrumpshowUserId && findedRoom.teamOne[1].role === 'bot') {

                await delay(3000);
                const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                findedRoom = UpdatedRoom;

                if (findedRoom.teamTwo[1].UserId === PrevTrumpshowUserId && findedRoom.teamTwo[1].role === 'bot') {

                    await delay(3000);
                    const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                    findedRoom = UpdatedRoom;

                    if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId && findedRoom.teamOne[0].role === 'bot') {
                        await delay(3000);
                        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                        findedRoom = UpdatedRoom;

                        if (findedRoom.teamTwo[0].UserId === PrevTrumpshowUserId && findedRoom.teamTwo[0].role === 'bot') {

                            await delay(3000);
                            const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                            findedRoom = UpdatedRoom;

                            if (findedRoom.teamOne[1].UserId === PrevTrumpshowUserId && findedRoom.teamOne[1].role === 'bot') {

                                await delay(3000);
                                const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                                findedRoom = UpdatedRoom;

                                if (findedRoom.teamTwo[1].UserId === PrevTrumpshowUserId && findedRoom.teamTwo[1].role === 'bot') {

                                    await delay(3000);
                                    const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                                    findedRoom = UpdatedRoom;

                                    if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId && findedRoom.teamOne[0].role === 'bot') {
                                        await delay(3000);
                                        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                                        findedRoom = UpdatedRoom;

                                    }

                                }

                            }
                        }
                    }

                }

            }
        }
    } else if (findedRoom.teamTwo[0].UserId === PrevTrumpshowUserId && findedRoom.teamTwo[0].role === 'bot') {

        await delay(3000);
        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        findedRoom = UpdatedRoom;

        if (findedRoom.teamOne[1].UserId === PrevTrumpshowUserId && findedRoom.teamOne[1].role === 'bot') {

            await delay(3000);
            const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
            findedRoom = UpdatedRoom;

            if (findedRoom.teamTwo[1].UserId === PrevTrumpshowUserId && findedRoom.teamTwo[1].role === 'bot') {

                await delay(3000);
                const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                findedRoom = UpdatedRoom;

                if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId && findedRoom.teamOne[0].role === 'bot') {
                    await delay(3000);
                    const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                    findedRoom = UpdatedRoom;
                    if (findedRoom.teamTwo[0].UserId === PrevTrumpshowUserId && findedRoom.teamTwo[0].role === 'bot') {

                        await delay(3000);
                        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                        findedRoom = UpdatedRoom;

                        if (findedRoom.teamOne[1].UserId === PrevTrumpshowUserId && findedRoom.teamOne[1].role === 'bot') {

                            await delay(3000);
                            const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                            findedRoom = UpdatedRoom;

                            if (findedRoom.teamTwo[1].UserId === PrevTrumpshowUserId && findedRoom.teamTwo[1].role === 'bot') {

                                await delay(3000);
                                const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                                findedRoom = UpdatedRoom;

                                if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId && findedRoom.teamOne[0].role === 'bot') {
                                    await delay(3000);
                                    const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                                    findedRoom = UpdatedRoom;

                                }

                            }

                        }
                    }
                }
            }

        }
    } else if (findedRoom.teamOne[1].UserId === PrevTrumpshowUserId && findedRoom.teamOne[1].role === 'bot') {

        await delay(3000);
        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        findedRoom = UpdatedRoom;

        if (findedRoom.teamTwo[1].UserId === PrevTrumpshowUserId && findedRoom.teamTwo[1].role === 'bot') {

            await delay(3000);
            const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
            findedRoom = UpdatedRoom;

            if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId && findedRoom.teamOne[0].role === 'bot') {
                await delay(3000);
                const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                findedRoom = UpdatedRoom;
                if (findedRoom.teamTwo[0].UserId === PrevTrumpshowUserId && findedRoom.teamTwo[0].role === 'bot') {

                    await delay(3000);
                    const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                    findedRoom = UpdatedRoom;

                    if (findedRoom.teamOne[1].UserId === PrevTrumpshowUserId && findedRoom.teamOne[1].role === 'bot') {

                        await delay(3000);
                        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                        findedRoom = UpdatedRoom;

                        if (findedRoom.teamTwo[1].UserId === PrevTrumpshowUserId && findedRoom.teamTwo[1].role === 'bot') {

                            await delay(3000);
                            const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                            findedRoom = UpdatedRoom;

                            if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId && findedRoom.teamOne[0].role === 'bot') {
                                await delay(3000);
                                const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                                findedRoom = UpdatedRoom;

                            }

                        }

                    }
                }
            }
        }

    } else if (findedRoom.teamTwo[1].UserId === PrevTrumpshowUserId && findedRoom.teamTwo[1].role === 'bot') {

        await delay(3000);
        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
        findedRoom = UpdatedRoom;

        if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId && findedRoom.teamOne[0].role === 'bot') {
            await delay(3000);
            const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
            findedRoom = UpdatedRoom;
            if (findedRoom.teamTwo[0].UserId === PrevTrumpshowUserId && findedRoom.teamTwo[0].role === 'bot') {

                await delay(3000);
                const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                findedRoom = UpdatedRoom;

                if (findedRoom.teamOne[1].UserId === PrevTrumpshowUserId && findedRoom.teamOne[1].role === 'bot') {

                    await delay(3000);
                    const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                    findedRoom = UpdatedRoom;

                    if (findedRoom.teamTwo[1].UserId === PrevTrumpshowUserId && findedRoom.teamTwo[1].role === 'bot') {

                        await delay(3000);
                        const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                        findedRoom = UpdatedRoom;

                        if (findedRoom.teamOne[0].UserId === PrevTrumpshowUserId && findedRoom.teamOne[0].role === 'bot') {
                            await delay(3000);
                            const UpdatedRoom = await playWithPartner(findedRoom, roomId, PrevTrumpshowUserId, io);
                            findedRoom = UpdatedRoom;

                        }

                    }

                }
            }
        }

    }



    return findedRoom
};
module.exports = checkIsBotTrumpSelectionForPlayAlone;