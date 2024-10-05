const mongoose = require('mongoose');
const levelModel = require('../level.model');

const getAllLevel = async () => {
    try {
        const levels = await levelModel.find();
        if (levels) {
            return {
                msg: "Level fetched",
                data: levels,
                status: true,
                code: 200,
            };
        } else {
            throw new Error('Failed to fetch level');
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

module.exports = getAllLevel;