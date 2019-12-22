const moment 		 = require('moment'),
	Campground		 = require('../models/campground');

let message;

const controller = {};

controller.list = (req, res) => {
	Campground.find({}, (err, campgrounds) => {
		if (err) {
			message = ['Oops! There was an error retrieving the campgrounds.', err];
			req.flash('error', message);
			res.redirect('/');
		} else {
			res.render('campgrounds', { campgrounds: campgrounds });
		}
	});
};

controller.new = (req, res) => {
	res.render('campgrounds/new');
};

controller.create = (req, res) => {
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
			message = ['Awesome!', `The new '<strong>${newCamp.name}</strong>' campground has been added to our database.`];
			req.flash('success', message);
			res.redirect('/campgrounds');
		}
	});
};

controller.show = (req, res) => {
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
};

controller.edit = (req, res) => {
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
};

controller.update = (req, res) => {
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
};

controller.delete = (req, res) => {
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
};

module.exports = controller;
