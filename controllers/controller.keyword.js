const { customKeywords, competitorKeywords, keywordDailyRanking, keywordTopApp } = require('../mock/keyword');
const Util = require('../utils/util');
/**
 * [GET] 메인 > 경쟁자 키워드 조회.
 */
exports.getMainCompetitior = async (req, res, next) => {
  try {
    const { userId } = Util.getUserInfoByJWT(req);
    const { appId, country, providerType } = req.query;
    const result = competitorKeywords;
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [GET] 메인 > 카테고리 키워드 조회.
 */
exports.getMainCategory = async (req, res, next) => {
  try {
    const { userId } = Util.getUserInfoByJWT(req);
    const { categoryId } = req.query;
    const result = competitorKeywords;
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [GET] 메인 > description 키워드 조회.
 */
exports.getMainDescription = async (req, res, next) => {
  try {
    const { appId, country, providerType } = req.query;
    const result = competitorKeywords;
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [GET] 메인 > ranked 키워드 조회.
 */
exports.getMainRanked = async (req, res, next) => {
  try {
    const { appId, country, providerType, startRank, endRank } = req.query;
    const result = competitorKeywords;
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [GET] 키워드 그룹 조회.
 */
exports.getKeywordGroups = async (req, res, next) => {
  try {
    const { userId } = Util.getUserInfoByJWT(req);
    const result = [
      { groupId: 'group1', groupName: 'Group1' },
      { groupId: 'group2', groupName: 'Group2' },
      { groupId: 'group3', groupName: 'Group3' },
      { groupId: 'group4', groupName: 'Group4' },
    ];
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [GET] 등록한 키워드 조회.
 */
exports.getCustomKeywords = async (req, res, next) => {
  try {
    const { userId } = Util.getUserInfoByJWT(req);
    const { appId, country, providerType } = req.query;
    const result = customKeywords;
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [POST] 키워드 등록
 */
exports.postCustomKeywords = async (req, res, next) => {
  try {
    const { userId } = Util.getUserInfoByJWT(req);
    const { keyword } = req.body;
    const result = true;
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [PUT] custom 키워드 수정 (color, group)
 */
exports.putCustomKeywords = async (req, res, next) => {
  try {
    const { userId } = Util.getUserInfoByJWT(req);
    const { color, groupId, keywordId } = req.body;
    const result = true;
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [GET] custom suggestion 키워드 조회.
 */
exports.getCustomSuggestion = async (req, res, next) => {
  try {
    const { appId, country, providerType } = req.query;
    const result = customKeywords;
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [GET] custom 경쟁자 키워드 조회.
 */
exports.getCustomCompetitior = async (req, res, next) => {
  try {
    const { userId } = Util.getUserInfoByJWT(req);
    const { appId, country, providerType } = req.query;
    const result = customKeywords;
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [GET] custom 히스토리 키워드 조회 (일별 차트).
 */
exports.getCustomHistory = async (req, res, next) => {
  try {
    const { userId } = Util.getUserInfoByJWT(req);
    const { appId, country, providerType } = req.query;
    const result = keywordDailyRanking;
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [GET] custom 히스토리 > top-app 조회.
 */
exports.getCustomTopApp = async (req, res, next) => {
  try {
    const { userId } = Util.getUserInfoByJWT(req);
    const { appId, country, providerType } = req.query;
    const result = keywordTopApp;
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
