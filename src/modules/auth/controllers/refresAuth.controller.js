const authService = require("../services");
const catchAsync = require('../../../utilities/catchAsync');

const refreshTokens = catchAsync(async (req, res) => {
    console.log("esdfv");
    
    const tokens = await authService.refreshAuth(req.body.refreshToken);
    console.log("tokan", tokens);

    res.send({ ...tokens });
});

module.exports = refreshTokens;