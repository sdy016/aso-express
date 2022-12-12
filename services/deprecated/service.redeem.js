const uuid4 = require('uuid4');
const { adminPool, serviceInfoPool, memberInfoPool } = require('../utils/dbConnection');
const authService = require('./service.auth');
const bcrypt = require('bcrypt');
const { objectToCamelCase } = require('../utils/util');

/**
 * [GET] 리딤 코드 리스트 조회
 * @param {*} userInfo
 * @returns
 */
exports.getRedeemCodes = async (userInfo) => {
  console.log('userInfo: ', userInfo);
  const connection = await memberInfoPool.getConnection();
  let result = [];
  try {
    let search_query = `
      SELECT 
        redeem_seq,
        redeem_code,
        service_name,
        campaign_name,
        redeem_type,
        redeem_limit_value,
        campaign_start_date,
        campaign_end_date,
        (CASE WHEN UTC_TIMESTAMP() BETWEEN campaign_start_date AND campaign_end_date THEN 'ACTIVE' ELSE 'EXPIRED' END) redeem_expired_status,
        redeem_balance
      FROM tbl_member_redeem`;
    if (userInfo?.company_type !== 'SKY') {
      search_query = search_query + `WHERE provider_code = '${userInfo.company_id}'`;
    }
    console.log('search_query: ', search_query);
    const [rows] = await connection.query(search_query, []);
    console.log('rows: ', rows);
    if (rows.length > 0) {
      const camelRows = rows.map(objectToCamelCase);
      result = camelRows;
    }
  } catch (error) {
    console.log('error: ', error);
    throw Error(error);
  } finally {
    connection.release();
    return result;
  }
};

/**
 * [GET] 리딤 코드 리스트 단건 상세 조회
 * @param {*} userInfo
 * @returns
 */
exports.getRedeemCode = async (userInfo, redeemSeq) => {
  console.log('redeemSeq: ', redeemSeq);
  const connection = await memberInfoPool.getConnection();
  let result = null;
  try {
    let search_query = `
      SELECT 
        redeem_seq,
        redeem_code,
        service_name,
        campaign_name,
        redeem_type,
        redeem_limit_value,
        campaign_start_date,
        campaign_end_date,
        redeem_balance
      FROM tbl_member_redeem
      WHERE redeem_seq = ?
      `;

    let search_item_query = `
      SELECT 
        TMRIR.redeem_seq,
        TMRI.item_code,
        TMRI.item_name
      FROM tbl_member_redeem_item_relation TMRIR
        INNER JOIN tbl_member_redeem_item TMRI
          ON TMRIR.item_seq = TMRI.item_seq
      WHERE TMRIR.redeem_seq = ?
    `;
    if (userInfo?.company_type !== 'SKY') {
      search_query = search_query + `WHERE provider_code = '${userInfo.company_id}'`;
      search_item_query = search_item_query + `AND TMRIR.provider_code = '${userInfo.company_id}'`;
    }
    const [rows] = await connection.query(search_query, [redeemSeq]);
    console.log('rows: ', rows);

    if (rows.length > 0) {
      const [itemCodeRows] = await connection.query(search_item_query, [redeemSeq]);
      const camelRows = rows.map(objectToCamelCase);
      const camelItemCodeRows = itemCodeRows.map(objectToCamelCase);
      result = { ...camelRows[0], itemsInfo: camelItemCodeRows };
    }
  } catch (error) {
    console.log('error: ', error);
    throw Error(error);
  } finally {
    connection.release();
    return result;
  }
};

/**
 * [POST] 리딤 코드 생성 / 수정
 * @param {*} userInfo
 * @param {*} body
 * @returns
 */
exports.setRedeemCode = async (userInfo, body) => {
  console.log('body: ', body);
  const {
    redeemSeq,
    serviceCode,
    redeemCode,
    serviceName,
    campaignName,
    redeemType,
    redeemLimitValue,
    campaignStartDate,
    campaignEndDate,
    selectedRedeemItems,
  } = body;

  const connection = await memberInfoPool.getConnection();
  const serviceConnection = await serviceInfoPool.getConnection();

  let result = true;
  let message = '';

  if (userInfo?.company_type !== 'SKY') {
    const [selectSettingRow] = await serviceConnection.query(
      `SELECT service_code FROM tbl_service_info WHERE service_provider_code = ? AND service_code`,
      [userInfo.company_id, serviceCode]
    );
    if (selectSettingRow.length < 1) {
      return { result: false, message: '권한이 없습니다.' };
    }
  }

  if (redeemSeq < 0) {
    const [existsCode] = await connection.query(
      `
      SELECT redeem_code 
      FROM tbl_member_redeem 
      WHERE BINARY(redeem_code) = ?`,
      [redeemCode]
    );

    if (existsCode.length > 0) {
      return { result: false, message: '이미 존재하는 리딤 코드 입니다.' };
    }
  }

  try {
    await connection.beginTransaction();

    //INSERT
    if (redeemSeq < 0) {
      const [redeemInsertResult] = await connection.query(
        `
        INSERT INTO tbl_member_redeem
        (
          redeem_code, 
          service_code, provider_code, service_name,
          campaign_name,
          redeem_type, redeem_limit_value, redeem_balance,
          campaign_start_date, campaign_end_date,
          register, updater
        )
        VALUES
        (
          ?,
          ?,?,?,
          ?,
          ?,?,?,
          ?,?,
          ?,?
        )
      `,
        [
          redeemCode,
          serviceCode,
          userInfo.company_id,
          serviceName,
          campaignName,
          redeemType,
          redeemLimitValue,
          redeemLimitValue,
          campaignStartDate,
          campaignEndDate,
          userInfo.admin_id,
          userInfo.admin_id,
        ]
      );
      if (redeemInsertResult.affectedRows != 1) {
        result = false;
        message = 'REDEEM_INSERT_FAIL';
      }
      const seq = redeemInsertResult.insertId;

      //ITEMS DATA INSERT
      if (selectedRedeemItems.length > 0) {
        for (let index = 0; index < selectedRedeemItems.length; index++) {
          const element = selectedRedeemItems[index];
          const [redeemInsertResult] = await connection.query(
            `
          INSERT INTO tbl_member_redeem_item_relation(redeem_seq, item_seq)
          VALUES(?, ?)
        `,
            [seq, element.itemSeq]
          );
          if (redeemInsertResult.affectedRows != 1) {
            result = false;
            message = 'REDEEM_ITEM_INSERT_FAIL';
            break;
          }
        }
      } else {
        result = false;
        message = 'REDEEM_ITEM_LENGTH_ZERO';
      }
    }
    //UPDATE
    else {
      const [redeemUpdateResult] = await connection.query(
        `
        UPDATE tbl_member_redeem
        SET redeem_type = ?, 
          redeem_limit_value = ?, 
          campaign_start_date = ?, 
          campaign_end_date = ?,
          updater = ?
        WHERE redeem_seq = ? AND BINARY(redeem_code) = ?
      `,
        [redeemType, redeemLimitValue, campaignStartDate, campaignEndDate, userInfo.admin_id, redeemSeq, redeemCode]
      );
      if (redeemUpdateResult.affectedRows != 1) {
        result = false;
        message = 'REDEEM_UPDATE_FAIL';
      }
    }

    if (result) {
      await connection.commit();
    } else {
      await connection.rollback();
    }
  } catch (error) {
    console.log('error: ', error);
    await connection.rollback();
    result = false;
    message = error?.message;
  } finally {
    connection.release();
    serviceConnection.release();
    return { result, message };
  }
};

/**
 * [GET] 리딤 코드 보상 수령 로그
 * @param {*} userInfo
 * @returns
 */
exports.getRedeemCodeHistory = async (userInfo, redeemCode) => {
  const connection = await memberInfoPool.getConnection();
  let result = [];
  try {
    let search_query = `
      SELECT *
      FROM tbl_member_redeem_history
      WHERE redeem_code = ?
      `;

    const [rows] = await connection.query(search_query, [redeemCode]);
    const camelRows = rows.map(objectToCamelCase);
    result = camelRows;
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
    return result;
  }
};

/**
 * [GET] 리딤 코드 보상 아이템 목록
 * @param {*} userInfo
 * @returns
 */
exports.getRedeemCodeItems = async (userInfo, serviceCode) => {
  const connection = await memberInfoPool.getConnection();
  let result = [];
  try {
    let search_query = `
      SELECT *
      FROM tbl_member_redeem_item
      `;
    if (serviceCode === 'ALL') {
      if (userInfo.company_type != 'SKY') {
        search_query = search_query + `WHERE provider_code = '${userInfo.company_id}'`;
      }
    } else {
      search_query = search_query + `WHERE service_code = '${serviceCode}'`;
    }

    const [rows] = await connection.query(search_query, [serviceCode]);
    const camelRows = rows.map(objectToCamelCase);
    result = camelRows;
  } catch (error) {
    console.log('error: ', error);
    throw Error(error);
  } finally {
    connection.release();
    return result;
  }
};

// /**
//  * [GET] 리딤 코드 보상 아이템 단건 상세 조회
//  * @param {*} userInfo
//  * @returns
//  */
// exports.getRedeemCodeItems = async (userInfo, itemSeq) => {
//   const connection = await memberInfoPool.getConnection();

//   try {
//     let result = null;
//     let search_query = `
//       SELECT *
//       FROM tbl_member_redeem_item
//       WHERE item_seq = ?
//       `;
//     if (userInfo.company_type != 'SKY') {
//       search_query = search_query + `AND provider_code = '${userInfo.company_id}'`;
//     }

//     const [rows] = await connection.query(search_query, [itemSeq]);
//     if (rows.length > 0) {
//       const camelRows = rows.map(objectToCamelCase);
//       result = camelRows[0];
//     }
//   } catch (error) {
//     throw Error(error);
//   } finally {
//     connection.release();
//     return result;
//   }
// };

/**
 * [POST] 리딤 코드 보상 아이템 생성
 * @param {*} userInfo
 * @returns
 */
exports.setRedeemCodeItem = async (userInfo, body) => {
  const connection = await memberInfoPool.getConnection();
  const { itemCode, serviceCode, serviceName, itemName } = body;
  let result = true;
  let message = '';
  try {
    const [redeemInsertResult] = await connection.query(
      `
      INSERT INTO tbl_member_redeem_item
      (
        item_code, 
        service_code, provider_code, service_name,
        item_name,
        register, updater
      )
      VALUES
      (
        ?,
        ?,?,?,
        ?,
        ?,?
      )
    `,
      [itemCode, serviceCode, userInfo.company_id, serviceName, itemName, userInfo.admin_id, userInfo.admin_id]
    );
    if (redeemInsertResult.affectedRows != 1) {
      result = false;
      message = 'REDEEM_ITEM_INSERT_FAIL';
    }
  } catch (error) {
    console.log('error: ', error);
    result = false;
    message = error?.message;
  } finally {
    connection.release();
    return { result, message };
  }
};

/**
 * [DELETE] 리딤 코드 보상 아이템 삭제
 * @param {*} userInfo
 * @returns
 */
exports.delRedeemCodeItem = async (userInfo, itemSeq) => {
  const connection = await memberInfoPool.getConnection();
  let result = true;
  let message = '';
  try {
    const [redeemItemDeleteResult] = await connection.query(
      `
      UPDATE tbl_member_redeem_item
        SET is_use = 'N'
      WHERE item_seq = ?
    `,
      [itemSeq]
    );
    if (redeemItemDeleteResult.affectedRows != 1) {
      result = false;
      message = 'REDEEM_ITEM_UPDATE_FAIL';
    }

    // const [redeemRelationeleteResult] = await connection.query(
    //   `
    //   DELETE
    //   FROM tbl_member_redeem_item_relation
    //   WHERE item_seq = ?
    // `,
    //   [itemSeq]
    // );
    // if (redeemRelationeleteResult.affectedRows != 1) {
    //   result = false;
    //   message = 'REDEEM_ITEM_RELATION_DELETE_FAIL';
    // }
  } catch (error) {
    console.log('error: ', error);
    result = false;
    message = error?.message;
  } finally {
    connection.release();
    return { result, message };
  }
};
