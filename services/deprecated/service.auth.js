const { adminPool, serviceInfoPool } = require('../../utils/dbConnection');
const bcrypt = require('bcrypt');
// passport 내에서 로그인 회원 존재 검증 여부.
exports.passportUserExists = async (admin_id) => {
  let returnData = null;
  const connection = await adminPool.getConnection();
  const connection2 = await serviceInfoPool.getConnection();
  try {
    if (admin_id) {
      let userInfo = null;

      const [rows] = await connection.query(
        ` SELECT 
            U.*, 
            '' AS company_type
          FROM admin U
          WHERE U.is_use = 'Y' AND U.admin_id = ?`,
        [admin_id]
      );
      if (rows.length === 1) {
        userInfo = rows[0];
      }

      if (userInfo) {
        const [companyInfo] = await connection2.query(
          ` SELECT 
              service_provider_type AS company_type
            FROM tbl_service_provider_info 
            WHERE service_provider_code = ? `,
          [userInfo.company_id]
        );
        if (companyInfo.length === 1) {
          userInfo.company_type = companyInfo[0].company_type;
          returnData = userInfo;
        }
      }
      return returnData;
    } else {
      return null;
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
    connection2.release();
  }
};

exports.getUserInfo = async (admin_id) => {
  let returnData = null;
  const connection = await adminPool.getConnection();
  const connection2 = await serviceInfoPool.getConnection();
  try {
    let userInfo = null;

    if (admin_id) {
      const [rows] = await connection.query(
        `SELECT 
          U.admin_id, 
          (SELECT group_name FROM role_group WHERE group_id = UR.role_group_id) AS admin_role,
          U.company, 
          U.company_id, 
          U.email, 
          U.phone, 
          U.admin_name,
          U.is_signup_complete,
          '' AS company_type
        FROM admin U 
          LEFT OUTER JOIN admin_role UR ON U.admin_id = UR.admin_id

        WHERE U.admin_id = ?`,
        [admin_id]
      );
      if (rows.length > 0) {
        userInfo = rows[0];
      }

      if (userInfo) {
        const [companyInfo] = await connection2.query(
          ` SELECT 
              service_provider_type AS company_type
            FROM tbl_service_provider_info 
            WHERE service_provider_code = ? `,
          [userInfo.company_id]
        );
        if (companyInfo.length === 1) {
          userInfo.company_type = companyInfo[0].company_type;
          returnData = userInfo;
        }
      }
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
    connection2.release();
    return returnData;
  }
};

exports.setUserInfo = async (userInfo, body, companyInfo) => {
  let result = true;
  let message = '';
  let data = null;
  //const getCompanyNameQuery = `SELECT company_id, company_name FROM company_info WHERE company_id = ?`;
  let updateQuery = `
    UPDATE admin
      SET company_id = ?,
        company = ?,
        email = ?,
        phone = ?, `;

  const updateQuery2 = ` admin_name = ? WHERE admin_id = ? `;
  const connection = await adminPool.getConnection();

  try {
    if (userInfo?.admin_id && body) {
      const admin_id = userInfo.admin_id;
      const { company_id, password, passwordConfirm, email, admin_name, phone } = body;

      //const [companyInfo] = await connection.query(getCompanyNameQuery, [company_id]);
      const nowCompanyInfo = companyInfo.find((x) => x.company_id === company_id);

      if (!nowCompanyInfo) {
        result = false;
        message = '회사 정보를 찾을 수 없습니다.';
      }
      if (userInfo.company_type !== 'SKY' && company_id !== nowCompanyInfo.company_id) {
        result = false;
        message = '회사 변경 권한이 존재하지 않습니다.';
      }
      if (password && passwordConfirm) {
        if (password !== passwordConfirm) {
          result = false;
          message = '패스워드 확인에 실패 하였습니다.';
        }
      }
      if (result) {
        if (password && passwordConfirm) {
          if (password === passwordConfirm) {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            updateQuery += ` password = '${hashPassword}', `;
          }
        }
        updateQuery += updateQuery2;

        const [update] = await connection.query(updateQuery, [
          company_id,
          nowCompanyInfo.company_name,
          email,
          phone,
          admin_name,
          admin_id,
        ]);
        if (update.affectedRows === 0) {
          result = false;
          message = '수정 작업이 실패 하였습니다.';
        } else {
          data = await this.getUserInfo(admin_id);
        }
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
    return { result, message, data };
  }
};

/**
 * 패스워드 설정.
 * @param {*} userInfo
 * @returns
 */
exports.setPassword = async (userInfo, body) => {
  let result = true;
  let message = '';

  const updateQuery = `
    UPDATE admin
      SET password = ?,
        is_signup_complete = 'Y'
    WHERE admin_id = ?
  `;

  const connection = await adminPool.getConnection();

  try {
    const { password } = body;

    if (userInfo?.admin_id && password) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      const [update] = await connection.query(updateQuery, [hashPassword, userInfo.admin_id]);
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
