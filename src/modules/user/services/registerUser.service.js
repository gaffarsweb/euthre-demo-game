const UserModel = require('../user.model');
const bodyParser = require('body-parser');
const DescopeClient = require('@descope/node-sdk').default;
const config = require('../../../config/config');
const sendVerificationEmail = require('../../../utilities/verificationMail');
const Wallet = require('../../wallet/wallet.model');
const { mongo, Mongoose } = require('mongoose');
const { default: mongoose } = require('mongoose');
const generateReferralCode = require('../../../utilities/generateReferralCode');
const Settings = require('../../settings/settings.model');


const registerUser = async ({ body }) => {
	try {
		let referDetails
		let userExistsUsername = await UserModel.findOne({ userName: body?.userName, active: true })

		let userExists = await UserModel.findOne({ email: body?.email, active: true })

		if (userExists || userExistsUsername) {

			if (userExists) {
				return { msg: "User already exists.", status: false, code: 409 };
			} else {
				return { msg: "UserName already exists.", status: false, code: 409 };
			}
		};

		if (body.referralCode) {
			referDetails = await UserModel.findOne({ referralCode: body.referralCode });
			body.referredBy = new mongoose.Types.ObjectId(referDetails._id)
		}



		const descopeClient = DescopeClient({ projectId: config?.DESCOPEP_PROJECT_ID });



		const loginId = body?.email;
		const password = body?.password;
		const user = { email: body?.email };

		const resp = await descopeClient.password.signUp(loginId, password, user);
		if (!resp.ok) {
			// return res.status(400).json({
			//     message: "Failed to sign up",
			//     statusCode: resp.code,
			//     errorCode: resp.error.errorCode,
			//     errorDescription: resp.error.errorDescription,
			//     errorMessage: resp.error.errorMessage,
			// });
			return { msg: resp.error.errorDescription, errorMsg: resp.error.errorMessage, data: resp, status: false, code: 400 }
		} else {
			// create user
			if (resp?.data?.user?.userId) {
				body.descopeId = resp?.data?.user?.userId
				const referralCode = await generateReferralCode(resp?.data?.user?.userId);
				const alreadyAddedReffal = await UserModel.findOne({ referralCode: referralCode });
				if (alreadyAddedReffal) {
					const referralCode = await generateReferralCode(null);
					body.referralCode = referralCode
				} else {
					body.referralCode = referralCode
				}
			} else {
				const referralCode = await generateReferralCode(null);
				body.referralCode = referralCode
			}

			const newUser = await UserModel.create(body);

			if (newUser) {
				const settings = await Settings.findOne();
				console.log('new user', settings)
				await Wallet.create({ userId: new mongoose.Types.ObjectId(newUser._id), balance: settings?.registrationBonus ? settings?.registrationBonus : 400 , descopeId: resp?.data?.user?.userId });
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