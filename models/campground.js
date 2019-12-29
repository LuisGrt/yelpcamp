const mongoose = require('mongoose'),
	campgroundSchema = new mongoose.Schema({
		name:        String,
		image:       String,
		description: String,
		price:       Number,
		address:     String,
		location:    {
			lat: Number,
			lng: Number
		},
		author: {
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref:  'User'
			},
			username: String
		},
		comments: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref:  'Comment'
			}
		],
		created: {
			type:    Date,
			default: Date.now
		},
		lastEditedOn: {
			type:    Date,
			default: null
		}
	});

module.exports = mongoose.model('Campground', campgroundSchema);
