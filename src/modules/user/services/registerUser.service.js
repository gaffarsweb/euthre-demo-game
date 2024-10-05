const UserModel = require('../user.model');
const bodyParser = require('body-parser');
const DescopeClient = require('@descope/node-sdk').default;
const config = require('../../../config/config');
const sendVerificationEmail = require('../../../utilities/verificationMail');


const registerUser = async ({ body }) => {
	try {

		let userExistsUsername = await UserModel.findOne({ userName: body?.userName, active: true })

		let userExists = await UserModel.findOne({ email: body?.email, active: true })

		if (userExists || userExistsUsername) {

			return { msg: "User already exists.", status: false, code: 409 };

		}



		const descopeClient = DescopeClient({ projectId: config?.DESCOPEP_PROJECT_ID });
		

		
		const loginId = body?.email;
		const password = body?.password;
		const user = {email:body?.email};
		
		const resp = await descopeClient.password.signUp(loginId, password, user);
		if (!resp.ok) {
			// return res.status(400).json({
			//     message: "Failed to sign up",
			//     statusCode: resp.code,
			//     errorCode: resp.error.errorCode,
			//     errorDescription: resp.error.errorDescription,
			//     errorMessage: resp.error.errorMessage,
			// });
			return {msg:resp.error.errorDescription, errorMsg:resp.error.errorMessage, data: resp, status:false, code:400}
		} else {
			// create user
			if(resp?.data?.user?.userId){
				body.descopeId = resp?.data?.user?.userId
			}
			
			const newUser = await UserModel.create(body);

			if (newUser) {
				await sendVerificationEmail(body?.email)
				return { msg: "Registration successful.", status: true, code: 201, data: resp };
			} else {
				return { msg: "Something went wrong, please try again.", status: false, code: 400 };
			}
		}




	} catch (error) {
		return { msg: error.message, status: false, code: 500 };
	}
};

module.exports = registerUser;