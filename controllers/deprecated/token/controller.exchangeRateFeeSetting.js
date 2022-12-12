const tokenService = require('../../services/service.token');
const tokenExchangeRateFeeSettingService = require('../../services/token/service.exchangeRateFeeSetting');
const Util = require('../../utils/util');

/**
 * [GET] withdraw / swap / exchange 모든 setting 값 조회.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.getTokenSetting = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const tokenCode = req.query.token_code;
    const withdrawResult = await tokenExchangeRateFeeSettingService.getWithdrawSetting(userInfo);
    const swapResult = await tokenExchangeRateFeeSettingService.getSwapFeeSetting(userInfo, tokenCode);
    const exchangeResult = await tokenExchangeRateFeeSettingService.getSwapExchangeSetting(userInfo, tokenCode);

    // const {} = withdrawResult;
    const { feeType, feeValue } = swapResult;
    const { rate } = exchangeResult;
    // const {} = exchangeResult;
    Object.keys(withdrawResult).forEach((key) => {
      withdrawResult[key] = Number(withdrawResult[key]);
    });

    const result = {
      ...withdrawResult,
      swapFeeType: Number(feeType),
      swapFeeValue: Number(feeValue),
      swapExchangeRate: Number(rate),
    };

    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [GET] withdraw setting 값 조회.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.getWithdrawSetting = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const result = await tokenExchangeRateFeeSettingService.getWithdrawSetting(userInfo);
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [POST] withdraw setting 값 저장 / 수정.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.setWithdrawSetting = async (req, res, next) => {
  const user_info = Util.getUserInfoByJWT(req);
  const admin_id = user_info.admin_id;

  try {
    const { result, message } = await tokenExchangeRateFeeSettingService.setWithdrawSetting(
      user_info,
      req.body,
      admin_id
    );
    if (result) {
      return res.send();
    } else {
      return res.status(500).send(message);
    }
  } catch (error) {
    return res.status(500).json('에러가 발생 하였습니다.');
  }
};

/**
 * [GET] swap 수수료 setting 값 조회.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.getSwapFeeSetting = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const tokenCode = req.query.token_code;
    const result = await tokenExchangeRateFeeSettingService.getSwapFeeSetting(userInfo, tokenCode);
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [POST] swap 수수료 setting 값 저장 / 수정.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.setSwapFeeSetting = async (req, res, next) => {
  const user_info = Util.getUserInfoByJWT(req);
  const admin_id = user_info.admin_id;

  try {
    const { result, message } = await tokenExchangeRateFeeSettingService.setSwapFeeSetting(
      user_info,
      req.body,
      admin_id
    );
    if (result) {
      return res.send();
    } else {
      return res.status(500).send(message);
    }
  } catch (error) {
    return res.status(500).json('에러가 발생 하였습니다.');
  }
};

/**
 * [GET] swap 교환비 setting 값 조회.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.getSwapExchangeSetting = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const tokenCode = req.query.token_code;
    const result = await tokenExchangeRateFeeSettingService.getSwapExchangeSetting(userInfo, tokenCode);
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [POST] swap 교환비 setting 값 저장 / 수정.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.setSwapExchangeSetting = async (req, res, next) => {
  const user_info = Util.getUserInfoByJWT(req);
  const admin_id = user_info.admin_id;

  try {
    const { result, message } = await tokenExchangeRateFeeSettingService.setSwapExchangeSetting(
      user_info,
      req.body,
      admin_id
    );
    if (result) {
      return res.send();
    } else {
      return res.status(500).send(message);
    }
  } catch (error) {
    return res.status(500).json('에러가 발생 하였습니다.');
  }
};
