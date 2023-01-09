const express = require('express');
const passport = require('passport');
var router = express.Router();

const keywordController = require('../controllers/controller.keyword');

/**
 * Keyword Main API
 */
//[GET] 메인 > 경쟁자 키워드 조회.
router.get('/main/competitior', keywordController.getMainCompetitior);

//[GET] 메인 > 카테고리 키워드 조회.
router.get('/main/category', keywordController.getMainCategory);

//[GET] 메인 > description 키워드 조회.
router.get('/main/description', keywordController.getMainDescription);

//[GET] 메인 > ranked 키워드 조회.
router.get('/main/ranked', keywordController.getMainRanked);

/**
 * Keyword Custom API
 */

//[GET] 키워드 그룹 조회.
router.get('/groups', keywordController.getKeywordGroups);

//[GET] 등록한 키워드 조회.
router.get('/custom', keywordController.getCustomKeywords);

//[POST] 키워드 등록
router.post('/custom', keywordController.postCustomKeywords);

//[POST] 키워드 아이디로 키워드 등록
router.post('/custom/id', keywordController.postCustomKeywordById);

//[POST] 키워드 아이디로 키워드 삭제
router.delete('/custom', keywordController.deleteCustomKeywordById);

//[PUT] custom 키워드 수정 (color, group)
router.post('/custom/modify', keywordController.putCustomKeywords);

//[GET] custom suggestion 키워드 조회.
router.get('/custom/suggestion', keywordController.getCustomSuggestion);

//[GET] custom 경쟁자 키워드 조회.
router.get('/custom/competitior', keywordController.getCustomCompetitior);

//[GET] custom 히스토리 키워드 조회 (일별 차트).
router.get('/custom/history', keywordController.getCustomHistory);

//[GET] custom 히스토리 > top-app 조회.
router.get('/custom/top-app', keywordController.getCustomTopApp);

module.exports = router;
