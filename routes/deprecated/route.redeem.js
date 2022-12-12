const express = require('express');
const passport = require('passport');
var router = express.Router();

const redeemController = require('../controllers/controller.redeem');

//리딤 코드 리스트 조회
router.get('/codes', passport.authenticate('jwt', { session: false }), redeemController.getRedeemCodes);
//리딤 코드 단건 상세 조회
router.get('/code', passport.authenticate('jwt', { session: false }), redeemController.getRedeemCode);
//리딤 코드 생성 / 수정
router.post('/code', passport.authenticate('jwt', { session: false }), redeemController.setRedeemCode);
//리딤 코드 보상 수령 로그
router.get('/code/history', passport.authenticate('jwt', { session: false }), redeemController.getRedeemCodeHistory);
//리딤 코드 보상 아이템 목록
router.get('/items', passport.authenticate('jwt', { session: false }), redeemController.getRedeemCodeItems);

//리딤 코드 보상 아이템 생성
router.post('/item', passport.authenticate('jwt', { session: false }), redeemController.setRedeemCodeItem);
//리딤 코드 보상 아이템 삭제
router.delete('/item', passport.authenticate('jwt', { session: false }), redeemController.delRedeemCodeItem);

module.exports = router;
