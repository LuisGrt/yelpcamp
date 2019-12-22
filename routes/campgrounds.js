const router = require('express').Router(),
	moment 		 = require('moment'),
	Campground = require('../models/campground'),
	middleware = require('../middleware');

let message;

/* GET campgrounds listing. */
router.get('/', (req, res) => {
	Campground.find({}, (err, campgrounds) => {
		if (err) {
			message = ['Oops! There was an error retrieving the campgrounds.', err];
			req.flash('error', message);
			res.redirect('/');
		} else {
			res.render('campgrounds', { campgrounds: campgrounds });
		}
	});
});

/* GET shows form for creating new campground */
router.get('/new', middleware.isLoggedIn, (req, res) => {
	res.render('campgrounds/new');
});

/* POST Creates new campground */
router.post('/', middleware.isLoggedIn, (req, res) => {
	const newCamp = {
		...req.body.campground,
		author: {
			id:       req.user._id,
			username: req.user.username
		}
	};
	Campground.create(newCamp, err => {
		if (err) {
			message = [
				'Sorry! There was an error creating the new campground.',
				err.message
			];
			req.flash('error', message);
			res.redirect('/campgrounds');
		} else {
			message = ['Awesome!', `The new '${newCamp.name}' campground has been added to our database.`];
			req.flash('success', message);
			res.redirect('/campgrounds');
		}
	});
});

/* GET shows selected campground details */
router.get('/:id', (req, res) => {
	Campground.findById(req.params.id)
		.populate('comments')
		.exec((err, campground) => {
			if (err) {
				message = ['Hmm, there was an error.', err.message];
				req.flash('error', message);
				res.redirect('/campgrounds');
			} else if (campground) {
				res.render('campgrounds/show', { campground: campground, moment: moment });
				return;
			} else {
				message = [
					'404 Not Found',
					'Sorry, we could not find the campground you\'re looking for.'
				];
				req.flash('error', message);
				res.redirect('/campgrounds');
			}
		});
});

/* GET shows form for editing campground */
router.get(
	'/:id/edit',
	middleware.isLoggedIn,
	middleware.checkCampgroundOwnership,
	(req, res) => {
		Campground.findById(req.params.id, (err, campground) => {
			if (err) {
				message = ['Yikes! It\'s an error...', err.message];
				req.flash('error', message);
				res.redirect('back');
			} else if (campground) {
				res.render('campgrounds/edit', { campground: campground });
				return;
			} else {
				message = [
					'404 Not Found',
					'Sorry, we could not find the campground you\'re looking for.'
				];
				req.flash('error', message);
				res.redirect('back');
			}
		});
	}
);

/* PUT edits selected campground */
router.put(
	'/:id',
	middleware.isLoggedIn,
	middleware.checkCampgroundOwnership,
	(req, res) => {
		Campground.findByIdAndUpdate(
			req.params.id,
			req.body.campground,
			(err, campground) => {
				if (err) {
					message = ['Yikes! It\'s an error...', err.message];
					req.flash('error', message);
					res.redirect('back');
				} else if (campground) {
					res.redirect('/campgrounds/' + req.params.id);
				} else {
					message = [
						'404 Not Found',
						'Sorry, we could not find the campground you\'re looking for.'
					];
					req.flash('error', message);
					res.redirect('back');
				}
			}
		);
	}
);

/* DELETE selected campground */
router.delete(
	'/:id',
	middleware.isLoggedIn,
	middleware.checkCampgroundOwnership,
	(req, res) => {
		Campground.findByIdAndRemove(req.params.id, function(err) {
			if (err) {
				message = ['Yikes! It\'s an error...', err.message];
				req.flash('error', message);
				res.redirect('/campgrounds');
			} else {
				message = [
					'Campground deleted!',
					'The campground has been deleted successfully from our database.'
				];
				req.flash('success', message);
				res.redirect('/campgrounds');
			}
		});
	}
);

module.exports = router;
