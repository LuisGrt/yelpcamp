const express = require('express'),
	path = require('path'),
	cookieParser = require('cookie-parser'),
	mongoose = require('mongoose'),
	session = require('express-session'),
	flash = require('connect-flash'),
	passport = require('passport'),
	LocalStrategy = require('passport-local'),
	methodOverride = require('method-override'),
	logger = require('morgan');

// Requiring user model
const User = require('./models/user');

// Requiring routes
const indexRouter = require('./routes/index'),
	commentsRouter = require('./routes/comments'),
	campgroundsRouter = require('./routes/campgrounds');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(flash());
app.use(
	session({
		secret:            'Truth can only be found in one place: the code.',
		resave:            false,
		saveUninitialized: false
	})
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Database connection
mongoose
	.connect(
		process.env.DB || 'mongodb://localhost/yelpcamp', {
			useNewUrlParser:    true,
			useUnifiedTopology: true,
			useFindAndModify:   false
		})
	.then(() => {
		console.log('Successfully connected to DB!');
		app.use((req, res, next) => {
			res.locals.currentUser = req.user;
			res.locals.error = req.flash('error');
			res.locals.success = req.flash('success');
			if(!req.cookies.yelpcamp) {
				res.cookie('yelpcamp', 1, {
					maxAge:   9000000,
					httpOnly: true,
					sameSite: false,
					secure:   true
				});
			}
			next();
		});

		app.use('/', indexRouter);
		app.use('/campgrounds', campgroundsRouter);
		app.use('/campgrounds/:id/comments', commentsRouter);

		// error handler
		app.use((req, res) => {
			// set locals, only providing error in development
			res.locals.message = '404 Not Found';

			// render the error page
			res.status(404);
			res.render('error');
		});
	})
	.catch(error => {
		app.use((req, res) => {
			// set locals, only providing error in development
			console.log(error.reason);
			res.locals.message = '500 Internal Server Error';

			// render the error page
			res.status(404);
			res.render('error');
		});
	});

module.exports = app;
