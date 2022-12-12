const uuid4 = require('uuid4');
const { adminPool, serviceInfoPool } = require('../utils/dbConnection');
const _ = require('lodash');

/**
 * 레프트 메뉴 조회
 * @param {*} admin_id
 * @returns
 */
exports.getLeftMenu = async (userInfo) => {
  let returnData = [];
  const connection = await adminPool.getConnection();
  const pageInfoQuery = `
    SELECT * FROM page_info WHERE is_use = 'Y' 
  `;

  /**
   * 결과 값에서 회사 타입 리턴.
   * @param {*} companyInfo
   * @returns
   */
  const getCompanyType = (companyInfo) => {
    let result = null;
    if (companyInfo.length > 0) {
      const company_type = companyInfo[0]?.company_type;

      if (company_type) {
        if (company_type === 'GAME') {
          result = ` AND is_game = 'Y'`;
        } else if (company_type === 'SERVICE') {
          result = ` AND is_service = 'Y'`;
        } else if (company_type === 'SKY') {
          result = '';
        }
      }
    }
    return result;
  };

  try {
    if (userInfo) {
      const [rows] = await connection.query(
        `
        SELECT access_page_code, is_all
        FROM admin_role UR 
          LEFT OUTER JOIN role_group RG ON UR.role_group_id = RG.group_id
          LEFT OUTER JOIN role_group_detail RGD ON RG.group_id = RGD.group_id
        WHERE UR.admin_id = ?
      `,
        [userInfo.admin_id]
      );
      if (rows.length === 1) {
        const { access_page_code, is_all } = rows[0];
        console.log('is_all: ', is_all);
        console.log('access_page_code: ', access_page_code);
        let queryString = '';
        if (is_all === 'Y') {
          queryString = pageInfoQuery;
        } else {
          queryString = `${pageInfoQuery} AND page_code IN ('${access_page_code.join("','")}')`;
        }
        const [pageInfoRows] = await connection.query(queryString, []);
        if (pageInfoRows.length > 0) {
          // const parentUniques = _.uniq(pageInfoRows.map((x) => x.parent_page_code));
          // console.log('parentUniques: ', parentUniques);
          let parentInfo = pageInfoRows.filter((x) => x.is_parent == 'Y').sort((a, b) => a - b);
          parentInfo.map((parent) => {
            const childData = pageInfoRows.filter((x) => x.is_parent == 'N' && x.parent_page_code === parent.page_code);
            if (childData.length > 0) {
              parent['sub'] = childData;
            }
            return parent;
          });
          returnData = parentInfo;
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
  }
};

/**
 * 회사 리스트 조회 (회사명, 회사아이디만)
 */
exports.getCompanyBySU = async () => {
  let returnData = [];
  const connection = await serviceInfoPool.getConnection();
  let companyQuery = `
    SELECT 
      service_provider_code AS company_id, 
      service_provider_name AS company_name 
    FROM tbl_service_provider_info 
    WHERE is_use = 'Y' 
  `;
  try {
    const [companys] = await connection.query(companyQuery, []);
    returnData = companys;
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
    return returnData;
  }
};
