const router = require('express').Router(),
	middleware = require('../middleware'),
	passport = require('passport'),
	User = require('../models/user');

let message;

/* GET home page. */
router.get('/', (req, res) => {
	res.render('index');
});

router.get('/register',
	middleware.isNotLoggedIn,
	middleware.getReferer,
	(req, res) => {
		res.render('register', {referer: req.referer});
	}
);

router.post('/register', middleware.isNotLoggedIn, (req, res) => {
	if (req.body.username && req.body.password) {
		User.register(
			{ username: req.body.username },
			req.body.password,
			(err, user) => {
				if (err) {
					message = ['Oops! There was an error', err.message];
					req.flash('error', message);
					res.redirect('back');
				} else {
					passport.authenticate('local')(req, res, () => {
						message = [
							'Registration successful!',
							`Welcome to YelpCamp <strong>${user.username}</strong>`
						];
						req.flash('success', message);
						res.redirect('/campgrounds');
					});
				}
			}
		);
	} else {
		message = [
			'Aren\'t you forgetting something?',
			'Username and password are required!'
		];
		req.flash('error', message);
		res.redirect('back');
	}
});

router.get('/login',
	middleware.isNotLoggedIn,
	middleware.getReferer,
	(req, res) => {
		res.render('login', {referer: req.referer});
	}
);

router.post(
	'/login',
	middleware.isNotLoggedIn,
	passport.authenticate('local', {
		failureRedirect: '/login',
		failureFlash:    true
	}), (req, res) => {
		message = [`Welcome ${req.user.username}!`, 'You\'ve started a new session, enjoy your stay!'];
		req.flash('success', message);
		res.redirect(req.body.referer);
	}
);

router.get('/logout', (req, res) => {
	req.logout();
	message = ['Logged you out!', 'Have a good day!'];
	req.flash('success', message);
	res.redirect('back');
});

module.exports = router;
