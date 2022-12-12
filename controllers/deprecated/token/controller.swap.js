const tokenService = require('../../services/service.token');
const tokenSwapService = require('../../services/token/service.swap');
const Util = require('../../utils/util');

/**
 * [GET] 서비스토큰 => 포탈토큰 swap 예약 리스트 조회
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.getSwapReserveList = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const searchDate = req.query.searchDate;
    const tokenCode = req.query.tokenCode;
    const result = await tokenSwapService.getSwapReserveList(userInfo, searchDate, tokenCode);
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [GET] swap 예약 리스트 실행 결과 조회
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.getSwapReserveExecute = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const searchDate = req.query.searchDate;
    const tokenCode = req.query.tokenCode;
    const result = await tokenSwapService.getSwapReserveExecute(userInfo, searchDate, tokenCode);
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [PUT] swap 예약 비율 고지.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.putSwapReserveRateNotice = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const { result, message } = await tokenSwapService.putSwapReserveRateNotice(userInfo, req.body);
    if (result) {
      return res.send(result);
    } else {
      return res.status(500).json(message);
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [PUT] swap 예약 마감 처리.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.putSwapReserveClose = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const result = await tokenSwapService.putSwapReserveClose(userInfo, req.body);
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [POST] swap 예약 완료 처리.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.putSwapReserveExecuteComplete = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const { result, message, data } = await tokenSwapService.putSwapReserveExecuteComplete(userInfo, req.body);
    if (result) {
      return res.send(data);
    } else {
      return res.status(500).json(message);
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [POST] swap 예약 완료에 따른 SKP 지급 처리.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.postSwapReserveTokenPayment = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const { result, message } = await tokenSwapService.postSwapReserveTokenPayment(userInfo, req.body);
    if (result) {
      return res.send(result);
    } else {
      await tokenSwapService.postSwapReserveTokenPaymentFail(userInfo, req.body, message);
      return res.status(500).json(message);
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
