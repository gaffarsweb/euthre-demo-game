const UserModel = require('../../user/user.model');

const registerAdmin = async ({ body }) => {
    try {
        // Check if user already exists
        const userExists = await UserModel.findOne({ email: body?.email, active: true });

        if (userExists) {
            return { msg: "An record with this email already exists.", status: false, code: 400 };
        }

        // Set role to admin and create user
        body.role = "admin";
        const newUser = await UserModel.create(body);

        if (newUser) {
            return { data: "Admin registration successful.", status: true, code: 201 };
        } else {
            return { msg: "Failed to register admin, please try again.", status: false, code: 400 };
        }
    } catch (error) {
		console.error("Error while register admin:",error )
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = registerAdmin;
