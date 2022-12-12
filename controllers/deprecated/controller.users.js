const usersService = require('../services/service.users');
const Util = require('../utils/util');

/**
 * 포탈 회원 리스트 조회
 */
exports.getUserList = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const result = await usersService.getUserList(userInfo, req.body);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 포탈 회원 상세 조회
 */
exports.getUserDetail = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const memberId = req.query.memberId;
    const result = await usersService.getUserDetail(userInfo, memberId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 포탈 회원 포인트 히스토리 상세 조회
 */
exports.getPointHistory = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const memberId = req.query.memberId;
    const result = await usersService.getPointHistory(userInfo, memberId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 포탈 회원 SKP 히스토리 상세 조회
 */
exports.getSkpHistory = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const memberId = req.query.memberId;
    const result = await usersService.getSkpHistory(userInfo, memberId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
