const router = require('express').Router(),
	middleware = require('../middleware'),
	passport = require('passport'),
	User = require('../models/user');

let message;

/* GET home page. */
router.get('/', (req, res) => {
	res.render('index');
});

router.get('/register', middleware.isNotLoggedIn, (req, res) => {
	res.render('register');
});

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

router.get('/login', middleware.isNotLoggedIn, (req, res) => {
	res.render('login');
});

router.post(
	'/login',
	middleware.isNotLoggedIn,
	passport.authenticate('local', {
		successRedirect: '/campgrounds',
		failureRedirect: '/login',
		failureFlash:    true
	})
);

router.get('/logout', (req, res) => {
	req.logout();
	message = ['Logged you out!', 'Have a good day!'];
	req.flash('success', message);
	res.redirect('back');
});

module.exports = router;
