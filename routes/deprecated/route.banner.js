const express = require('express');
const passport = require('passport');
var router = express.Router();

const { isLoggedIn, isNotLoggedIn } = require('../middleware/middleware.auth');
const bannerController = require('../controllers/controller.banner');
const multer = require('multer');
const { multerConfig } = require('../config/multer.config');

var upload = multer(multerConfig);

router.get('/:bannerType', passport.authenticate('jwt', { session: false }), bannerController.getAllMainBanner);
router.get('/portal/:bannerType', bannerController.getPortalMainBanner);
router.get('/banner/:id', passport.authenticate('jwt', { session: false }), bannerController.getMainBannerById);
router.post('/', passport.authenticate('jwt', { session: false }), bannerController.createMainBanner);
router.post('/banner/update', passport.authenticate('jwt', { session: false }), bannerController.updateMainBanner);
router.post('/banner/delete', passport.authenticate('jwt', { session: false }), bannerController.deleteMainBanner);
router.post('/banner/pause', passport.authenticate('jwt', { session: false }), bannerController.pauseMainBanner);
router.post('/banner/play', passport.authenticate('jwt', { session: false }), bannerController.playMainBanner);
router.post('/files', upload.single('files'), bannerController.uploadFiles);

module.exports = router;
