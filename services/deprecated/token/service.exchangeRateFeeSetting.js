const uuid4 = require('uuid4');
const { accountInfoPool, memberInfoPool } = require('../../utils/dbConnection');
const { objectToCamelCase } = require('../../utils/util');

/**
 * [GET] withdraw setting 값 조회.
 * @param {*} userInfo
 * @returns
 */
exports.getWithdrawSetting = async (userInfo) => {
  const connection = await memberInfoPool.getConnection();

  try {
    let search_query = `
    SELECT * FROM tbl_member_token_withdraw_setting
    `;

    if (userInfo?.company_type === 'SKY') {
      const [rows] = await connection.query(search_query, []);
      const camelRows = rows.map(objectToCamelCase);

      if (camelRows.length > 0) {
        return camelRows[0];
      } else {
        throw Error('설정 값이 존재하지 않습니다.');
      }
    } else {
      return { result: false, message: '권한이 없습니다.' };
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};

/**
 * [POST] withdraw setting 값 저장 / 수정.
 * @param {*} userInfo
 * @param {*} settings
 * @param {*} admin_id
 * @returns
 */
exports.setWithdrawSetting = async (userInfo, settings, admin_id) => {
  const selectSettingQuery = `
  SELECT * FROM tbl_member_token_withdraw_setting
  `;

  const insertSettingQuery = `
    INSERT INTO tbl_member_token_withdraw_setting 
    (
      withdraw_fee,
      withdraw_fee_type,
      withdraw_min_value,
      withdraw_max_value,
      withdraw_max_type'
    )
    VALUES
    (?, ?, ?, ?, ?)
  `;
  const updateSettingQuery = `
    UPDATE tbl_member_token_withdraw_setting 
    SET 
      withdraw_fee = ?,
      withdraw_fee_type = ?,
      withdraw_min_value = ?,
      withdraw_max_value = ?,
      withdraw_max_type = ?
  `;
  const insertSettingHistoryQuery = `
    INSERT INTO tbl_member_token_withdraw_setting_history 
    (
      prev_withdraw_fee,
      post_withdraw_fee,
      prev_withdraw_fee_type,
      post_withdraw_fee_type,
      prev_withdraw_min_value,
      post_withdraw_min_value,
      prev_withdraw_max_value,
      post_withdraw_max_value,
      prev_withdraw_max_type,
      post_withdraw_max_type,
      register
    )
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const connection = await memberInfoPool.getConnection();
  let result = true;
  let message = '';

  if (userInfo?.company_type !== 'SKY') {
    return { result: false, message: '권한이 없습니다.' };
  }

  try {
    await connection.beginTransaction();

    const { withdrawFee, withdrawFeeType, withdrawMinValue, withdrawMaxValue, withdrawMaxType } = settings;

    let requestParams = {
      withdraw_fee: withdrawFee,
      withdraw_fee_type: withdrawFeeType,
      withdraw_min_value: withdrawMinValue,
      withdraw_max_value: withdrawMaxValue,
      withdraw_max_type: withdrawMaxType,
    };

    let historyParams = {
      prev_withdraw_fee: 0,
      post_withdraw_fee: withdrawFee,
      prev_withdraw_fee_type: 0,
      post_withdraw_fee_type: withdrawFeeType,
      prev_withdraw_min_value: 0,
      post_withdraw_min_value: withdrawMinValue,
      prev_withdraw_max_value: 0,
      post_withdraw_max_value: withdrawMaxValue,
      prev_withdraw_max_type: 0,
      post_withdraw_max_type: withdrawMaxType,
    };

    const [selectSettingRow] = await connection.query(selectSettingQuery, []);

    if (selectSettingRow.length > 0) {
      const selectSettingSingle = selectSettingRow[0];
      historyParams.prev_withdraw_fee = selectSettingSingle.withdraw_fee;
      historyParams.prev_withdraw_fee_type = selectSettingSingle.withdraw_fee_type;
      historyParams.prev_withdraw_min_value = selectSettingSingle.withdraw_min_value;
      historyParams.prev_withdraw_max_value = selectSettingSingle.withdraw_max_value;
      historyParams.prev_withdraw_max_type = selectSettingSingle.withdraw_max_type;

      const [updateSettingRow] = await connection.query(updateSettingQuery, [
        ...Object.keys(requestParams).map((x) => requestParams[x]),
      ]);
      if (updateSettingRow.affectedRows !== 1) {
        message = `설정 수정 중 오류가 발생 하였습니다.`;
        throw Error(message);
      }
    } else {
      const [insertSettingRow] = await connection.query(insertSettingQuery, [
        ...Object.keys(requestParams).map((x) => requestParams[x]),
      ]);
      if (insertSettingRow.affectedRows !== 1) {
        message = `설정 저장 중 오류가 발생 하였습니다.`;
        throw Error(message);
      }
    }

    const [insertSettingHistoryRow] = await connection.query(insertSettingHistoryQuery, [
      ...Object.keys(historyParams).map((x) => historyParams[x]),
      admin_id,
    ]);
    if (insertSettingHistoryRow.affectedRows !== 1) {
      message = `설정 히스토리 저장 중 오류가 발생 하였습니다.`;
      throw Error(message);
    }

    await connection.commit();
  } catch (error) {
    result = false;
    await connection.rollback();
    message = error?.message;
  } finally {
    connection.release();
    return { result, message };
  }
};

/**
 * [GET] swap 수수료 setting 값 조회.
 * @param {*} userInfo
 * @returns
 */
exports.getSwapFeeSetting = async (userInfo, tokenCode) => {
  const connection = await memberInfoPool.getConnection();

  try {
    let search_query = `
    SELECT * FROM tbl_member_token_fee WHERE token_code = ?
    `;

    if (userInfo?.company_type === 'SKY') {
      const [rows] = await connection.query(search_query, [tokenCode]);
      const camelRows = rows.map(objectToCamelCase);

      if (camelRows.length > 0) {
        return camelRows[0];
      } else {
        throw Error('설정 값이 존재하지 않습니다.');
      }
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};

/**
 * [POST] swap 수수료 setting 값 저장 / 수정.
 * @param {*} settings
 * @param {*} admin_id
 * @returns
 */
exports.setSwapFeeSetting = async (userInfo, settings, admin_id) => {
  const selectSettingQuery = `
  SELECT * FROM tbl_member_token_fee WHERE token_code = ?
  `;

  const insertSettingQuery = `
    INSERT INTO tbl_member_token_fee 
    (
      fee_type,
      fee_value,
      token_code
    )
    VALUES
    (?, ?, ?)
  `;
  const updateSettingQuery = `
    UPDATE tbl_member_token_fee 
    SET fee_type = ?,
        fee_value = ?
    WHERE token_code = ?
  `;
  const insertSettingHistoryQuery = `
    INSERT INTO tbl_member_token_fee_history 
    (
      token_code,
      prev_fee_type,
      post_fee_type,
      prev_fee_value,
      post_fee_value,
      register
    )
    VALUES
    (?, ?, ?, ?, ?, ?)
  `;

  const connection = await memberInfoPool.getConnection();

  let result = true;
  let message = '';

  if (userInfo?.company_type !== 'SKY') {
    return { result: false, message: '권한이 없습니다.' };
  }

  try {
    await connection.beginTransaction();

    const { swapFeeType, swapFeeValue, tokenCode } = settings;

    let requestParams = {
      fee_type: swapFeeType,
      fee_value: swapFeeValue,
      token_code: tokenCode,
    };

    let historyParams = {
      token_code: tokenCode,
      prev_fee_type: 0,
      post_fee_type: swapFeeType,
      prev_fee_value: 0,
      post_fee_value: swapFeeValue,
      register: admin_id,
    };

    const [selectSettingRow] = await connection.query(selectSettingQuery, [tokenCode]);

    if (selectSettingRow.length > 0) {
      const selectSettingSingle = selectSettingRow[0];
      historyParams.prev_fee_type = selectSettingSingle.fee_type;
      historyParams.prev_fee_value = selectSettingSingle.fee_value;

      const temp = Object.keys(requestParams).map((x) => requestParams[x]);

      const [updateSettingRow] = await connection.query(updateSettingQuery, [
        ...Object.keys(requestParams).map((x) => requestParams[x]),
      ]);
      if (updateSettingRow.affectedRows !== 1) {
        message = `설정 수정 중 오류가 발생 하였습니다.`;
        throw Error(message);
      }
    } else {
      const [insertSettingRow] = await connection.query(insertSettingQuery, [
        ...Object.keys(requestParams).map((x) => requestParams[x]),
      ]);
      if (insertSettingRow.affectedRows !== 1) {
        message = `설정 저장 중 오류가 발생 하였습니다.`;
        throw Error(message);
      }
    }

    const [insertSettingHistoryRow] = await connection.query(insertSettingHistoryQuery, [
      ...Object.keys(historyParams).map((x) => historyParams[x]),
    ]);
    if (insertSettingHistoryRow.affectedRows !== 1) {
      message = `설정 히스토리 저장 중 오류가 발생 하였습니다.`;
      throw Error(message);
    }

    await connection.commit();
  } catch (error) {
    result = false;
    await connection.rollback();
    message = error?.message;
  } finally {
    connection.release();
    return { result, message };
  }
};

/**
 * [GET] swap 교환비 setting 값 조회.
 * @param {*} userInfo
 * @returns
 */
exports.getSwapExchangeSetting = async (userInfo, tokenCode) => {
  const connection = await memberInfoPool.getConnection();

  try {
    let search_query = `
    SELECT * FROM tbl_member_token_swap_exchange_rate WHERE token_code = ?
    `;

    if (userInfo?.company_type === 'SKY') {
      const [rows] = await connection.query(search_query, [tokenCode]);
      const camelRows = rows.map(objectToCamelCase);

      if (camelRows.length > 0) {
        return camelRows[0];
      } else {
        throw Error('설정 값이 존재하지 않습니다.');
      }
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};

/**
 * [POST] swap 교환비 setting 값 저장 / 수정.
 * @param {*} settings
 * @param {*} admin_id
 * @returns
 */
exports.setSwapExchangeSetting = async (userInfo, settings, admin_id) => {
  const selectSettingQuery = `
  SELECT * FROM tbl_member_token_swap_exchange_rate WHERE token_code = ?
  `;

  const insertSettingQuery = `
    INSERT INTO tbl_member_token_swap_exchange_rate 
    (
      rate,
      token_code
    )
    VALUES
    (?, ?)
  `;
  const updateSettingQuery = `
    UPDATE tbl_member_token_swap_exchange_rate 
    SET rate = ?
    WHERE token_code = ?
  `;
  const insertSettingHistoryQuery = `
    INSERT INTO tbl_member_token_swap_exchange_rate_history 
    (
      token_code,
      prev_rate_value,
      post_rate_value,
      register
    )
    VALUES
    (?, ?, ?, ?)
  `;

  const connection = await memberInfoPool.getConnection();

  let result = true;
  let message = '';

  if (userInfo?.company_type !== 'SKY') {
    return { result: false, message: '권한이 없습니다.' };
  }

  try {
    await connection.beginTransaction();

    const { swapExchangeRate, tokenCode } = settings;

    let requestParams = {
      rate: swapExchangeRate,
      token_code: tokenCode,
    };

    let historyParams = {
      token_code: tokenCode,
      prev_rate_value: 0,
      post_rate_value: swapExchangeRate,
      register: admin_id,
    };

    const [selectSettingRow] = await connection.query(selectSettingQuery, [tokenCode]);

    if (selectSettingRow.length > 0) {
      const selectSettingSingle = selectSettingRow[0];
      historyParams.prev_rate_value = selectSettingSingle.rate;

      const [updateSettingRow] = await connection.query(updateSettingQuery, [
        ...Object.keys(requestParams).map((x) => requestParams[x]),
      ]);
      if (updateSettingRow.affectedRows !== 1) {
        message = `설정 수정 중 오류가 발생 하였습니다.`;
        throw Error(message);
      }
    } else {
      const [insertSettingRow] = await connection.query(insertSettingQuery, [
        ...Object.keys(requestParams).map((x) => requestParams[x]),
      ]);
      if (insertSettingRow.affectedRows !== 1) {
        message = `설정 저장 중 오류가 발생 하였습니다.`;
        throw Error(message);
      }
    }

    const [insertSettingHistoryRow] = await connection.query(insertSettingHistoryQuery, [
      ...Object.keys(historyParams).map((x) => historyParams[x]),
    ]);
    if (insertSettingHistoryRow.affectedRows !== 1) {
      message = `설정 히스토리 저장 중 오류가 발생 하였습니다.`;
      throw Error(message);
    }

    await connection.commit();
  } catch (error) {
    result = false;
    await connection.rollback();
    message = error?.message;
  } finally {
    connection.release();
    return { result, message };
  }
};
