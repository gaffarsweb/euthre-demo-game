const express = require("express");
const path = require("path");
const cors = require("cors");
const httpStatus = require("http-status");
const config = require('./config/config');
const morgan = require('./config/morgan');
// authentication
const session = require('express-session');
const passport = require('passport');
const { jwtStrategy } = require('./config/jwtStrategy');

const { authLimiter } = require('./middlewares/rateLimiter');
const ApiError = require("./utilities/apiErrors");
// routes
const routes = require('./routes');
const { errorConverter, errorHandler } = require("./middlewares/error");

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const PlayingRoom = require("./modules/playingroom/playingRoom.model");
const { default: mongoose } = require("mongoose");
const io = new Server(server, {
	cors: {
		origin: "*", // Change to your frontend URL for production
		methods: ["GET", "POST"],
		allowedHeaders: ["Authorization"],
		credentials: true
	}
});

if (config.env !== 'test') {
	app.use(morgan.successHandler);
	app.use(morgan.errorHandler);
}

// parse json request body
app.use(express.json({ limit: '50mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// enable cors
app.use(cors());
app.options('*', cors());

// Limit repeated failed requests to auth endpoints
if (config.env === 'production') {
	// Apply authLimiter middleware to authentication endpoints
	app.use('/v1/auth', authLimiter);
}

//Middleware
app.use(session({
	secret: process.env.JWT_SECRET || "nodeinitialsecretkey",
	resave: false,
	saveUninitialized: true,
}))

// User serialization and deserialization
passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

// Initialize Passport and use session middleware
app.use(passport.initialize());
app.use(passport.session());

// Register JWT authentication strategy
passport.use('jwt', jwtStrategy);

app.use('/v1', routes);

app.use((req, res, next) => {
	const error = new ApiError(httpStatus.NOT_FOUND, 'API Not Found');
	next(error); // Passes the error to the error-handling middleware
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);
const rooms = {};
const array = [];
const playinArray = [];
io.on('connection', (socket) => {
	console.log('a user connected');

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on('joinedRoom', async (e) => {

		console.log(e.roomId)
		if (e.roomId) {
			const findedRoom = await PlayingRoom.findOne({ _id: new mongoose.Types.ObjectId(e.roomId) });
			if (findedRoom) {

				socket.emit('roomUpdates', { roomData: findedRoom })

			}
		}

	})

});
module.exports = { app, server };