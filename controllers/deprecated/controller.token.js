const tokenService = require('../services/service.token');
const Util = require('../utils/util');

/**
 * [GET] 닉네임 체크.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.nicknameCheck = async (req, res, next) => {
  try {
    const nickname = req.params.nickname;
    const result = await tokenService.nicknameCheck(nickname);
    return res.json({ isNicknameExists: result });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 다중 닉네임 체크. (다중 닉네임이라서 REST 형식은 POST 로 지정.)
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.nicknamesCheck = async (req, res, next) => {
  try {
    let isNicknameExists = true;
    let errorNickname = '';
    const nicknames = req.body.nicknames;
    if (nicknames.length > 0) {
      for (let index = 0; index < nicknames.length; index++) {
        const element = nicknames[index];
        const result = await tokenService.nicknameCheck(element);
        isNicknameExists = result;

        if (!result) {
          errorNickname = element;
          break;
        }
      }
    } else {
      return res.status(500).json('Nickname array length less than 0');
    }
    return res.json({ isNicknameExists, errorNickname });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [GET] 이벤트 토큰 조회
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.getEvent = async (req, res, next) => {
  try {
    const result = await tokenService.getEvent();
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [POST] 이벤트 토큰 지급
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.setEventToken = async (req, res, next) => {
  try {
    const admin_name = Util.getUserInfoByJWT(req).admin_name;
    const admin_id = Util.getUserInfoByJWT(req).admin_id;
    const insert = await tokenService.setEventToken(req.body, admin_name, admin_id);

    const { result, message } = insert;

    if (result) {
      return res.send();
    } else {
      return res.status(400).send(message);
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * [GET] 이벤트 히스토리 조회 (조회 조건때문에 REST 형식은 POST 로 지정.)
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.getEventTokenHistory = async (req, res, next) => {
  try {
    const result = await tokenService.getEventTokenHistory(req.body);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
