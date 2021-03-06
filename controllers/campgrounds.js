const moment 		 		= require('moment'),
	Campground		 		= require('../models/campground'),
	Comment						= require('../models/comment'),
	googleMapsClient 	= require('@google/maps').createClient({
		key:     process.env.GEO_API,
		Promise: Promise
	});

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
	googleMapsClient.geocode({address: newCamp.address})
		.asPromise()
		.then((response) => {
			if (response.json.results.length > 0) {
				newCamp.address = response.json.results[0].formatted_address;
				newCamp.location = response.json.results[0].geometry.location;
			}
			Campground.create(newCamp, (err, camp) => {
				if (err) {
					message = [
						'Sorry! We couldn\'t create the new campground',
						err.message
					];
					req.flash('error', message);
					res.redirect('back');
				} else {
					message = ['Awesome!', `The new '<strong>${camp.name}</strong>' campground has been added to our database.`];
					req.flash('success', message);
					res.redirect(`/campgrounds/${camp._id}`);
				}
			});
		})
		.catch((err) => {
			message = [
				'Sorry! We couldn\'t create the new campground',
				err.json.error_message
			];
			req.flash('error', message);
			res.redirect('/campgrounds');
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
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			message = ['Yikes! It\'s an error...', err.message];
			req.flash('error', message);
			res.redirect('back');
		} else if (campground) {
			const price = Number(req.body.campground.price);
			if (isNaN(price)) {
				message = [
					'Wait! Something is not right...',
					'The <strong><em>price</em></strong> should be <strong>numbers only</strong>, please check that up and try again.'
				];
				req.flash('error', message);
				res.redirect('back');
			} else {
				if (campground.address !== req.body.campground.address) {
					googleMapsClient.geocode({address: req.body.campground.address})
						.asPromise()
						.then((response) => {
							if (response.json.results.length > 0) {
								campground.address = response.json.results[0].formatted_address;
								campground.location = response.json.results[0].geometry.location;
							} else {
								campground.address = req.body.campground.address;
							}
							campground.name = req.body.campground.name;
							campground.image = req.body.campground.image;
							campground.price = req.body.campground.price;
							campground.description = req.body.campground.description;
							campground.lastEditedOn = Date.now();
							campground.save();
							message = ['Looking good!', 'The campground has been updated successfully.'];
							req.flash('success', message);
							res.redirect(`/campgrounds/${req.params.id}`);
						})
						.catch((err) => {
							message = [
								'Sorry! There was an error updating the campground.',
								err.json.error_message
							];
							req.flash('error', message);
							res.redirect('back');
						});
				} else {
					campground.name = req.body.campground.name;
					campground.image = req.body.campground.image;
					campground.price = req.body.campground.price;
					campground.description = req.body.campground.description;
					campground.lastEditedOn = Date.now();
					campground.save();
					message = ['Looking good!', 'The campground has been updated successfully.'];
					req.flash('success', message);
					res.redirect(`/campgrounds/${req.params.id}`);
				}
			}
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
	Campground.findById(req.params.id, async (err, campground) => {
		if (err) {
			message = ['Yikes! It\'s an error...', err.message];
			req.flash('error', message);
			res.redirect('/campgrounds');
		} else if (campground) {
			Campground.deleteOne({_id: campground._id}, {single: true}, err => {
				if(err) {
					message = [
						'Something bad happened...',
						err.message
					];
					req.flash('error', message);
					res.redirect('/campgrounds');
				} else {
					campground.comments.forEach(async comment => {
						await Comment.deleteOne({_id: comment}, {single: true});
					});
					message = [
						'Campground deleted!',
						'The campground has been deleted successfully from our database.'
					];
					req.flash('success', message);
					res.redirect('/campgrounds');
				}
			});
		} else {
			message = ['Yikes! It\'s an error...', err.message];
			req.flash('error', message);
			res.redirect('/campgrounds');
		}
	});
};

module.exports = controller;
