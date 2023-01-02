const express = require('express');
const passport = require('passport');
var router = express.Router();

const appController = require('../controllers/controller.app');

//[GET] 나의 앱 리스트 조회
router.get('/my/apps', appController.getMyApps);

//[GET] 나의 경쟁 앱 리스트 조회
router.get('/competitor/apps', appController.getCompetitorApps);

//[GET] 앱 상세 조회
router.get('/detail', appController.getAppDetail);

// //[GET] Rosetta  Score
// router.get('/score', appController.getRosettaScore);

//[GET] Review  Best / Worst
router.get('/review/summary', appController.getReviewSummary);

//[GET] Review Chart Data
router.get('/review/chart', appController.getReviewChart);

//[GET] Review word cloud
router.get('/review/words', appController.getReviewWords);

//[GET] 카테고리 랭킹
router.get('/category/ranking', appController.getCategoryRanking);

//[POST] My App 등록.
router.post('/my/app', appController.postMyApp);

//[DELETE] My App 삭제.
router.delete('/my/app', appController.deleteMyApp);

//[POST] 경쟁자 App 추가.
router.post('/competitor/app', appController.postCompetitorApp);

//[DELETE] 경쟁자 App 삭제.
router.delete('/competitor/app', appController.deleteCompetitorApp);

module.exports = router;
