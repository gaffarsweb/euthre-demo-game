const express = require('express');
const authRoutes = require("./auth.route")
const userRoutes = require("./user.route")
const playingRoomRoutes = require("./playingRoom.route")
const levelRoutes = require("./level.route")

const router = express.Router();

const defaultRoutes = [
	{
		path: '/auth',
		route: authRoutes,
	},
	{
		path: '/user',
		route: userRoutes,
	},
	{
		path: '/playing-room',
		route: playingRoomRoutes,
	},
	{
		path: '/level',
		route: levelRoutes,
	},
];

defaultRoutes.forEach((route) => {
	router.use(route.path, route.route);
});

module.exports = router;