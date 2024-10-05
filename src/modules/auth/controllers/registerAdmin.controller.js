const httpStatus = require('http-status');
const catchAsync = require('../../../utilities/catchAsync');
const sendResponse = require('../../../utilities/responseHandler');
const authService = require("../services");

const registerAdmin = catchAsync(async (req, res) => {
	let body = req?.body || {};

	let addResult = await authService.registerAdmin({ body });

	if (addResult?.status) {
		sendResponse(res, httpStatus.CREATED, addResult?.data, null);
	} else {
		sendResponse(res,
			addResult?.code === 500 ? httpStatus.INTERNAL_SERVER_ERROR
				: httpStatus.BAD_REQUEST,
			null,
			addResult?.msg
		);
	}
});

module.exports = registerAdmin;
