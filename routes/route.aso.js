const express = require('express');
const passport = require('passport');
var router = express.Router();

const asoController = require('../controllers/controller.aso');

//[GET] Rosetta Score status 조회
router.get('/rosetta/score/status', asoController.getRosettaScoreStatus);

//[GET] Rosetta Score 일별 조회
router.get('/rosetta/score/daily', asoController.getRosettaScoreDaily);

module.exports = router;
