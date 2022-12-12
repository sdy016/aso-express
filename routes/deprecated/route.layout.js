const express = require('express');
const passport = require('passport');
var router = express.Router();

const layoutController = require('../controllers/controller.layout');

router.get('/leftMenu', passport.authenticate('jwt', { session: false }), layoutController.getLeftMenu);
router.get('/company/list', passport.authenticate('jwt', { session: false }), layoutController.getCompanyBySU);

module.exports = router;
