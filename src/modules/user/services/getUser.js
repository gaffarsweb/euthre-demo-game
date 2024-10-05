const User = require('../user.model');


const getUserById = async (id) => {
    return User.findById(id);
};

module.exports = getUserById;