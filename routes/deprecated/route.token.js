const express = require('express');
const passport = require('passport');
var router = express.Router();
const tokenController = require('../controllers/controller.token');
const tokenLockupController = require('../controllers/token/controller.lockup');
const tokenExchangeRateFeeSettingController = require('../controllers/token/controller.exchangeRateFeeSetting');
const tokenSwapController = require('../controllers/token/controller.swap');
const tokenWithdrawController = require('../controllers/token/controller.withdraw');

/**************************************************
 * 닉네임
 **************************************************/
//[GET] 닉네임 체크.
router.get('/nickname/:nickname', passport.authenticate('jwt', { session: false }), tokenController.nicknameCheck);
//[GET] 다중 닉네임 체크. (다중 닉네임이라서 REST 형식은 POST 로 지정.)
router.post('/nickname', passport.authenticate('jwt', { session: false }), tokenController.nicknamesCheck);

/**************************************************
 * 이벤트 토큰
 **************************************************/
//[GET] 이벤트 토큰 조회
router.get('/event', passport.authenticate('jwt', { session: false }), tokenController.getEvent);
//[POST] 이벤트 토큰 지급
router.post('/event', passport.authenticate('jwt', { session: false }), tokenController.setEventToken);
//[GET] 이벤트 히스토리 조회 (조회 조건때문에 REST 형식은 POST 로 지정.)
router.post('/history', passport.authenticate('jwt', { session: false }), tokenController.getEventTokenHistory);

/**************************************************
 * 락업 토큰
 **************************************************/
//[GET] 락업 토큰 조회
router.get('/lock', passport.authenticate('jwt', { session: false }), tokenLockupController.getLockupToken);
//[POST] 락업 토큰 지급
router.post('/lock', passport.authenticate('jwt', { session: false }), tokenLockupController.setLockupToken);
//[PUT] 락업 토큰 지급 수정
router.post('/lock/modify', passport.authenticate('jwt', { session: false }), tokenLockupController.updateLockupToken);

/**************************************************
 * WITHDRAW / SWAP Exchange Rate / Fee Setting
 **************************************************/

//[GET] withdraw / swap / exchange 모든 setting 값 조회.
router.get(
  '/setting',
  passport.authenticate('jwt', { session: false }),
  tokenExchangeRateFeeSettingController.getTokenSetting
);

//[GET] withdraw setting 값 조회.
router.get(
  '/withdraw/setting',
  passport.authenticate('jwt', { session: false }),
  tokenExchangeRateFeeSettingController.getWithdrawSetting
);
//[POST] withdraw setting 값 저장 / 수정.
router.post(
  '/withdraw/setting',
  passport.authenticate('jwt', { session: false }),
  tokenExchangeRateFeeSettingController.setWithdrawSetting
);

//[GET] swap 수수료 setting 값 조회.
router.get(
  '/swap/fee/setting',
  passport.authenticate('jwt', { session: false }),
  tokenExchangeRateFeeSettingController.getSwapFeeSetting
);
//[POST] swap 수수료 setting 값 저장 / 수정.
router.post(
  '/swap/fee/setting',
  passport.authenticate('jwt', { session: false }),
  tokenExchangeRateFeeSettingController.setSwapFeeSetting
);

//[GET] swap 교환비 setting 값 조회.
router.get(
  '/swap/exchange/setting',
  passport.authenticate('jwt', { session: false }),
  tokenExchangeRateFeeSettingController.getSwapExchangeSetting
);

//[POST] swap 교환비 setting 값 저장 / 수정.
router.post(
  '/swap/exchange/setting',
  passport.authenticate('jwt', { session: false }),
  tokenExchangeRateFeeSettingController.setSwapExchangeSetting
);

/**************************************************
 * 서비스토큰 => 포탈 토큰 SWAP 예약
 **************************************************/

//[GET] swap 예약 내역 조회.
router.get(
  '/swap/reserve/list',
  passport.authenticate('jwt', { session: false }),
  tokenSwapController.getSwapReserveList
);

//[GET] swap 예약 리스트 실행 결과 조회.
router.get(
  '/swap/reserve/execute',
  passport.authenticate('jwt', { session: false }),
  tokenSwapController.getSwapReserveExecute
);

//[PUT] swap 예약 비율 고지.
router.post(
  '/swap/reserve/rateNotice',
  passport.authenticate('jwt', { session: false }),
  tokenSwapController.putSwapReserveRateNotice
);

//[PUT] swap 예약 마감 처리.
router.post(
  '/swap/reserve/close',
  passport.authenticate('jwt', { session: false }),
  tokenSwapController.putSwapReserveClose
);

//[PUT] swap execute 예약 완료 처리.
router.post(
  '/swap/reserve/complete',
  passport.authenticate('jwt', { session: false }),
  tokenSwapController.putSwapReserveExecuteComplete
);

//[POST] swap 예약 완료에 따른 SKP 지급 처리.
router.post(
  '/swap/reserve/payment',
  passport.authenticate('jwt', { session: false }),
  tokenSwapController.postSwapReserveTokenPayment
);

//[GET] 출금 내역 조회.
router.get('/withdraw/list', passport.authenticate('jwt', { session: false }), tokenWithdrawController.getWithdrawList);

module.exports = router;
