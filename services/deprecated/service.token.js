const uuid4 = require('uuid4');
const { accountInfoPool, memberInfoPool } = require('../utils/dbConnection');
const { objectToCamelCase } = require('../utils/util');

/**
 * 닉네임 체크
 * @param {*} nickname
 * @returns bool
 */
exports.nicknameCheck = async (nickname) => {
  const connection = await accountInfoPool.getConnection();
  let result = false;
  try {
    if (nickname) {
      const [rows] = await connection.query(
        `
        SELECT *
        FROM tbl_member_service
        WHERE nick_name = ?
          AND is_signup_complete = 'Y'
      `,
        [nickname]
      );
      if (rows.length > 0) {
        result = true;
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
 * 닉네임 조회 (대소문자 구분)
 * @param {*} nickname
 * @returns member_id
 */
exports.getMemberIdByNickname = async (nickname) => {
  const connection = await accountInfoPool.getConnection();
  let result = null;
  try {
    if (nickname) {
      const [rows] = await connection.query(
        `
        SELECT member_id
        FROM tbl_member_service
        WHERE BINARY(nick_name) = ?
          AND is_signup_complete = 'Y'
      `,
        [nickname]
      );
      if (rows.length > 0) {
        result = rows[0].member_id;
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
 * 닉네임으로 회원 아이디 조회.
 * @param {string} nickname
 * @returns member_id
 */
exports.getMemberInfoByNickname = async (nickname) => {
  const connection = await accountInfoPool.getConnection();
  let result = null;
  try {
    if (nickname) {
      const [rows] = await connection.query(
        `
        SELECT member_id, nick_name
        FROM tbl_member_service
        WHERE nick_name = ?
          AND is_signup_complete = 'Y'
      `,
        [nickname]
      );
      if (rows.length > 0) {
        result = rows[0];
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
 * 이벤트 명으로 이벤트 아이디 조회
 * @param {string} event_name
 * @returns event_id 이벤트 아이디
 */
exports.getEventId = async (event_name) => {
  const connection = await memberInfoPool.getConnection();
  let result = -1;
  try {
    if (event_name) {
      const [rows] = await connection.query(
        `
        SELECT event_id
        FROM tbl_member_portal_token_event
        WHERE name = ?
      `,
        [event_name]
      );
      if (rows.length > 0) {
        result = rows[0].event_id;
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
 * 회원의 토큰 현재 잔액 조회
 * @param {string} memberId
 * @returns portal_token_balance 회원의 토큰 현재 잔액.
 */
exports.getNowToken = async (memberId) => {
  const connection = await memberInfoPool.getConnection();
  let nowTokenAmount = -1;
  let exists = false;
  try {
    if (memberId) {
      const [rows] = await connection.query(
        'SELECT portal_token_balance FROM tbl_member_portal_token WHERE member_id = ? ',
        [memberId]
      );
      if (rows.length > 0) {
        exists = true;
        nowTokenAmount = rows[0].portal_token_balance;
      }
    }
    return { nowTokenAmount, exists };
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};

/**
 * 이벤트 토큰 내역 저장.
 * @param {JSON Array} eventTokenDataList
 * @param {string} admin_name
 * @param {string} admin_id
 * @returns result
 */
exports.setEventToken = async (eventTokenDataList, admin_name, admin_id) => {
  const eventInsertQuery = `INSERT INTO tbl_member_portal_token_event(name, description) VALUES(?, ?)`;
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
  try {
    await connection.beginTransaction();
    let event_id = -1;
    for (let index = 0; index < eventTokenDataList.length; index++) {
      const eventTokenData = eventTokenDataList[index];
      const {
        nickname,
        eventName: event_name,
        description: event_description,
        skpAmount: event_token_amount,
      } = eventTokenData;
      if (eventTokenData) {
        const member_id = await this.getMemberIdByNickname(nickname);
        if (event_id < 0) {
          event_id = await this.getEventId(event_name);
        }
        if (member_id) {
          const { nowTokenAmount, exists } = await this.getNowToken(member_id);
          /*******************************************************
           * 이벤트 추가.
           *******************************************************/
          if (event_id < 0) {
            const [insert_event] = await connection.query(eventInsertQuery, [event_name, event_description]);
            if (insert_event.affectedRows > 0) {
              event_id = insert_event.insertId;
            } else {
              result = false;
              break;
            }
          }
          /*******************************************************
           * 토큰 적립
           *******************************************************/
          if (exists) {
            const [update_token] = await connection.query(updateTokenQuery, [event_token_amount, member_id]);
            if (update_token.affectedRows === 0) {
              result = false;
              break;
            }
          } else {
            const [insert_token] = await connection.query(insertTokenQuery, [member_id, event_token_amount]);
            if (insert_token.affectedRows === 0) {
              result = false;
              break;
            }
          }

          /*******************************************************
           * 토큰 히스토리 추가.
           *******************************************************/
          const transaction_id = uuid4();
          const tokenFlowType = event_token_amount > 0 ? 'IN' : 'OUT';
          const tokenFlowDetailType = 'EVENTREWARD';
          const prevTokenAmount = exists ? Number(nowTokenAmount) : 0;
          const nextTokenAmount = prevTokenAmount + event_token_amount;

          const [insert_token_history] = await connection.query(insertTokenHistoryQuery, [
            member_id,
            nickname,
            tokenFlowType,
            tokenFlowDetailType,
            event_description,
            transaction_id,
            prevTokenAmount,
            nextTokenAmount,
            event_id,
            admin_id,
            'SKYPlay',
            nickname,
            event_token_amount,
          ]);
          if (insert_token_history.affectedRows === 0) {
            result = false;
            break;
          }
        } else {
          result = false;
          message = 'nickname not exists';
          break;
        }
      } else {
        result = false;
        message = 'event token data empty';
        break;
      }
    }

    if (result) {
      await connection.commit();
    } else {
      await connection.rollback();
    }

    return { result, message };
  } catch (error) {
    await connection.rollback();
    throw Error(error);
  } finally {
    connection.release();
  }
};

/**
 * 이벤트 내역 조회
 * @returns
 */
exports.getEvent = async () => {
  const connection = await memberInfoPool.getConnection();
  try {
    let search_query2 = `
    SELECT 
      event_id,
      name
    FROM tbl_member_portal_token_event
    `;
    const [rows] = await connection.query(search_query2, []);
    return rows;
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};

/**
 * 이벤트 토큰 지급 내역 히스토리
 * @param {*} query
 * @returns
 */
exports.getEventTokenHistory = async (query) => {
  const connection = await memberInfoPool.getConnection();
  const { start_date, end_date, searchCode, searchText } = query;

  let search_filter = [start_date, end_date];

  try {
    let search_query = `
    SELECT * 
    FROM (
      SELECT 
        B.name, 
        A.portal_token_flow_description, 
        A.member_nickname, 
        A.pre_portal_token_balance, 
        A.post_portal_token_balance,
        A.result_balance,
        A.register_datetime, 
        A.register_name
      FROM tbl_member_portal_token_history A 
        LEFT OUTER JOIN tbl_member_portal_token_event B
        ON A.event_id = B.event_id
      WHERE A.register_datetime >= ? AND A.register_datetime <= ? AND portal_token_flow_detail_type = 'EVENTREWARD'
    ) AA
    `;

    let _searchText = '';

    if (searchText) {
      _searchText = `'%${searchText}%'`;
      if (searchCode === 'event') {
        search_query += ` WHERE AA.name LIKE ${_searchText}`;
      } else if (searchCode === 'description') {
        search_query += ` WHERE AA.portal_token_flow_description LIKE ${_searchText}`;
      } else if (searchCode === 'nickname') {
        search_query += ` WHERE AA.member_nickname LIKE ${_searchText}`;
      } else if (searchCode === 'skp') {
        search_query += ` WHERE AA.value = ?`;
        search_filter.push(searchText);
      }
    }
    const [rows] = await connection.query(search_query, search_filter);

    return rows;
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};
