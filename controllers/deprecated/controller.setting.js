const settingService = require('../services/service.setting');
const Util = require('../utils/util');

/**
 * 회사 리스트 조회
 */
exports.getCompany = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const result = await settingService.getCompany(userInfo, req.query);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 회사 저장 / 업데이트
 */
exports.setCompany = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const companyInfo = req.body;
    const { result, message } = await settingService.setCompany(userInfo, companyInfo);
    if (result) {
      return res.json(result);
    } else {
      return res.status(500).json(message);
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 관리자 리스트 조회
 */
exports.getAdminList = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const companySimpleInfo = await settingService.getCompanySimpleInfo();
    const result = await settingService.getAdminList(userInfo, req.body, companySimpleInfo);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 소속 회사 권한 리스트 조회
 */
exports.getRoles = async (req, res, next) => {
  try {
    const company_id = req.query.company_id;
    const result = await settingService.getRoles(company_id);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 관리자 정보 업데이트
 */
exports.updateAdminInfo = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const result = await settingService.updateAdminInfo(userInfo?.admin_id, req.body);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 관리자 신규 생성
 */
exports.setCreateAdmin = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const companySimpleInfo = await settingService.getCompanySimpleInfo();
    const { company_id } = req.body;
    const nowCompany = companySimpleInfo.find((x) => (x.company_id = company_id));
    if (nowCompany) {
      const result = await settingService.setCreateAdmin(
        userInfo?.admin_id,
        req.body,
        companySimpleInfo.find((x) => (x.company_id = company_id))
      );
      return res.json(result);
    } else {
      return res.status(500).json('회사 코드를 찾을 수 없습니다.');
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 관리자 패스워드 리셋
 */
exports.setResetPassword = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const result = await settingService.setResetPassword(userInfo, req.body);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 권한 그룹 리스트 조회
 */
exports.getRoleGroup = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const company_id = req.query.company_id;
    if (userInfo?.company_type !== 'SKY' && userInfo?.company_id !== company_id) {
      return res.json([]);
    } else {
      const result = await settingService.getRoleGroup(company_id, userInfo?.company_type);
      return res.json(result);
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

// /**
//  * 권한 그룹에 속한 페이지 리스트 조회
//  */
// exports.getRoleGroupPage = async (req, res, next) => {
//   try {
//     const userInfo = Util.getUserInfoByJWT(req);
//     const company_id = req.query.company_id;
//     const group_id = req.query.group_id;
//     if (userInfo?.company_type !== 'SKY' && userInfo?.company_id !== company_id) {
//       return res.json([]);
//     } else {
//       const result = await settingService.getRoleGroupPage(company_id, group_id);
//       return res.json(result);
//     }
//   } catch (error) {
//     return res.status(500).json(error.message);
//   }
// };

/**
 * 권한 그룹 및 하위 페이지 저장.
 */
exports.setRoleGroupPage = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const { company_id, group_id, is_all, group_access_pages } = req.body;

    if (userInfo?.company_type !== 'SKY' && userInfo?.company_id !== company_id) {
      return res.json([]);
    } else {
      let result = null;
      if (group_id < 0) {
        result = await settingService.setRoleGroupPage(userInfo.admin_id, req.body);
      } else {
        result = await settingService.updateRoleGroupPage(userInfo.admin_id, req.body);
      }
      return res.json(result);
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

/**
 * 서비스 리스트 조회
 */
exports.getServices = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    const result = await settingService.getServices(userInfo);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
