const uuid4 = require('uuid4');
const { adminPool, serviceInfoPool } = require('../utils/dbConnection');
const authService = require('./service.auth');
const bcrypt = require('bcrypt');
const { objectToCamelCase } = require('../utils/util');
/**
 * 회사 정보 조회
 * @param {*} userInfo
 * @param {*} query
 * @returns
 */
exports.getCompany = async (userInfo, query) => {
  let returnData = [];
  const { start_date, end_date, searchText } = query;
  const connection = await serviceInfoPool.getConnection();
  let companyQuery = `
    SELECT
      service_provider_code AS company_id,
      service_provider_type AS company_type,
      service_provider_name AS company_name,
      service_provider_manager_name AS manager_name,
      service_provider_manager_tel AS manager_phone_number,
      service_provider_address AS address,
      service_provider_manager_email AS manager_email,
      service_provider_description AS manager_description,
      is_use,
      register_datetime AS created_at
    FROM tbl_service_provider_info 
    WHERE is_use = 'Y'
  `;

  if (start_date && end_date) {
    companyQuery += ` AND register_datetime >= '${start_date}'`;
    companyQuery += ` AND register_datetime <= '${end_date}'`;
  }
  if (searchText) {
    companyQuery += ` AND service_provider_manager_email LIKE '%${searchText}%'`;
  }
  companyQuery += ` ORDER BY register_datetime DESC `;

  try {
    if (userInfo) {
      const { company_type } = userInfo;
      if (company_type === 'SKY') {
        const [companys] = await connection.query(companyQuery, []);
        returnData = companys;
      }
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
    return returnData;
  }
};

/**
 * 회사 정보 저장
 * @param {*} userInfo
 * @param {*} companyInfo
 * @returns
 */
exports.setCompany = async (userInfo, companyInfo) => {
  let result = true;
  let message = '';

  const updateQuery = `
    UPDATE tbl_service_provider_info
      SET service_provider_name = ?,
          service_provider_type = ?,
          service_provider_address = ?,
          is_use = ?,
          service_provider_description = ?,
          service_provider_manager_email = ?,
          service_provider_manager_name = ?,
          service_provider_manager_tel = ?,
          updater = ?
    WHERE service_provider_code = ?
  `;

  const insertQuery = `
    INSERT INTO tbl_service_provider_info
    (
      service_provider_code,
      service_provider_name,
      service_provider_type,
      service_provider_address,
      is_use,
      service_provider_description,
      service_provider_manager_email,
      service_provider_manager_name,
      service_provider_manager_tel,
      register,
      updater
    )
    VALUES
    (
      ?,?,?,?,?,?,?,?,?,?,?
    )
  `;

  const connection = await serviceInfoPool.getConnection();

  const getRandomDigitChartacter = () => {
    var text = '';
    var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 10; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  };

  try {
    if (companyInfo) {
      if (companyInfo.company_id) {
        const [update] = await connection.query(updateQuery, [
          companyInfo.company_name,
          companyInfo.company_type,
          companyInfo.address,
          companyInfo.is_use,
          companyInfo.manager_description,
          companyInfo.manager_email,
          companyInfo.manager_name,
          companyInfo.manager_phone_number,
          userInfo.admin_name,
          companyInfo.company_id,
        ]);
        if (update.affectedRows === 0) {
          result = false;
          message = '수정 작업이 실패 하였습니다.';
        }
      } else {
        const _company_id = 'PVD' + getRandomDigitChartacter();
        const [insert] = await connection.query(insertQuery, [
          _company_id,
          companyInfo.company_name,
          companyInfo.company_type,
          companyInfo.address,
          companyInfo.is_use,
          companyInfo.manager_description,
          companyInfo.manager_email,
          companyInfo.manager_name,
          companyInfo.manager_phone_number,
          userInfo.admin_name,
          userInfo.admin_name,
        ]);
        if (insert.affectedRows === 0) {
          result = false;
          message = '저장 작업이 실패 하였습니다.';
        }
      }
    } else {
      result = false;
      message = '파라미터 정보가 존재 하지 않습니다.';
    }
  } catch (error) {
    console.log('error: ', error);
    result = false;
    message = error.message;
  } finally {
    connection.release();
    return { result, message };
  }
};

/**
 * 관리자 계정 관리 > 관리자 리스트 조회.
 * @param {*} userinfo
 * @param {*} body
 * @returns
 */
exports.getCompanySimpleInfo = async () => {
  const connection = await serviceInfoPool.getConnection();

  let selectQuery = `
    SELECT
      service_provider_code AS company_id,
      service_provider_type AS company_type,
      service_provider_name AS company_name
    FROM tbl_service_provider_info
    WHERE is_use = 'Y';
    `;

  try {
    const [companyInfo] = await connection.query(selectQuery, []);
    return companyInfo;
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};

/**
 * 관리자 계정 관리 > 관리자 리스트 조회.
 * @param {*} userinfo
 * @param {*} body
 * @returns
 */
exports.getAdminList = async (userinfo, body, companySimpleInfo) => {
  let returnData = [];

  const { searchCode, searchText, start_date, end_date, company_id } = body;

  const connection = await adminPool.getConnection();

  let selectQuery = `
    SELECT
      U.admin_id, 
      (SELECT group_name FROM role_group WHERE company_id = U.company_id AND group_id = UR.role_group_id) AS group_name,
      UR.role_group_id AS group_id,
      U.company_id, 
      U.email, 
      U.phone, 
      U.is_use,
      U.admin_name,
      U.is_signup_complete,
      '' AS company_type,
      '' AS company_name
    FROM admin U 
      LEFT OUTER JOIN admin_role UR ON U.admin_id = UR.admin_id
    WHERE U.admin_id != '' `;

  try {
    if (userinfo) {
      if (company_id) {
        //슈퍼 관리자가 아니라면.
        if (userinfo?.company_type !== 'SKY') {
          //슈퍼 관리자가 아니라면. 내 회사밖에 조회가 안된다.
          if (company_id !== userinfo?.company_id) {
            return returnData;
          }
          selectQuery += ` AND U.company_id = '${company_id}'`;
        } else {
          //슈퍼관리자가 전체 조회가 아닌경우 조건 걸어준다.
          if (company_id !== 'all') {
            selectQuery += ` AND U.company_id = '${company_id}'`;
          }
        }
      } else {
        return returnData;
      }

      if (start_date && end_date) {
        selectQuery += ` AND U.created_at >= '${start_date}'`;
        selectQuery += ` AND U.created_at <= '${end_date}'`;
      }

      const [adminRows] = await connection.query(selectQuery, [userinfo?.admin_id]);
      returnData = adminRows;
      returnData = returnData.map((item) => {
        const companyInfo = companySimpleInfo.find((x) => x.company_id === item.company_id);
        let company_type = '';
        let company_name = '';

        if (companyInfo) {
          company_type = companyInfo.company_type;
          company_name = companyInfo.company_name;
        }

        return {
          ...item,
          company_type,
          company_name,
        };
      });

      if (searchText && searchCode) {
        switch (searchCode) {
          case 'company':
            returnData = returnData.filter((x) => x.company_name.includes(searchText));
            break;
          case 'id':
            returnData = returnData.filter((x) => x.admin_id.includes(searchText));
            break;
          case 'name':
            returnData = returnData.filter((x) => x.admin_name.includes(searchText));
            break;
          case 'email':
            returnData = returnData.filter((x) => x.email.includes(searchText));
            break;
          case 'phone':
            returnData = returnData.filter((x) => x.phone.includes(searchText));
            break;
          default:
            break;
        }
      }

      return returnData;
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};

/**
 * 권한 그룹 조회
 * @param {*} admin_id
 * @param {*} body
 * @returns
 */
exports.getRoles = async (company_id) => {
  let returnData = [];
  const connection = await adminPool.getConnection();

  let selectQuery = `
    SELECT group_id, group_name 
    FROM role_group 
    WHERE company_id = ?
      AND is_use = 'Y'
  `;

  try {
    if (company_id) {
      const [rows] = await connection.query(selectQuery, [company_id]);
      returnData = rows;
    }
    return returnData;
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};

/**
 * 관리자 수정 업데이트 처리.
 * @param {*} userInfo
 * @param {*} companyInfo
 * @returns
 */
exports.updateAdminInfo = async (updater_id, body) => {
  let result = true;
  let message = '';

  const { admin_name, email, phone, group_id, company_id, admin_id, is_use } = body;

  const updateQuery = `
    UPDATE admin
      SET email = ?,
          admin_name = ?,
          phone = ?,
          is_use = ?
    WHERE admin_id = ?
  `;

  const updateRoleQuery = `
    UPDATE admin_role
      SET role_group_id = ?,
          updater = ?
    WHERE admin_id = ?
  `;

  const insertRoleQuery = `
    INSERT INTO admin_role (admin_id, role_group_id, register, updater)
    VALUES (?, ?, ?, ?)
  `;

  const selectRoleQuery = `
    SELECT role_group_id FROM admin_role WHERE admin_id = ?
  `;

  const connection = await adminPool.getConnection();

  try {
    await connection.beginTransaction();
    if (admin_name && email && phone && group_id && company_id && admin_id && is_use) {
      const [updateUser] = await connection.query(updateQuery, [email, admin_name, phone, is_use, admin_id]);
      if (updateUser.affectedRows < 1) {
        result = false;
        message = '관리자 정보 업데이트에 실패 하였습니다.';
      }

      if (result) {
        const [existsRole] = await connection.query(selectRoleQuery, [admin_id]);

        if (existsRole.length > 0) {
          const [update] = await connection.query(updateRoleQuery, [group_id, updater_id, admin_id]);
          if (update.affectedRows < 1) {
            result = false;
            message = '권한 등록에 실패 하였습니다.';
          }
        } else {
          const [insert] = await connection.query(insertRoleQuery, [admin_id, group_id, updater_id, updater_id]);
          if (insert.affectedRows < 1) {
            result = false;
            message = '권한 등록에 실패 하였습니다.';
          }
        }
      }
    } else {
      result = false;
      message = '파라미터 정보가 존재 하지 않습니다.';
    }

    if (result) {
      await connection.commit();
    } else {
      await connection.rollback();
    }
  } catch (error) {
    result = false;
    message = error.message;
    await connection.rollback();
    throw Error(error);
  } finally {
    connection.release();
    return { result, message };
  }
};

/**
 * 관리자 등록 처리.
 * @param {*} userInfo
 * @param {*} companyInfo
 * @returns
 */
exports.setCreateAdmin = async (creater_id, body, companySimpleInfo) => {
  let result = true;
  let message = '';

  const { admin_name, email, phone, group_id, company_id, company, admin_id, is_use } = body;

  const insertQuery = `
    INSERT INTO admin 
    (
      admin_id, 
      password, 
      company, 
      company_id, 
      email, 
      phone, 
      admin_name, 
      is_signup_complete, 
      is_use, 
      register
    )
    VALUES 
    (
      ?,?,?,?,?,?,?,'N',?,?
    )
  `;

  const insertRoleQuery = `
    INSERT INTO admin_role (admin_id, role_group_id, register, updater)
    VALUES (?, ?, ?, ?)
  `;

  const connection = await adminPool.getConnection();

  try {
    const defaultPassword = 'password12#';
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(defaultPassword, salt);

    await connection.beginTransaction();
    if (admin_name && email && phone && group_id && company_id && admin_id && is_use) {
      const [idExist] = await connection.query(`SELECT admin_id FROM admin WHERE BINARY(admin_id) = ?`, [admin_id]);
      if (idExist.length > 0) {
        result = false;
        message = '이미 존재하는 ID 입니다.';
      } else {
        const [insertUser] = await connection.query(insertQuery, [
          admin_id,
          hashPassword,
          companySimpleInfo.company_name,
          company_id,
          email,
          phone,
          admin_name,
          is_use,
          creater_id,
        ]);
        if (insertUser.affectedRows < 1) {
          result = false;
          message = '관리자 정보 생성 실패 하였습니다.';
        }

        if (result) {
          const [insert] = await connection.query(insertRoleQuery, [admin_id, group_id, creater_id, creater_id]);
          if (insert.affectedRows < 1) {
            result = false;
            message = '권한 등록에 실패 하였습니다.';
          }
        }
      }
    } else {
      result = false;
      message = '파라미터 정보가 존재 하지 않습니다.';
    }

    if (result) {
      await connection.commit();
    } else {
      await connection.rollback();
    }
  } catch (error) {
    result = false;
    message = error.message;
    await connection.rollback();
    throw Error(error);
  } finally {
    connection.release();
    return { result, message };
  }
};

/**
 * 패스워드 재설정.
 * @param {*} userInfo
 * @returns
 */
exports.setResetPassword = async (userInfo, body) => {
  let result = true;
  let message = '';
  const { admin_id } = body;

  const updateQuery = `
    UPDATE admin
      SET password = ?,
        is_signup_complete = 'N'
    WHERE admin_id = ?
  `;

  const connection = await adminPool.getConnection();

  try {
    const defaultPassword = 'password12#';
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(defaultPassword, salt);

    if (userInfo?.admin_id) {
      const [update] = await connection.query(updateQuery, [hashPassword, admin_id]);
      if (update.affectedRows === 0) {
        result = false;
        message = '수정 작업이 실패 하였습니다.';
      }
    } else {
      result = false;
      message = '파라미터 정보가 존재 하지 않습니다.';
    }
  } catch (error) {
    result = false;
    message = error.message;
    throw Error(error);
  } finally {
    connection.release();
    return { result, message };
  }
};

/**
 * 권한 및 페이지 리스트 조회.
 * @param {*} userInfo
 * @param {*} query
 * @returns
 */
exports.getRoleGroup = async (company_id, company_type) => {
  let roleData = [];
  let pageData = [];
  const connection = await adminPool.getConnection();

  let selectQuery = `
    SELECT RG.group_id, RG.group_name, RG.is_all, RGD.access_page_code, RG.is_use
    FROM role_group RG LEFT OUTER JOIN role_group_detail RGD ON RG.group_id = RGD.group_id
    WHERE company_id = ?
      AND is_use = 'Y'
  `;

  try {
    if (company_id && company_type) {
      const [rows] = await connection.query(selectQuery, [company_id]);
      roleData = rows;

      let selectPageInfoQuery = `SELECT * FROM page_info WHERE is_use = 'Y'`;
      if (company_type === 'GAME') {
        selectPageInfoQuery += ` AND is_game = 'Y'`;
      } else if (company_type === 'SERVICE') {
        selectPageInfoQuery += ` AND is_service = 'Y'`;
      }

      const [pageinfoRows] = await connection.query(selectPageInfoQuery, []);
      pageData = pageinfoRows;
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
    return { roleData, pageData };
  }
};

/**
 * 권한 생성.
 * @param {*} userInfo
 * @param {*} companyInfo
 * @returns
 */
exports.setRoleGroupPage = async (register_id, body) => {
  let result = true;
  let message = '';
  const { company_id, is_all, access_page_code, group_name, is_use } = body;

  const insertQuery = `
    INSERT INTO role_group 
    (
      company_id,
      group_name,
      is_all, 
      register,
      updater,
      is_use
    )
    VALUES 
    (
      ?,?,?,?,?,?
    )
  `;

  const insertRoleQuery = `
    INSERT INTO role_group_detail (group_id, access_page_code)
    VALUES (?, ?)
  `;

  const connection = await adminPool.getConnection();

  try {
    await connection.beginTransaction();
    if (company_id && is_all && access_page_code && group_name && is_use) {
      const [insert] = await connection.query(insertQuery, [
        company_id,
        group_name,
        is_all,
        register_id,
        register_id,
        is_use,
      ]);
      if (insert.affectedRows !== 1) {
        result = false;
        message = '그룹 생성에 실패 하였습니다.';
      } else {
        if (is_all === 'N') {
          const [insertDetail] = await connection.query(insertRoleQuery, [
            insert.insertId,
            JSON.stringify(access_page_code),
          ]);

          if (insertDetail.affectedRows !== 1) {
            result = false;
            message = '그룹 생성에 실패 하였습니다.';
          }
        }
      }
    } else {
      result = false;
      message = '파라미터 정보가 존재 하지 않습니다.';
    }

    if (result) {
      await connection.commit();
    } else {
      await connection.rollback();
    }
  } catch (error) {
    result = false;
    message = error.message;
    await connection.rollback();
    throw Error(error);
  } finally {
    connection.release();
    return { result, message };
  }
};

/**
 * 권한 생성.
 * @param {*} userInfo
 * @param {*} companyInfo
 * @returns
 */
exports.updateRoleGroupPage = async (register_id, body) => {
  let result = true;
  let message = '';
  const { group_id, company_id, is_all, access_page_code, group_name, is_use } = body;

  const updateQuery = `
    UPDATE role_group 
    SET 
      group_name = ?,
      is_all = ?,
      is_use = ?,
      updater = ?
    WHERE group_id = ?
  `;

  const insertRoleQuery = `
    INSERT INTO role_group_detail (access_page_code, group_id)
    VALUES (?, ?)
  `;

  const updateRoleQuery = `
    UPDATE role_group_detail 
    SET access_page_code = ?
    WHERE group_id = ?
  `;

  const connection = await adminPool.getConnection();

  try {
    await connection.beginTransaction();
    if (group_id && company_id && is_all && access_page_code && group_name) {
      const [selectGroupDetail] = await connection.query(`SELECT group_id FROM role_group_detail WHERE group_id = ?`, [
        group_id,
      ]);

      const [update] = await connection.query(updateQuery, [group_name, is_all, is_use, register_id, group_id]);
      if (update.affectedRows !== 1) {
        result = false;
        message = '그룹 생성에 실패 하였습니다.';
      } else {
        if (is_all === 'N') {
          const _query = selectGroupDetail.length > 0 ? updateRoleQuery : insertRoleQuery;

          const [executeGroupDetail] = await connection.query(_query, [JSON.stringify(access_page_code), group_id]);
          if (executeGroupDetail.affectedRows !== 1) {
            result = false;
            message = '그룹 페이지 생성에 실패 하였습니다.';
          }
        } else {
          if (selectGroupDetail.length > 0) {
            const [deleteGroupDetail] = await connection.query(`DELETE FROM role_group_detail WHERE group_id = ?`, [
              group_id,
            ]);
            if (deleteGroupDetail.affectedRows !== 1) {
              result = false;
              message = '그룹 페이지 삭제에 실패 하였습니다.';
            }
          }
        }
      }
    } else {
      result = false;
      message = '파라미터 정보가 존재 하지 않습니다.';
    }

    if (result) {
      await connection.commit();
    } else {
      await connection.rollback();
    }
  } catch (error) {
    result = false;
    message = error.message;
    await connection.rollback();
    throw Error(error);
  } finally {
    connection.release();
    return { result, message };
  }
};

/**
 * 서비스 리스트 조회
 * @param {*} userInfo
 * @returns
 */
exports.getServices = async (userInfo) => {
  let services = [];
  const { company_type, company_id } = userInfo;

  const connection = await serviceInfoPool.getConnection();

  let selectQuery = `
    SELECT
      service_code,
      service_name
    FROM tbl_service_info`;

  try {
    if (company_type !== 'SKY') {
      selectQuery += ` WHERE service_provider_code = ${company_id}`;
    }
    const [rows] = await connection.query(selectQuery);
    const camelRows = rows.map(objectToCamelCase);
    services = camelRows;
    console.log('services: ', services);
  } catch (error) {
    console.log('error: ', error);
    throw Error(error);
  } finally {
    connection.release();
    return services;
  }
};
