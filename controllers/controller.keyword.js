const { customKeywords, competitorKeywords } = require('../mock/keyword');

/**
 * [GET] 메인 > 경쟁자 키워드 조회.
 */
exports.getMainCompetitior = async (req, res, next) => {
  try {
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
    const result = [
      { id: '1', value: 'group1', text: 'Group1' },
      { id: '2', value: 'group2', text: 'Group2' },
      { id: '3', value: 'group3', text: 'Group3' },
      { id: '4', value: 'group4', text: 'Group4' },
    ];
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
    const result = [
      { id: '1', value: 'group1', text: 'Group1' },
      { id: '2', value: 'group2', text: 'Group2' },
      { id: '3', value: 'group3', text: 'Group3' },
      { id: '4', value: 'group4', text: 'Group4' },
    ];
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
    const result = [
      { id: '1', value: 'group1', text: 'Group1' },
      { id: '2', value: 'group2', text: 'Group2' },
      { id: '3', value: 'group3', text: 'Group3' },
      { id: '4', value: 'group4', text: 'Group4' },
    ];
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 키워드 그룹 조회
 */
exports.getKeywordGroups = async (req, res, next) => {
  try {
    const result = [
      { id: '1', value: 'group1', text: 'Group1' },
      { id: '2', value: 'group2', text: 'Group2' },
      { id: '3', value: 'group3', text: 'Group3' },
      { id: '4', value: 'group4', text: 'Group4' },
    ];
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 키워드 조회
 */
exports.getCustomKeywords = async (req, res, next) => {
  try {
    const result = customKeywords;
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
