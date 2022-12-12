// const tokenService = require('../../services/service.token');
// const tokenExchangeRateFeeSettingService = require('../../services/token/service.exchangeRateFeeSetting');
const appService = require('../services/service.app');
const Util = require('../utils/util');

//[GET] 나의 앱 리스트 조회
exports.getMyApps = async (req, res, next) => {
  try {
    const { memberId } = Util.getUserInfoByJWT(req);
    const result = await appService.getMyApps(memberId);
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//[GET] 앱 상세 정보 조회
exports.getAppDetailInfo = async (req, res, next) => {
  try {
    const { memberId } = Util.getUserInfoByJWT(req);
    const appSeq = req.query.appSeq;
    const result = await appService.getAppDetailInfo(appSeq, memberId);
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//[GET] 나의 경쟁 앱 리스트 조회
exports.getCompetitorApps = async (req, res, next) => {
  try {
    const appSeq = req.query.appSeq;
    const { memberId } = Util.getUserInfoByJWT(req);
    const result = await appService.getCompetitorApps(memberId, appSeq);
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//[GET] 나의 앱 및 경쟁자 리스트 한꺼번에 조회
exports.getMyAppAndCopetitorList = async (req, res, next) => {
  try {
    const { memberId } = Util.getUserInfoByJWT(req);
    const result = await appService.getMyAppAndCopetitorList(memberId);
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//[POST] 나의 앱 등록
exports.setMyApps = async (req, res, next) => {
  try {
    const { memberId } = Util.getUserInfoByJWT(req);

    const { result, message } = await appService.setMyApps(memberId, req.body);
    console.log('message: ', message);
    console.log('result123: ', result);
    if (result) {
      return res.send(result);
    } else {
      return res.status(500).send(message);
    }
  } catch (error) {
    console.log('error: ', error);
    return res.status(500).json(error.message);
  }
};

//[POST] 나의 경쟁 앱 등록
exports.setCompetitorApps = async (req, res, next) => {
  try {
    const { memberId } = Util.getUserInfoByJWT(req);

    return res.send('HELLO WORLD');
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//[DELETE] 나의 앱 & 경쟁앱 일괄 삭제
exports.deleteMyApps = async (req, res, next) => {
  try {
    const { result, message } = await appService.deleteMyApps(memberId, req.body);
    if (result) {
      return res.send(result);
    } else {
      return res.status(500).send(message);
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//[GET] review summary (최고점 / 최저점)
exports.getReviewBestWorst = async (req, res, next) => {
  try {
    const appId = req.query.appId;
    const providerType = req.query.providerType;
    const result = await appService.getReviewBestWorst(appId, providerType);
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//[GET] Featured History 조회
exports.getFeaturedHistory = async (req, res, next) => {
  try {
    const providerType = req.query.providerType;
    const result = await appService.getFeaturedHistory(providerType);
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//[GET] Daily Review Count
exports.getDailyReviewCount = async (req, res, next) => {
  try {
    const appId = req.query.appId;
    const providerType = req.query.providerType;
    const result = await appService.getDailyReviewCount(appId, providerType);
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//[GET] Review
exports.getReviewList = async (req, res, next) => {
  try {
    const appId = req.query.appId;
    const providerType = req.query.providerType;
    const result = await appService.getReviewList(appId, providerType);
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
