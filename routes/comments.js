const router = require('express').Router({ mergeParams: true }),
	controller = require('../controllers/comments'),
	middleware = require('../middleware');

router.post('/', middleware.isLoggedIn, controller.create);

router.get(
	'/:commentId/edit',
	middleware.isLoggedIn,
	middleware.checkCommentOwnership,
	controller.edit
);

router.put(
	'/:commentId',
	middleware.isLoggedIn,
	middleware.checkCommentOwnership,
	controller.update
);

router.delete(
	'/:commentId',
	middleware.isLoggedIn,
	middleware.checkCommentOwnership,
	controller.delete
);

module.exports = router;
