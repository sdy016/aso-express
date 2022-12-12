const uuid4 = require('uuid4');
const { accountInfoPool, memberInfoPool } = require('../../utils/dbConnection');
const { objectToCamelCase } = require('../../utils/util');

/**
 * [GET] 포탈 토큰 출금 리스트
 * @param {*} userInfo
 * @returns
 */
exports.getWithdrawList = async (userInfo, searchDate) => {
  const connection = await memberInfoPool.getConnection();

  try {
    let search_query = `
      SELECT *
      FROM tbl_member_portal_token_withdraw_reserve 
      WHERE CAST(register_utc_datetime AS DATE) = ?
    `;
    let result = [];

    if (userInfo?.company_type === 'SKY') {
      const [rows] = await connection.query(search_query, [searchDate]);
      const camelRows = rows.map(objectToCamelCase);
      result = camelRows;
    }
    return result;
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};
