const Joi = require('joi');

const addLevel = {
    body: Joi.object().keys({
        levelName: Joi.string().trim().required().messages({
            "string.empty": `Level name is required and cannot be empty.`,
            "any.required": `Level name is a mandatory field.`,
        }),
        price: Joi.number().required().messages({
            "number.base": `Price must be a valid number.`,
            "any.required": `Price is a mandatory field.`,
        }),
        entry: Joi.number().required().messages({
            "number.base": `Entry must be a valid number.`,
            "any.required": `Entry is a mandatory field.`,
        }),
    }),
};

module.exports = {
    addLevel
};
