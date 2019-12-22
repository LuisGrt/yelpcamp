const router = require('express').Router(),
	controller = require('../controllers/campgrounds'),
	middleware = require('../middleware');

/* GET campgrounds listing. */
router.get('/', controller.list);

/* GET shows form for creating new campground */
router.get('/new', middleware.isLoggedIn, controller.new);

/* POST Creates new campground */
router.post('/', middleware.isLoggedIn, controller.create);

/* GET shows selected campground details */
router.get('/:id', controller.show);

/* GET shows form for editing campground */
router.get(
	'/:id/edit',
	middleware.isLoggedIn,
	middleware.checkCampgroundOwnership,
	controller.edit
);

/* PUT edits selected campground */
router.put(
	'/:id',
	middleware.isLoggedIn,
	middleware.checkCampgroundOwnership,
	controller.update
);

/* DELETE selected campground */
router.delete(
	'/:id',
	middleware.isLoggedIn,
	middleware.checkCampgroundOwnership,
	controller.delete
);

module.exports = router;
