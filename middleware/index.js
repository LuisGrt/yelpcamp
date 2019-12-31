const Campground = require('../models/campground'),
	Comment = require('../models/comment'),
	middleware = {};
let message;

middleware.checkCampgroundOwnership = (req, res, next) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			message = [
				'404 Not Found',
				'Sorry! The campground you\'re looking for cannot be found.'
			];
			req.flash('error', message);
			res.redirect('back');
		} else {
			// does user own the campground?
			if (campground.author.id.equals(req.user._id) || req.user.isAdmin) {
				next();
			} else {
				message = ['Unauthorized', 'You don\'t have permission to do that!'];
				req.flash('error', message);
				res.redirect('back');
			}
		}
	});
};

middleware.checkCommentOwnership = (req, res, next) => {
	Comment.findById(req.params.commentId, function(err, comment) {
		if (err) {
			message = [
				'404 Not Found',
				'Sorry! The comment you\'re looking for cannot be found.'
			];
			req.flash('error', message);
			res.redirect('back');
		} else {
			// does user own the comment?
			if (comment.author.id.equals(req.user._id) || req.user.isAdmin) {
				next();
			} else {
				message = ['Unauthorized', 'You don\'t have permission to do that!'];
				req.flash('error', message);
				res.redirect('back');
			}
		}
	});
};

middleware.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	message = [
		'Unauthorized',
		'You must be logged in to do that. Please <a href="/login" class="alert-link">login</a> or <a href="/register" class="alert-link">signup</a>.'
	];
	req.flash('error', message);
	res.redirect('back');
};

middleware.isNotLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		return next();
	}
	message = ['Oops!', 'You\'re already logged.'];
	req.flash('error', message);
	res.redirect('back');
};

middleware.getReferer = (req, res, next) => {
	let ref = req.headers.referer;
	if (ref) {
		ref = ref.search('login') != -1 || ref.search('register') != -1 ? '/campgrounds' : ref;
	} else {
		ref = '/campgrounds';
	}
	req.referer = ref;
	return next();
};

module.exports = middleware;
