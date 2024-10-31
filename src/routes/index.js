const express = require('express');
const authRoutes = require("./auth.route")
const userRoutes = require("./user.route")
const playingRoomRoutes = require("./playingRoom.route")
const levelRoutes = require("./level.route")
const storeRoutes = require("./store.route")
const typeRoutes = require("./types.route")

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
	{
		path: '/type',
		route: typeRoutes,
	},
	{
		path: '/store',
		route: storeRoutes,
	},
];

defaultRoutes.forEach((route) => {
	router.use(route.path, route.route);
});

module.exports = router;