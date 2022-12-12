const uuid4 = require('uuid4');
const { accountInfoPool, memberInfoPool } = require('../../utils/dbConnection');
const { objectToCamelCase } = require('../../utils/util');
const serviceToken = require('../service.token');

/**
 * 보유중인 락업 토큰 조회
 * @param {*} memberId
 * @param {*} expired
 * @returns
 */
exports.getCurrentLockupToken = async (memberId, expired) => {
  const connection = await memberInfoPool.getConnection();
  let result = -1;
  try {
    if (memberId) {
      const [rows] = await connection.query(
        'SELECT portal_lockup_token_balance FROM tbl_member_lockup_portal_token WHERE member_id = ? AND portal_lockup_token_supply_date = ? ',
        [memberId, expired]
      );
      if (rows.length > 0) {
        result = rows[0].portal_lockup_token_balance;
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
 * [POST] 락업 토큰 지급
 * @param {*} nicknames
 * @param {*} lockupInfo
 * @param {*} admin_name
 * @param {*} admin_id
 * @returns
 */
exports.setLockupToken = async (nicknames, lockupInfo, admin_name, admin_id) => {
  const insertTokenQuery = `
    INSERT INTO tbl_member_lockup_portal_token 
    (
      member_id,
      nickname,
      portal_lockup_token_balance,
      portal_lockup_token_supply_date,
      register_datetime,
      register_date,
      update_datetime,
      update_date
    )
    VALUES
    (?,?, ?, ?, now(), curdate(), now(), curdate())
  `;
  const updateTokenQuery = `
    UPDATE tbl_member_lockup_portal_token 
    SET portal_lockup_token_balance = portal_lockup_token_balance + ?,
      update_datetime = now(),
      update_date = curdate()
    WHERE member_id = ? AND portal_lockup_token_supply_date = ?
  `;
  const insertTokenHistoryQuery = `
    INSERT INTO tbl_member_lockup_portal_token_history 
    (
      member_id,
      transaction_id,
      member_nickname,
      portal_lockup_token_supply_date,
      portal_lockup_token_flow_type,
      portal_lockup_token_flow_detail_type,
      portal_lockup_token_flow_description,
      pre_portal_lockup_token_balance,
      post_portal_lockup_token_balance,
      register_datetime,
      register_date,
      register_ip,
      supply_type,
      portal_lockup_token_supply_id,
      portal_lockup_token_supply_name

    )
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, now(), curdate(), '' , 'ADMIN', ?, ?)
  `;

  const connection = await memberInfoPool.getConnection();
  let result = true;
  let message = '';
  try {
    await connection.beginTransaction();

    for (let index = 0; index < nicknames.length; index++) {
      const nickname = nicknames[index];
      const description = '관리자 Lock up 토큰 지급';

      if (!result) {
        break;
      }

      //const { lockupTokenAmount, expiredDate } = eventTokenData;
      if (nickname) {
        const { member_id, nick_name } = await serviceToken.getMemberInfoByNickname(nickname);
        if (member_id) {
          for (let i = 0; i < lockupInfo.length; i++) {
            const element = lockupInfo[i];
            const { lockSkp: amount, lockDate: expired } = element;
            const nowLockupTokenAmount = await this.getCurrentLockupToken(member_id, expired);
            /*******************************************************
             * Lockup 토큰 적립
             *******************************************************/
            if (Number(nowLockupTokenAmount) >= 0) {
              const [update_token] = await connection.query(updateTokenQuery, [amount, member_id, expired]);
              if (update_token.affectedRows === 0) {
                result = false;
                break;
              }
            } else {
              const [insert_token] = await connection.query(insertTokenQuery, [member_id, nickname, amount, expired]);
              if (insert_token.affectedRows === 0) {
                result = false;
                break;
              }
            }

            /*******************************************************
             * 락업 토큰 히스토리 추가.
             *******************************************************/
            const transaction_id = uuid4();
            const tokenFlowType = amount > 0 ? 'IN' : 'OUT';
            const tokenFlowDetailType = 'SUPPORTERREWARD';
            const prevTokenAmount = Number(nowLockupTokenAmount) > 0 ? Number(nowLockupTokenAmount) : 0;
            const nextTokenAmount = prevTokenAmount + amount;

            const [insert_token_history] = await connection.query(insertTokenHistoryQuery, [
              member_id,
              transaction_id,
              nick_name,
              expired,
              tokenFlowType,
              tokenFlowDetailType,
              description,
              prevTokenAmount,
              nextTokenAmount,
              admin_name,
              admin_id,
            ]);
            if (insert_token_history.affectedRows === 0) {
              message = `${nickname} 회원의 히스토리 업데이트가 실패 하였습니다.`;
              result = false;
              break;
            }
          }
        } else {
          message = `${nickname} 닉네임을 가진 회원 정보를 찾을 수 없습니다.`;
          result = false;
        }
      } else {
        message = `닉네임이 존재하지 않습니다.`;
        result = false;
        break;
      }
    }

    if (result) {
      await connection.commit();
    } else {
      await connection.rollback();
    }
    //return { result, message };
  } catch (error) {
    result = false;
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
 * [GET] 락업 토큰 조회
 * @param {*} userInfo
 * @returns
 */
exports.getLockupToken = async (userInfo) => {
  const connection = await memberInfoPool.getConnection();
  const accountConnection = await accountInfoPool.getConnection();
  let returnData = [];

  try {
    let search_query = `
    SELECT * FROM tbl_member_lockup_portal_token
    ORDER BY  nickname ASC,  portal_lockup_token_supply_date ASC
    `;

    if (userInfo?.company_type === 'SKY') {
      const [rows] = await connection.query(search_query, []);
      if (rows.length > 0) {
        const memberIds = Array.from(new Set(rows.map((item) => item.member_id)));
        const inClause = memberIds.map((id) => "'" + id + "'").join();
        let searchAccountQuery = `
        SELECT member_id, member_uid, channel_email FROM tbl_member
        WHERE member_id IN (${inClause})
        `;

        const [memberInfoResult] = await accountConnection.query(searchAccountQuery, []);

        returnData = rows.map((item) => {
          let member_uid = '';
          let channel_email = '';

          const nowUserInfo = memberInfoResult.find((x) => x.member_id === item.member_id);
          if (nowUserInfo) {
            member_uid = nowUserInfo['member_uid'];
            channel_email = nowUserInfo['channel_email'];
          }
          return {
            ...item,
            member_uid,
            channel_email,
          };
        });
      }
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
    accountConnection.release();
    return returnData;
  }
};
/**
 * [PUT] 락업 토큰 지급 수정
 * @param {*} lockupInfo
 * @param {*} admin_name
 * @param {*} admin_id
 * @returns
 */
exports.updateLockupToken = async (lockupInfo, admin_name, admin_id) => {
  const { memberId, amount, releaseDate, currentAmount, nickname } = lockupInfo;
  const updateTokenQuery = `
    UPDATE tbl_member_lockup_portal_token 
    SET portal_lockup_token_balance = ?,
      update_datetime = now(),
      update_date = curdate()
    WHERE member_id = ? AND portal_lockup_token_supply_date = ?
  `;
  const insertTokenHistoryQuery = `
    INSERT INTO tbl_member_lockup_portal_token_history 
    (
      member_id,
      transaction_id,
      member_nickname,
      portal_lockup_token_flow_type,
      portal_lockup_token_flow_detail_type,
      portal_lockup_token_flow_description,
      pre_portal_lockup_token_balance,
      post_portal_lockup_token_balance,
      register_datetime,
      register_date,
      register_ip,
      supply_type,
      portal_lockup_token_supply_id,
      portal_lockup_token_supply_name,
      portal_lockup_token_supply_date

    )
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, now(), curdate(), '' , 'ADMIN', ?, ?, ?)
  `;

  const connection = await memberInfoPool.getConnection();
  let result = true;
  try {
    const member_id = memberId;
    if (member_id) {
      const nowLockupTokenAmount = await this.getCurrentLockupToken(member_id, releaseDate);
      const changeAmount = amount - Number(nowLockupTokenAmount);
      /*******************************************************
       * Lockup 토큰 업데이트
       *******************************************************/
      const [update_token] = await connection.query(updateTokenQuery, [amount, member_id, releaseDate]);
      if (update_token.affectedRows === 0) {
        result = false;
      }

      if (result) {
        /*******************************************************
         * 락업 토큰 업데이트 히스토리 추가.
         *******************************************************/
        const transaction_id = uuid4();
        const tokenFlowType = changeAmount > 0 ? 'IN' : 'OUT';
        const tokenFlowDetailType = 'SUPPORTERREWARD';
        const prevTokenAmount = Number(nowLockupTokenAmount) > 0 ? Number(nowLockupTokenAmount) : 0;
        const nextTokenAmount = amount;
        const description = '관리자 Lock up 토큰 수정';

        const [insert_token_history] = await connection.query(insertTokenHistoryQuery, [
          member_id,
          transaction_id,
          nickname,
          tokenFlowType,
          tokenFlowDetailType,
          description,
          prevTokenAmount,
          nextTokenAmount,
          admin_name,
          admin_id,
          releaseDate,
        ]);
        if (insert_token_history.affectedRows === 0) {
          result = false;
        }
      }
    } else {
      result = false;
    }
    if (result) {
      await connection.commit();
    } else {
      await connection.rollback();
    }
    return result;
  } catch (error) {
    await connection.rollback();
    throw Error(error);
  } finally {
    connection.release();
  }
};
