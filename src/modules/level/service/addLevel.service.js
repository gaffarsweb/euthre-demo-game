const mongoose = require('mongoose');
const levelModel = require('../level.model');

const addLevel = async ({ user, body }) => {
    try {
        console.log(user, body);

        if (!user || !body || !body.levelName) {
            throw new Error('Invalid input: user, body, or levelName is missing');
        }

        const existingLevel = await levelModel.findOne({ levelName: body.levelName });
        if (existingLevel) {
            throw new Error(`Level with name '${body.levelName}' already exists`);
        }

        const result = await levelModel.create({
            userId: user._id,
            entry: body?.entry,
            levelName: body?.levelName,
            price: body?.price,

        });

        if (result) {
            return {
                msg: "Level added",
                data: result,
                status: true,
                code: 201,
            };
        } else {
            throw new Error('Failed to create level');
        }
    } catch (error) {
        console.error(error);
        return {
            msg: "Something went wrong, please try again.",
            status: false,
            code: 400,
        };
    }
};

module.exports = addLevel;