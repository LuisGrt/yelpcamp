const Campground = require('../models/campground'),
	Comment = require('../models/comment');

let message;

const controller = {};

controller.create = (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			message = ['Yikes! This seems like an error...', err.message];
			req.flash('error', message);
			res.redirect('back');
		} else if (campground) {
			const newComment = {
				text:   req.body.comment,
				author: {
					id:       req.user._id,
					username: req.user.username
				}
			};
			Comment.create(newComment, function(err, comment) {
				if (err) {
					message = ['Something went wrong...', err.message];
					req.flash('error', message);
					res.redirect('back');
				} else {
					campground.comments.push(comment);
					campground.save();
					message = ['Success!', 'New comment added!'];
					req.flash('success', message);
					res.redirect(`/campgrounds/${campground._id}`);
				}
			});
		}
	});
};

controller.edit = (req, res) => {
	Comment.findById(req.params.commentId, (err, comment) => {
		if (err) {
			message = ['Something went wrong...', err.message];
			req.flash('error', message);
			res.redirect('back');
		} else if(comment) {
			res.render('comments/edit', {
				campgroundId: req.params.id,
				comment:      comment
			});
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
	const commentEdited = {
		...req.body.comment,
		lastEditedOn: Date.now()
	};
	console.log(commentEdited);
	Comment.findByIdAndUpdate(req.params.commentId, commentEdited, (err) => {
		if (err){
			message = ['Something went wrong...', err.message];
			req.flash('error', message);
			res.redirect('back');
		} else {
			message = ['It\'s done!', 'Your comment has been updated successfully!'];
			req.flash('success', message);
			res.redirect(`/campgrounds/${req.params.id}` );
		}
	});
};

controller.delete = (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err) {
			message = ['Something went wrong...', err.message];
			req.flash('error', message);
			res.redirect('back');
			return;
		}
		Comment.findByIdAndRemove(req.params.commentId, err => {
			if (err) {
				message = ['Something went wrong...', err.message];
				req.flash('error', message);
				res.redirect('back');
			} else {
				const index = campground.comments.indexOf(req.params.commentId);
				campground.comments.splice(index, 1);
				campground.save();
				message = ['Done!', 'Your comment has been deleted.'];
				req.flash('success', message);
				res.redirect(`/campgrounds/${req.params.id}`);
			}
		});
	});
};

module.exports = controller;
