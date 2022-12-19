const express = require('express');
const passport = require('passport');
var router = express.Router();

const accountController = require('../controllers/controller.account');

router.post('/signin', accountController.login);

module.exports = router;
