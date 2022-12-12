const express = require('express');
const passport = require('passport');
var router = express.Router();

const usersController = require('../controllers/controller.users');

router.post('/list', passport.authenticate('jwt', { session: false }), usersController.getUserList);
router.get('/detail', passport.authenticate('jwt', { session: false }), usersController.getUserDetail);
router.get('/detail/point', passport.authenticate('jwt', { session: false }), usersController.getPointHistory);
router.get('/detail/skp', passport.authenticate('jwt', { session: false }), usersController.getSkpHistory);

module.exports = router;
