const layoutService = require('../services/service.layout');
const settingService = require('../services/service.setting');
const Util = require('../utils/util');

exports.getLeftMenu = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const result = await layoutService.getLeftMenu(userInfo);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

exports.getCompanyBySU = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    if (userInfo.company_type !== 'SKY') {
      return res.json([]);
    }
    const result = await settingService.getCompanySimpleInfo();
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
