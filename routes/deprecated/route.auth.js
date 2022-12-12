const express = require('express');
const passport = require('passport');
var router = express.Router();

const authController = require('../../controllers/deprecated/controller.auth');

router.post('/signin', authController.login);
router.get('/userinfo', passport.authenticate('jwt', { session: false }), authController.userinfo);
router.post('/password', passport.authenticate('jwt', { session: false }), authController.setPassword);
router.post('/userinfo', passport.authenticate('jwt', { session: false }), authController.setUserInfo);
module.exports = router;
