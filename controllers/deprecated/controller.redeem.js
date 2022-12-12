const redeemService = require('../services/service.redeem');
const Util = require('../utils/util');

/**
 * 리딤 코드 리스트 조회
 */
exports.getRedeemCodes = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const result = await redeemService.getRedeemCodes(userInfo);
    console.log('result: ', result);
    return res.json(result);
  } catch (error) {
    console.log('error: ', error);
    return res.status(500).json(error.message);
  }
};

/**
 * 리딤 코드 리스트 단건 상세 조회
 */
exports.getRedeemCode = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const redeemSeq = req.query.redeemSeq;
    const result = await redeemService.getRedeemCode(userInfo, redeemSeq);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 리딤 코드 생성 / 수정
 */
exports.setRedeemCode = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const { result, message } = await redeemService.setRedeemCode(userInfo, req.body);
    if (result) {
      return res.send();
    } else {
      return res.status(500).send(message);
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 리딤 코드 보상 수령 로그
 */
exports.getRedeemCodeHistory = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const redeemCode = req.query.redeemCode;
    const result = await redeemService.getRedeemCodeHistory(userInfo, redeemCode);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 리딤 코드 보상 아이템 목록
 */
exports.getRedeemCodeItems = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const serviceCode = req.query.serviceCode;
    const result = await redeemService.getRedeemCodeItems(userInfo, serviceCode);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

// /**
//  * 리딤 코드 보상 아이템 단건 상세 조회
//  */
// exports.getRedeemCodeItem = async (req, res, next) => {
//   try {
//     const userInfo = Util.getUserInfoByJWT(req);
//     const itemSeq = req.query.seq;
//     const result = await redeemService.getRedeemCodeItem(userInfo, itemSeq);
//     return res.json(result);
//   } catch (error) {
//     return res.status(500).json(error.message);
//   }
// };

/**
 * 리딤 코드 보상 아이템 생성
 */
exports.setRedeemCodeItem = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    console.log('userInfo setRedeemCodeItem: ', userInfo);
    const { result, message } = await redeemService.setRedeemCodeItem(userInfo, req.body);
    if (result) {
      return res.send(result);
    } else {
      return res.status(500).send(message);
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 리딤 코드 보상 아이템 삭제
 */
exports.delRedeemCodeItem = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    console.log('userInfo: ', userInfo);
    const itemSeq = req.body.itemSeq;

    const { result, message } = await redeemService.delRedeemCodeItem(userInfo, itemSeq);
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
