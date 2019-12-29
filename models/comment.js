const mongoose = require('mongoose'),
	CommentSchema = mongoose.Schema({
		text:   String,
		author: {
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref:  'User'
			},
			username: String
		},
		created: {
			type:    Date,
			default: Date.now
		},
		lastEditedOn: {
			type:    Date,
			default: null
		}
	});

module.exports = mongoose.model('Comment', CommentSchema);
