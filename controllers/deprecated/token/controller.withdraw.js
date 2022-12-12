const tokenService = require('../../services/service.token');
const tokenWithdrawService = require('../../services/token/service.withdraw');
const Util = require('../../utils/util');

/**
 * [GET] 포탈토큰 출금 리스트 조회
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.getWithdrawList = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const searchDate = req.query.searchDate;
    const result = await tokenWithdrawService.getWithdrawList(userInfo, searchDate);
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
