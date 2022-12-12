const express = require('express');
const passport = require('passport');
var router = express.Router();

const appController = require('../controllers/controller.app');

//[GET] 나의 앱 리스트 조회
router.get('/my', appController.getMyApps);

//[GET] 나의 앱 리스트 조회
router.get('/detail', appController.getAppDetailInfo);

//[GET] 나의 경쟁 앱 리스트 조회
router.get('/competitor', appController.getCompetitorApps);

//[POST] 나의 앱 등록
router.post('/my', appController.setMyApps);

//[GET] 나의 앱 및 경쟁자 리스트 한꺼번에 조회
router.get('/my/competitor', appController.getMyAppAndCopetitorList);

//[POST] 나의 경쟁 앱 등록 / 수정
router.post('/competitor', appController.setCompetitorApps);

//[DELETE] 나의 앱 삭제
router.delete('/my', appController.deleteMyApps);

//[GET] review summary (최고점 / 최저점)
router.get('/review/bestworst', appController.getReviewBestWorst);

//[GET] Featured History
router.get('/featured', appController.getFeaturedHistory);

//[GET] Daily Review Count
router.get('/review/daily', appController.getDailyReviewCount);

//[GET] Review
router.get('/review', appController.getReviewList);

module.exports = router;
