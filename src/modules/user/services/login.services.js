const UserModel = require('../user.model');
const TokenServices = require('../../token/token.services')
const bcrypt = require("bcryptjs")
const bodyParser = require('body-parser');
const config = require('../../../config/config')
// Correctly import the DescopeClient
const DescopeClient = require('@descope/node-sdk').default;

const login = async ({ body }) => {
    try {
        let userExists = await UserModel.findOne({ email: body?.loginId, active: true })

        let userExistsUserName = await UserModel.findOne({ userName: body?.loginId, active: true })

        if (userExists || userExistsUserName) {

            const existtedUser = userExistsUserName ? userExistsUserName : userExists

            let matchPassword = await bcrypt.compare(body.password, existtedUser?.password)

            if (!matchPassword) {

                return { msg: "Incorrect Password.", status: false, code: 401 }

            }

            const descopeClient = DescopeClient({ projectId: config?.DESCOPEP_PROJECT_ID, managementKey: config?.DESCOPE_MANAGEMENT_KEY, });

            const loginId = existtedUser?.email;

            const resp = await descopeClient.password.signIn(loginId, body.password);
            if (resp.ok) {
                if(existtedUser?.isEmailVerified){
                    return { data: resp, status: true, code: 200 }
                }else if(!existtedUser?.isEmailVerified){
                    return { msg: 'verify your email. A verification link has been sent to your email address.', status:false, code:401}
                }

            } else {

                const searchReq = {
                    emails: [existtedUser.email],
                    limit: 1
                };
                const descopeResp = await descopeClient.management.user.search(searchReq);
                const descopeUsers = descopeResp.data;
                if (descopeUsers.length !== 0) {
                    return { msg: "Incorrect password.", status: false, code: 401 };
                } else {
                    const loginId = existtedUser?.email;
                    const password = body?.password;
                    const user = { email: existtedUser?.email };

                    const newResponse = await descopeClient.password.signUp(loginId, password, user);
                    if (!newResponse.ok) {
                        return { msg: newResponse.error.errorDescription, errorMsg: newResponse.error.errorMessage, data: newResponse, status: false, code: 400 }
                    } else {
                        if (body.password) {
                            const hashedPassword = await bcrypt.hash(body.password, 10);
                            body.password = hashedPassword;
                        }
                        if (newResponse?.data?.user?.userId) {
                            body.descopeId = newResponse?.data?.user?.userId
                        }
                        if (existtedUser?.isEmailVerified) {
                            // Call Descope's update method to verify the email
                            const loginId = existtedUser?.email
                            const updatedDescope = await descopeClient.management.user.update(
                                loginId,
                                {
                                    verifiedEmail: true,
                                    email: existtedUser?.email
                                }
                            );

                            if (!updatedDescope.ok) {
                                console.log('Failed to update email verification status in Descope:', updatedDescope.error);
                                // You can return an error message or continue based on your application's needs
                            } else {
                                console.log('Email verification status updated in Descope:', updatedDescope.data);
                            }
                        }


                        const newUser = await UserModel.findOneAndUpdate({ email: existtedUser?.email }, body);

                        if (newUser) {
                            return { data: newResponse, status: true, code: 200 }
                        } else {
                            return { msg: "Something went wrong, please try again.", status: false, code: 400 };
                        }
                    }
                }

            }

        } else {
            return { msg: "Incorrect login ID or password.", data: null, status: false, code: 400 }
        }

    } catch (error) {

        return { msg: error.message, status: false, code: 500 };

    }
};

module.exports = login;