const { adminPool, accountInfoPool, memberInfoPool } = require('../utils/dbConnection');
const bcrypt = require('bcrypt');

/**
 * 포탈 회원 리스트 조회
 * @param {*} userInfo
 * @param {*} query
 * @returns
 */
exports.getUserList = async (userInfo, query) => {
  let returnData = [];
  const { start_date, end_date, searchText, per_page, now_page, searchCode } = query;
  const connection = await accountInfoPool.getConnection();
  let limit = (now_page - 1) * per_page;
  let count = 0;
  let userList = [];
  let selectUserQuery = `
    SELECT 
      M.member_id,
      M.member_uid,
      M.channel_type,
      MS.nick_name,
      M.channel_email,
      M.register_datetime
    FROM tbl_member M INNER JOIN tbl_member_service MS ON M.member_id = MS.member_id
    WHERE MS.is_signup_complete = 'Y' 
      AND MS.service_code = 'SVC44e128a5ac7a4c9a' 
      AND channel_type != 'AI'
  `;

  let selectUserCountQuery = `
    SELECT 
      COUNT(*) AS userCount
    FROM tbl_member M INNER JOIN tbl_member_service MS ON M.member_id = MS.member_id
    WHERE MS.is_signup_complete = 'Y' 
      AND MS.service_code = 'SVC44e128a5ac7a4c9a' 
      AND channel_type != 'AI'
  `;

  if (start_date && end_date) {
    selectUserQuery += ` AND M.register_datetime >= '${start_date}'`;
    selectUserQuery += ` AND M.register_datetime <= '${end_date}'`;
    selectUserCountQuery += ` AND M.register_datetime >= '${start_date}'`;
    selectUserCountQuery += ` AND M.register_datetime <= '${end_date}'`;
  }
  if (searchText) {
    switch (searchCode) {
      case 'ID':
        selectUserQuery += ` AND M.member_id = '${searchText}'`;
        selectUserCountQuery += ` AND M.member_id ='${searchText}'`;
        break;
      case 'USER_CODE':
        selectUserQuery += ` AND M.member_uid = '${searchText}'`;
        selectUserCountQuery += ` AND M.member_uid ='${searchText}'`;
        break;
      case 'EMAIL':
        selectUserQuery += ` AND M.channel_email LIKE '%${searchText}%'`;
        selectUserCountQuery += ` AND M.channel_email LIKE '%${searchText}%'`;
        break;
      case 'NICKNAME':
        selectUserQuery += ` AND MS.nick_name LIKE '%${searchText}%'`;
        selectUserCountQuery += ` AND MS.nick_name LIKE '%${searchText}%'`;
        break;

      default:
        break;
    }
  }
  selectUserQuery += ` ORDER BY M.register_datetime DESC LIMIT ?, ?`;

  try {
    if (userInfo) {
      const [userCountResult] = await connection.query(selectUserCountQuery, []);
      if (userCountResult.length > 0) {
        count = userCountResult[0].userCount;
      }
      const [userResult] = await connection.query(selectUserQuery, [limit, per_page]);
      userList = userResult;
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
    return { count, userList };
  }
};

/**
 * 포탈 회원 디테일 조회
 * @param {*} userInfo
 * @param {*} memberId
 * @returns
 */
exports.getUserDetail = async (userInfo, memberId) => {
  let returnData = [];
  const accountConnection = await accountInfoPool.getConnection();
  const memberConnection = await memberInfoPool.getConnection();

  let userInfoQuery = `
    SELECT 
      M.member_id,
      M.member_uid,
      M.channel_type,
      MS.nick_name,
      M.channel_email,
      M.register_datetime,
      M.member_profile_image
    FROM tbl_member M INNER JOIN tbl_member_service MS ON M.member_id = MS.member_id
    WHERE MS.is_signup_complete = 'Y' 
      AND MS.service_code = 'SVC44e128a5ac7a4c9a' 
      AND M.member_id = ?
  `;

  let walletInfoQuery = `
    SELECT 
      wallet_address
    FROM tbl_member_wallet_info
    WHERE member_id = ?
  `;

  let skpAmountQuery = `SELECT portal_token_balance FROM tbl_member_portal_token WHERE member_id = ? `;

  let skpHistoryQuery = `
    SELECT 
      portal_token_flow_type,
      portal_token_flow_detail_type,
      portal_token_flow_description,
      pre_portal_token_balance,
      post_portal_token_balance,
      portal_token_from,
      portal_token_to,
      register_datetime
    FROM tbl_member_portal_token_history 
    WHERE member_id = ? `;

  let pointInfoQuery = `
    SELECT
      TMK.service_code,
      TI.token_name,
      TMK.token_balance,
      TI.token_description
    FROM tbl_member_token TMK INNER JOIN tbl_token_info TI ON TMK.token_code = TI.token_code
    WHERE member_id = ?
  `;

  let userBaseInfo = [];
  let walletInfo = [];
  let skpAmount = [];
  let skpHistory = [];
  let pointInfo = [];

  try {
    if (userInfo && memberId) {
      if (userInfo.company_type === 'SKY') {
        const [userInfoQueryResult] = await accountConnection.query(userInfoQuery, [memberId]);
        const [walletInfoQueryResult] = await memberConnection.query(walletInfoQuery, [memberId]);
        const [skpAmountQueryResult] = await memberConnection.query(skpAmountQuery, [memberId]);
        //const [skpHistoryQueryResult] = await memberConnection.query(skpHistoryQuery, [memberId]);
        const [pointInfoQueryResult] = await memberConnection.query(pointInfoQuery, [memberId]);
        userBaseInfo = userInfoQueryResult;
        walletInfo = walletInfoQueryResult;
        skpAmount = skpAmountQueryResult;
        //skpHistory = skpHistoryQueryResult;
        pointInfo = pointInfoQueryResult;
      }
    }
  } catch (error) {
    throw Error(error);
  } finally {
    accountConnection.release();
    memberConnection.release();
    return { userBaseInfo, walletInfo, skpAmount, skpHistory, pointInfo };
  }
};

/**
 * 포탈 회원 디테일 조회 > 포인트 전체 히스토리
 * @param {*} userInfo
 * @param {*} memberId
 * @returns
 */
exports.getPointHistory = async (userInfo, memberId) => {
  let returnData = [];
  const memberConnection = await memberInfoPool.getConnection();

  let pointHistoryQuery = `
    SELECT 
      B.token_description,
      A.token_flow_description,
      A.token_flow_detail_type,
      A.token_flow_type,
      A.pre_token_balance,
      A.post_token_balance,
      A.register_datetime
    FROM tbl_member_token_history A INNER JOIN tbl_token_info B ON A.token_code = B.token_code
    WHERE A.member_id = ?
  `;

  try {
    if (userInfo && memberId) {
      if (userInfo.company_type === 'SKY') {
        const [pointHistoryResult] = await memberConnection.query(pointHistoryQuery, [memberId]);
        returnData = pointHistoryResult;
      }
    }
  } catch (error) {
    throw Error(error);
  } finally {
    memberConnection.release();
    return returnData;
  }
};

/**
 * 포탈 회원 디테일 조회 > SKP SWAP 히스토리
 * @param {*} userInfo
 * @param {*} memberId
 * @returns
 */
exports.getSkpHistory = async (userInfo, memberId) => {
  let returnData = [];
  const memberConnection = await memberInfoPool.getConnection();

  let skpHistoryQuery = `
    SELECT 
      A.portal_token_flow_type,
      A.portal_token_flow_detail_type,
      A.portal_token_flow_description,
      A.portal_token_from,
      A.portal_token_to,
      A.pre_portal_token_balance,
      A.post_portal_token_balance,
      A.result_balance,
      A.register_datetime,
      D.token_name,
      D.transaction_unique_id,
      D.post_token_balance
    FROM tbl_member_portal_token_history A
    LEFT OUTER JOIN
    (
      SELECT 
        token_name,
        transaction_unique_id,
        post_token_balance
      FROM tbl_member_token_history B 
        INNER JOIN tbl_token_info C ON B.token_code = C.token_code
      WHERE B.member_id = ?
        AND IFNULL(transaction_unique_id, '') <> ''
    ) D ON A.transaction_id = D.transaction_unique_id
    WHERE A.member_id = ?
  `;

  try {
    if (userInfo && memberId) {
      if (userInfo.company_type === 'SKY') {
        const [skpHistoryResult] = await memberConnection.query(skpHistoryQuery, [memberId, memberId]);
        returnData = skpHistoryResult;
      }
    }
  } catch (error) {
    throw Error(error);
  } finally {
    memberConnection.release();
    return returnData;
  }
};
