const uuid4 = require('uuid4');
const { accountInfoPool, memberInfoPool } = require('../../utils/dbConnection');
const { objectToCamelCase } = require('../../utils/util');
const tokenService = require('../service.token');
const _ = require('lodash');

/**
 * [GET] swap 예약 리스트 조회
 * @param {*} userInfo
 * @returns
 */
exports.getSwapReserveList = async (userInfo, searchDate, tokenCode) => {
  const connection = await memberInfoPool.getConnection();

  try {
    let search_query = `
      SELECT *
      FROM tbl_member_token_swap_reserve 
      WHERE CAST(register_utc_datetime AS DATE) = ?
        AND token_code = ?
    `;
    let result = [];

    if (userInfo?.company_type === 'SKY') {
      const [rows] = await connection.query(search_query, [searchDate, tokenCode]);
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

/**
 * [GET] 토큰 스왑 예약 실행 결과 조회
 * @param {*} userInfo
 * @returns
 */
exports.getSwapReserveExecute = async (userInfo, searchDate, tokenCode) => {
  const connection = await memberInfoPool.getConnection();

  try {
    let search_query = `
      SELECT *
      FROM tbl_member_token_swap_reserve_execute 
      WHERE reserve_date = ?
        AND token_code = ?
    `;
    let result = [];

    if (userInfo?.company_type === 'SKY') {
      const [rows] = await connection.query(search_query, [searchDate, tokenCode]);
      const camelRows = rows.map(objectToCamelCase);
      if (camelRows.length > 0) {
        result = camelRows;
      }
    }
    return result;
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};

/**
 * [PUT] swap 예약 비율 고지.
 * @param {*} userInfo
 * @param {*} body
 * @returns
 */
exports.putSwapReserveRateNotice = async (userInfo, body) => {
  const { tokenCode, swapRate, searchDate } = body;
  const insertSwapExecuteQuery = `
    INSERT INTO tbl_member_token_swap_reserve_execute 
    (
      token_code,
      reserve_date,
      request_token_balance, supply_portal_token_balance,
      swap_rate,
      total_count, success_count, cancel_count, fail_count,
      execute_status,
      register,
      updater
    )
    VALUES
    (
      ?,
      ?,
      0,0,
      ?,
      0,0,0,0,
      1,
      ?,
      ?
    )
  `;
  const updateReserveQuery = `
    UPDATE tbl_member_token_swap_reserve 
    SET execute_seq = ?,
      swap_exchange_rate = ?
    WHERE reserve_status = 0 AND execute_seq < 0 AND CAST(register_utc_datetime AS DATE) = ?
  `;
  const connection = await memberInfoPool.getConnection();
  let result = true;
  let message = '';
  try {
    await connection.beginTransaction();

    if (userInfo?.company_type !== 'SKY') {
      result = false;
      message = 'Not athorized';
    }

    if (result) {
      //1. excute insert
      const [insertSwapExecuteResult] = await connection.query(insertSwapExecuteQuery, [
        tokenCode,
        searchDate,
        swapRate,
        userInfo?.admin_id,
        userInfo?.admin_id,
      ]);
      if (insertSwapExecuteResult.affectedRows === 0) {
        result = false;
        message = 'EXECUTE_TABLE_INSERT_FAIL';
      } else {
        const seq = insertSwapExecuteResult.insertId;
        //2. update reserve
        const [updateReserveResult] = await connection.query(updateReserveQuery, [seq, swapRate, searchDate]);
        if (updateReserveResult.affectedRows === 0) {
          result = false;
          message = 'RESERVE_TABLE_UPDATE_FAIL';
        }
      }
    }
    if (result) {
      await connection.commit();
    } else {
      await connection.rollback();
    }
  } catch (error) {
    await connection.rollback();
    result = false;
    message = error?.message;
  } finally {
    connection.release();
    return { result, message };
  }
};

/**
 * [PUT] swap 예약 마감 처리.
 * @param {*} userInfo
 * @param {*} body
 * @returns
 */
exports.putSwapReserveClose = async (userInfo, body) => {
  const { seq } = body;
  const updateSwapExecuteQuery = `
    UPDATE tbl_member_token_swap_reserve_execute
      SET execute_status = 3,
        update_datetime = CURRENT_TIMESTAMP(),
        update_utc_datetime = UTC_TIMESTAMP(),
        updater = ?
    WHERE seq = ?
  `;
  const updateReserveQuery = `
    UPDATE tbl_member_token_swap_reserve 
      SET reserve_status = 2
    WHERE execute_seq = ?
  `;
  const connection = await memberInfoPool.getConnection();
  let result = true;
  let message = '';
  try {
    await connection.beginTransaction();

    if (userInfo?.company_type !== 'SKY') {
      result = false;
      message = 'Not athorized';
    }

    if (result) {
      //1. excute insert
      const [updateSwapExecuteResult] = await connection.query(updateSwapExecuteQuery, [userInfo?.admin_id, seq]);
      if (updateSwapExecuteResult.affectedRows === 0) {
        result = false;
        message = 'EXECUTE_TABLE_UPDATE_FAIL';
      } else {
        //2. update reserve
        const [updateReserveResult] = await connection.query(updateReserveQuery, [seq]);
        if (updateReserveResult.affectedRows === 0) {
          result = false;
          message = 'RESERVE_TABLE_UPDATE_FAIL';
        }
      }
    }
    if (result) {
      await connection.commit();
    } else {
      await connection.rollback();
    }
  } catch (error) {
    await connection.rollback();
    result = false;
    message = error?.message;
  } finally {
    connection.release();
    return { result, message };
  }
};

/**
 * [PUT] swap execute 예약 완료 처리.
 * @param {*} userInfo
 * @param {*} body
 * @returns
 */
exports.putSwapReserveExecuteComplete = async (userInfo, body) => {
  const { seq } = body;
  const selectStatusGroupByQuery = `
    SELECT 
      	reserve_status AS STATUS,
			  COUNT(reserve_status) AS COUNT
		FROM tbl_member_token_swap_reserve
		WHERE execute_seq = ?
		GROUP BY reserve_status;
  `;

  const selectSumQuery = `
    SELECT 
			SUM(request_token_balance) AS totalServiceToken,
			SUM(response_token_balance) AS totalPaymentSKP,
			SUM(response_token_fee) AS totalFee
		FROM tbl_member_token_swap_reserve
		WHERE execute_seq = ?
			AND reserve_status = 3
  `;

  const updateSwapExecuteQuery = `
    UPDATE tbl_member_token_swap_reserve_execute
      SET execute_status = 4,
        total_count = ?,
        success_count = ?,
        cancel_count = ?,
        fail_count = ?,
        request_token_balance = ?,
        supply_portal_token_balance = ?,
        updater = ?
    WHERE seq = ?
  `;

  const selectExecute = `
  SELECT *
  FROM tbl_member_token_swap_reserve_execute
  WHERE seq = ?
`;

  const connection = await memberInfoPool.getConnection();
  let result = true;
  let message = '';
  let data = [];
  try {
    if (userInfo?.company_type !== 'SKY') {
      result = false;
      message = 'Not athorized';
    }

    if (result) {
      //스왑 예약 상태  0: 신청(대기), 1: 신청 접수 2: 마감, 3: 완료, 4: 취소, 5: 실패
      let totalCount = 0;
      let successCount = 0;
      let cancelCount = 0;
      let failCount = 0;
      let totalServiceToken = 0;
      let totalPaymentSKP = 0;

      //1 SELECT GROUP BY reserve_status
      const [selectStatusGroupByResult] = await connection.query(selectStatusGroupByQuery, [seq]);
      if (selectStatusGroupByResult.length > 0) {
        totalCount = _.sumBy(selectStatusGroupByResult, 'COUNT');
        successCount = selectStatusGroupByResult.find((x) => x.STATUS === 3)?.COUNT || 0;
        cancelCount = selectStatusGroupByResult.find((x) => x.STATUS === 4)?.COUNT || 0;
        failCount = selectStatusGroupByResult.find((x) => x.STATUS === 5)?.COUNT || 0;
      }

      //2 SELECT AMOUNT SUM
      const [selectAmountSum] = await connection.query(selectSumQuery, [seq]);
      if (selectAmountSum.length > 0) {
        totalServiceToken = selectAmountSum[0].totalServiceToken;
        totalPaymentSKP = selectAmountSum[0].totalPaymentSKP;
      }

      //1. excute insert
      const [updateSwapExecuteResult] = await connection.query(updateSwapExecuteQuery, [
        totalCount,
        successCount,
        cancelCount,
        failCount,
        totalServiceToken,
        totalPaymentSKP,
        userInfo?.admin_id,
        seq,
      ]);
      if (updateSwapExecuteResult.affectedRows === 0) {
        result = false;
        message = 'EXECUTE_TABLE_UPDATE_FAIL';
      }

      //2. select return
      const [selectExecuteReturn] = await connection.query(selectExecute, [seq]);
      data = selectExecuteReturn;
    }
  } catch (error) {
    result = false;
    message = error?.message;
  } finally {
    connection.release();
    return { result, message, data };
  }
};

/**
 * [POST] swap 예약 완료에 따른 SKP 지급 처리.
 * @param {*} userInfo
 * @param {*} body
 * @returns
 */
exports.postSwapReserveTokenPayment = async (userInfo, body) => {
  const insertTokenQuery = `
  INSERT INTO tbl_member_portal_token 
  (
    member_id, 
    portal_token_balance, 
    register_date,
    update_date
  )
  VALUES
  (?, ?, curdate(), curdate())
`;
  const updateTokenQuery = `
  UPDATE tbl_member_portal_token 
  SET portal_token_balance = portal_token_balance + ?,
    update_date = curdate()
  WHERE member_id = ?
`;

  const updateSwapReserveQuery = `
    UPDATE tbl_member_token_swap_reserve
      SET reserve_status = 3,
        response_token_balance = ?,
        response_token_fee = ?,
        success_datetime = CURRENT_TIMESTAMP(),
        success_utc_datetime = UTC_TIMESTAMP()
    WHERE transaction_id = ?
  `;

  const insertTokenHistoryQuery = `
    INSERT INTO tbl_member_portal_token_history 
    (
      member_id,
      member_nickname,
      portal_token_flow_type,
      portal_token_flow_detail_type,
      portal_token_flow_description,
      transaction_id,
      pre_portal_token_balance,
      post_portal_token_balance,
      register_date,
      register_ip,
      event_id,
      register_name,
      portal_token_from,
      portal_token_to,
      result_balance
    )
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, curdate(), '' , ?, ?, ?, ?, ?)
  `;

  const connection = await memberInfoPool.getConnection();
  let result = true;
  let message = '';

  const {
    executeSeq,
    memberId,
    nickname,
    reserveStatus,
    requestTokenBalance,
    swapExchangeRate,
    swapFee,
    swapFeeType,
    tokenCode,
    transactionId,
  } = body;

  try {
    await connection.beginTransaction();
    if (userInfo?.company_type !== 'SKY') {
      result = false;
      message = 'Not athorized';
    }

    if (reserveStatus != 2) {
      result = false;
      message = 'NOT_STATUS_CLOSE';
    }

    if (result) {
      //0. swapExchangeRate 비교.
      const [executeInfo] = await connection.query(
        `
        SELECT * FROM tbl_member_token_swap_reserve_execute WHERE seq = ?`,
        [executeSeq]
      );
      if (executeInfo.length > 0) {
        if (executeInfo[0].swap_rate !== swapExchangeRate) {
          result = false;
          message = 'EXCHANGE_RATE_NOT_EQUEAL';
        }
      }

      //0. 지급 SKP 및 수수료 SKP 값 구하기.
      const totalSwapSKP = requestTokenBalance / swapExchangeRate;
      let fee = swapFee;
      //swapFeeType (1 : 정량 / 2: 퍼센트)
      if (swapFeeType === 2) {
        fee = totalSwapSKP * (swapFee / 100);
      }
      const responseSKP = totalSwapSKP - fee;

      if (responseSKP <= 0) {
        result = false;
        message = 'RESPONSE_SKP_TOKEN_IS_ZERO';
      }

      const [updateReserveStatus] = await connection.query(updateSwapReserveQuery, [responseSKP, fee, transactionId]);
      if (updateReserveStatus.affectedRows === 0) {
        result = false;
        message = 'RESERVE_UPDATE_FAIL';
      }

      if (memberId && result) {
        const { nowTokenAmount, exists } = await tokenService.getNowToken(memberId);

        /*******************************************************
         * 토큰 적립
         *******************************************************/
        if (exists) {
          const [update_token] = await connection.query(updateTokenQuery, [responseSKP, memberId]);
          if (update_token.affectedRows === 0) {
            result = false;
            message = 'SKP_TOKEN_UPDATE_FAIL';
          }
        } else {
          const [insert_token] = await connection.query(insertTokenQuery, [memberId, responseSKP]);
          if (insert_token.affectedRows === 0) {
            result = false;
            message = 'SKP_TOKEN_INSERT_FAIL';
          }
        }

        /*******************************************************
         * 토큰 히스토리 추가. (토탈 추가 건.)
         *******************************************************/
        const tokenFlowType = 'IN';
        const tokenFlowDetailType = 'SWAP';
        const tokenDescription = 'SKP SWAP';
        const prevTokenAmount = exists ? Number(nowTokenAmount) : 0;
        const nextTokenAmount = prevTokenAmount + totalSwapSKP;

        const [insertTotalAmountResult] = await connection.query(insertTokenHistoryQuery, [
          memberId,
          nickname,
          tokenFlowType,
          tokenFlowDetailType,
          tokenDescription,
          transactionId,
          prevTokenAmount,
          nextTokenAmount,
          0,
          userInfo.admin_id,
          'CGP',
          'SKP',
          totalSwapSKP,
        ]);
        if (insertTotalAmountResult.affectedRows === 0) {
          result = false;
          message = 'SKP_TOKEN_HISTORY_INSERT_FAIL';
        }

        /*******************************************************
         * 토큰 히스토리 추가. (토탈 추가 건.)
         *******************************************************/
        const feeTokenFlowType = 'OUT';
        const feeTokenFlowDetailType = 'SWAP_FEE';
        const feeTokenDescription = 'SKP SWAP FEE';
        const feePrevTokenAmount = prevTokenAmount + totalSwapSKP;
        const feeNextTokenAmount = prevTokenAmount + totalSwapSKP - fee;

        const [insertFeeAmountResult] = await connection.query(insertTokenHistoryQuery, [
          memberId,
          nickname,
          feeTokenFlowType,
          feeTokenFlowDetailType,
          feeTokenDescription,
          transactionId,
          feePrevTokenAmount,
          feeNextTokenAmount,
          0,
          userInfo.admin_id,
          'CGP',
          'SKP',
          totalSwapSKP,
        ]);
        if (insertFeeAmountResult.affectedRows === 0) {
          result = false;
          message = 'SKP_TOKEN_HISTORY_INSERT_FAIL';
        }
      } else {
        result = false;
        message = 'MEMBER_ID_NON';
      }
    }

    if (result) {
      await connection.commit();
    } else {
      await connection.rollback();
    }
    //return { result, message };
  } catch (error) {
    await connection.rollback();
    message = error?.message;
    //return { result, message : error };
    //throw Error(error);
  } finally {
    connection.release();
    return { result, message };
  }
};

/**
 * [PUT] swap 지급 실패 시 업데이트.
 * @param {*} userInfo
 * @param {*} body
 * @returns
 */
exports.postSwapReserveTokenPaymentFail = async (userInfo, body, message) => {
  const { transactionId } = body;
  const updateSwapExecuteQuery = `
    UPDATE tbl_member_token_swap_reserve
      SET execute_status = 5,
        fale_reason = ?,
        fail_datetime = CURRENT_TIMESTAMP(),
        fail_utc_datetime = UTC_TIMESTAMP()
    WHERE transaction_id = ?
  `;

  const connection = await memberInfoPool.getConnection();
  try {
    //1. excute insert
    await connection.query(updateSwapExecuteQuery, [message, transactionId]);
  } catch (error) {
  } finally {
    connection.release();
    return { result, message };
  }
};
