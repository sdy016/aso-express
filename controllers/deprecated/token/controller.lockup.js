const tokenService = require('../../services/service.token');
const tokenLockupService = require('../../services/token/service.lockup');
const Util = require('../../utils/util');

/**
 * [GET] 락업 토큰 조회
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.getLockupToken = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    //const result = await usersService.getUserList(userInfo, req.body);
    const result = await tokenLockupService.getLockupToken(userInfo);
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [POST] 락업 토큰 지급
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.setLockupToken = async (req, res, next) => {
  const user_info = Util.getUserInfoByJWT(req);
  const admin_name = user_info.admin_name;
  const admin_id = user_info.admin_id;
  const nicknames = req.body.nicknames;
  const lockupInfo = req.body.lockupInfo;

  try {
    if (nicknames.length > 0 && lockupInfo.length > 0) {
      const { result, message } = await tokenLockupService.setLockupToken(nicknames, lockupInfo, admin_name, admin_id);
      if (result) {
        return res.send();
      } else {
        return res.status(500).send(message);
      }
    } else {
      return res.status(500).send('닉네임 및 락업토큰 정보가 누락 되었습니다.');
    }
  } catch (error) {
    return res.status(500).json('에러가 발생 하였습니다.');
  }
};

/**
 * [PUT] 락업 토큰 지급 수정
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.updateLockupToken = async (req, res, next) => {
  const user_info = Util.getUserInfoByJWT(req);
  const admin_name = user_info.admin_name;
  const admin_id = user_info.admin_id;
  const { memberId, amount, releaseDate, currentAmount } = req.body.lockupInfo;

  if (memberId && amount >= 0 && releaseDate && currentAmount >= 0) {
    const result = await tokenLockupService.updateLockupToken(req.body.lockupInfo, admin_name, admin_id);
    if (result) {
      return res.send();
    } else {
      return res.status(500).send();
    }
  } else {
    return res.status(500).send();
  }
};
