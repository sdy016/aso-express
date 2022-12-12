const uuid4 = require('uuid4');
const { connectionPool } = require('../utils/dbConnection');
const authService = require('./deprecated/service.auth');
const bcrypt = require('bcrypt');
const { objectToCamelCase } = require('../utils/util');
const axios = require('axios');

const histogram_query = `
    SELECT *
    FROM asobatch.tb_app_histogram
    WHERE appId = ?
      AND provider_type = ?
    `;

const genres_query = `
    SELECT value AS genreName
    FROM asobatch.tb_app_genre
    WHERE appId = ?
      AND provider_type = ?
      AND register_date = CURDATE()
    `;

const genreId_query = `
    SELECT value AS genreId
    FROM asobatch.tb_app_genre_id
    WHERE appId = ?
      AND provider_type = ?
      AND register_date = CURDATE()
    `;

const screenshots_query = `
    SELECT value AS screenShot
    FROM asobatch.tb_app_screenshots
    WHERE appId = ?
      AND provider_type = ?
      AND register_date = CURDATE()
    `;

const comments_query = `
    SELECT value AS comment
    FROM asobatch.tb_app_comments
    WHERE appId = ?
      AND provider_type = ?
      AND register_date = CURDATE()
      AND value IS NOT NULL
    `;

const languages_query = `
    SELECT value AS language
    FROM asobatch.tb_app_languages
    WHERE appId = ?
      AND provider_type = ?
      AND register_date = CURDATE()
    `;

//[GET] 나의 앱 리스트 조회
exports.getMyApps = async (memberId) => {
  const connection = await connectionPool.getConnection();
  let result = [];
  try {
    let search_query = `
      SELECT
          B.*,
          A.app_seq
      FROM asoservice.tb_team_app_register_info A
          INNER JOIN asobatch.tb_app B
          ON A.app_id = B.appId AND A.provider_type = B.provider_type
      WHERE A.member_id = ?
        AND B.register_date = CURDATE()
      `;

    const [rows] = await connection.query(search_query, [memberId]);
    if (rows.length > 0) {
      let camelRows = rows.map(objectToCamelCase);

      for (let index = 0; index < camelRows.length; index++) {
        const element = camelRows[index];
        const { appId, providerType } = element;
        const [histogram_result] = await connection.query(histogram_query, [appId, providerType]);
        const [screenshots_result] = await connection.query(screenshots_query, [appId, providerType]);
        const [genres_result] = await connection.query(genres_query, [appId, providerType]);
        const [genreId_result] = await connection.query(genreId_query, [appId, providerType]);
        const [comments_result] = await connection.query(comments_query, [appId, providerType]);
        const [languages_result] = await connection.query(languages_query, [appId, providerType]);
        const histogram = histogram_result.map(objectToCamelCase);
        const screenshots = screenshots_result.map(objectToCamelCase);
        const genres = genres_result.map(objectToCamelCase);
        const genreId = genreId_result.map(objectToCamelCase);
        const comments = comments_result.map(objectToCamelCase);
        const languages = languages_result.map(objectToCamelCase);

        result.push({
          ...element,
          provider_type: element.providerType,
          histogram,
          screenshots,
          genres,
          genreId,
          comments,
          languages,
        });
      }
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
    return result;
  }
};

//[GET] 앱 상세 정보 조회
exports.getAppDetailInfo = async (memberId, appSeq) => {
  const connection = await connectionPool.getConnection();
  let result = null;
  try {
    let search_query = `
      SELECT
          B.*,
          A.app_seq
      FROM asoservice.tb_team_app_register_info A
          INNER JOIN asobatch.tb_app B
          ON A.app_id = B.appId AND A.provider_type = B.provider_type
      WHERE A.member_id = ?
        AND B.app_seq = ?
        AND B.register_date = CURDATE()
      LIMIT 1
      `;

    const [rows] = await connection.query(search_query, [memberId, appSeq]);
    if (rows.length > 0) {
      let camelRows = rows.map(objectToCamelCase);

      for (let index = 0; index < camelRows.length; index++) {
        const element = camelRows[index];
        const { appId, providerType } = element;
        const [histogram_result] = await connection.query(histogram_query, [appId, providerType]);
        const [screenshots_result] = await connection.query(screenshots_query, [appId, providerType]);
        const [genres_result] = await connection.query(genres_query, [appId, providerType]);
        const [genreId_result] = await connection.query(genreId_query, [appId, providerType]);
        const [comments_result] = await connection.query(comments_query, [appId, providerType]);
        const [languages_result] = await connection.query(languages_query, [appId, providerType]);
        const histogram = histogram_result.map(objectToCamelCase);
        const screenshots = screenshots_result.map(objectToCamelCase);
        const genres = genres_result.map(objectToCamelCase);
        const genreId = genreId_result.map(objectToCamelCase);
        const comments = comments_result.map(objectToCamelCase);
        const languages = languages_result.map(objectToCamelCase);

        result = {
          ...element,
          provider_type: element.providerType,
          histogram,
          screenshots,
          genres,
          genreId,
          comments,
          languages,
        };
      }
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
    return result;
  }
};

//[GET] 나의 경쟁 앱 리스트 조회
exports.getCompetitorApps = async (memberId, appSeq) => {
  const connection = await connectionPool.getConnection();
  let result = [];
  try {
    let search_query = `
    SELECT
        B.*,
        C.app_seq
    FROM asoservice.tb_competitors_app A
        INNER JOIN asobatch.tb_app B ON A.competitors_app_id = B.appId AND A.competitors_provider_type = B.provider_type
        INNER JOIN asoservice.tb_team_app_register_info C ON C.app_seq = A.app_seq
    WHERE C.app_seq = ?
      AND B.register_date = CURDATE()`;

    const [rows] = await connection.query(search_query, [memberId, appSeq]);
    if (rows.length > 0) {
      let camelRows = rows.map(objectToCamelCase);

      for (let index = 0; index < camelRows.length; index++) {
        const element = camelRows[index];
        const { appId, providerType } = element;
        const [histogram_result] = await connection.query(histogram_query, [appId, providerType]);
        const [screenshots_result] = await connection.query(screenshots_query, [appId, providerType]);
        const [genres_result] = await connection.query(genres_query, [appId, providerType]);
        const [genreId_result] = await connection.query(genreId_query, [appId, providerType]);
        const [comments_result] = await connection.query(comments_query, [appId, providerType]);
        const [languages_result] = await connection.query(languages_query, [appId, providerType]);
        const histogram = histogram_result.map(objectToCamelCase);
        const screenshots = screenshots_result.map(objectToCamelCase);
        const genres = genres_result.map(objectToCamelCase);
        const genreId = genreId_result.map(objectToCamelCase);
        const comments = comments_result.map(objectToCamelCase);
        const languages = languages_result.map(objectToCamelCase);

        result.push({
          ...element,
          provider_type: element.providerType,
          histogram,
          screenshots,
          genres,
          genreId,
          comments,
          languages,
        });
      }
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
    return result;
  }
};

//[POST] 나의 앱 등록
exports.setMyApps = async (memberId, body) => {
  const { appInfo, competitorAppsInfo } = body;
  const { appId, providerType } = appInfo;

  const batchInsertParams = [
    { appId, providerType, lang: '', country: '' },
    ...competitorAppsInfo.map((item) => ({
      appId: item.appId,
      providerType,
      lang: '',
      country: '',
    })),
  ];

  if (!appId || !providerType) {
    return { result: false, message: '필수 파라미터가 존재 하지 않습니다.' };
  }

  const connection = await connectionPool.getConnection();

  let result = true;
  let message = '';

  try {
    await connection.beginTransaction();

    const [app_result] = await connection.query(
      `
      INSERT INTO asoservice.tb_team_app_register_info
      (
        member_id,
        app_id,
        provider_type
      )
      VALUES(?,?,?)
    `,
      [memberId, appId, providerType]
    );

    if (app_result.affectedRows != 1) {
      result = false;
      message = 'MY_APP_INSERT_FAIL';
    }

    const appSeq = app_result.insertId;

    if (competitorAppsInfo.length > 0) {
      for (let index = 0; index < competitorAppsInfo.length; index++) {
        const element = competitorAppsInfo[index];
        const [competitorAppsInfoResult] = await connection.query(`INSERT INTO tb_competitors_app VALUES(?, ?, ?)`, [
          appSeq,
          element.appId,
          element.providerType,
        ]);
        if (competitorAppsInfoResult.affectedRows != 1) {
          result = false;
          message = 'COMPETITOR_APP_INSERT_FAIL';
          break;
        }
      }
    }

    if (result) {
      axios.post('http://192.168.20.116:8087/api/myapp-batch', { CreateApp: batchInsertParams });
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

//[GET] 나의 앱 및 경쟁자 리스트 한꺼번에 조회
exports.getMyAppAndCopetitorList = async (memberId) => {
  const connection = await connectionPool.getConnection();
  let result = [];
  try {
    let search_query = `
      SELECT
          B.*,
          A.app_seq
      FROM asoservice.tb_team_app_register_info A
          INNER JOIN asobatch.tb_app B
          ON A.app_id = B.appId AND A.provider_type = B.provider_type
      WHERE A.member_id = ?
        AND B.register_date = CURDATE()
      `;

    const [rows] = await connection.query(search_query, [memberId]);
    if (rows.length > 0) {
      let camelRows = rows.map(objectToCamelCase);

      for (let index = 0; index < camelRows.length; index++) {
        const element = camelRows[index];
        // const { appId, providerType } = element;
        const [competitors_result] = await connection.query(
          `
          SELECT
            B.*,
            C.app_seq
          FROM asoservice.tb_competitors_app A
            INNER JOIN asobatch.tb_app B ON A.competitors_app_id = B.appId AND A.competitors_provider_type = B.provider_type
            INNER JOIN asoservice.tb_team_app_register_info C ON C.app_seq = A.app_seq
          WHERE C.app_seq = ?
          AND B.register_date = CURDATE()
        `,
          [element.appSeq]
        );
        result.push({
          ...element,
          competitorApps: competitors_result,
        });
      }
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
    return result;
  }
};

//[POST] 나의 경쟁 앱 등록 / 수정
exports.setCompetitorApps = async (memberId, body) => {
  const { providerType, appSeq, addCompetitorApps, deleteCompetitorApps } = body;
  if (!providerType || !appSeq) {
    return { result: false, message: '필수 파라미터가 존재 하지 않습니다.' };
  }

  const connection = await connectionPool.getConnection();

  let result = true;
  let message = '';

  try {
    //const userInfo = Util.getUserInfoByJWT(req);
    await connection.beginTransaction();

    if (addCompetitorApps.length > 0) {
      for (let index = 0; index < competitorAppsInfo.length; index++) {
        const element = competitorAppsInfo[index];
        const [competitorAppsInfoResult] = await connection.query(`INSERT INTO tb_competitors_app VALUES(?, ?, ?)`, [
          appSeq,
          element,
          providerType,
        ]);
        if (competitorAppsInfoResult.affectedRows != 1) {
          result = false;
          message = 'COMPETITOR_APP_INSERT_FAIL';
          break;
        }
      }
    }
    if (deleteCompetitorApps.length > 0 && result) {
      for (let index = 0; index < competitorAppsInfo.length; index++) {
        const element = competitorAppsInfo[index];
        const [deleteResult] = await connection.query(
          `
          DELETE 
          FROM tb_competitors_app 
          WHERE appSeq = ? 
            AND competitors_app_id = ? 
            AND competitors_provider_type = ?`,
          [appSeq, element, providerType]
        );
        if (deleteResult.affectedRows != 1) {
          result = false;
          message = 'COMPETITOR_APP_DELETE_FAIL';
          break;
        }
      }
    }

    if (result) {
      const batchInsertParams = addCompetitorApps.map((item) => ({
        appId: item,
        providerType,
      }));

      axios.post('http://192.168.20.116:8087/api/myapp-batch', batchInsertParams);

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

//[DELETE] 나의 앱 삭제
exports.deleteMyApps = async (memberId, body) => {
  const { appSeq } = body;

  if (!appSeq) {
    return { result: false, message: '필수 파라미터가 존재 하지 않습니다.' };
  }

  const connection = await connectionPool.getConnection();

  let result = true;
  let message = '';

  try {
    await connection.beginTransaction();

    const [del_result] = await connection.query(
      `
        DELETE FROM tb_team_app_register_info WHERE app_seq = ? AND member_id = ?
      `,
      [appSeq, memberId]
    );

    if (del_result.affectedRows != 1) {
      result = false;
      message = 'MY_APP_DELETE_FAIL';
    }

    const [del_compititor] = await connection.query(
      `
        DELETE FROM tb_competitors_app WHERE app_seq = ?
      `,
      [appSeq]
    );

    if (del_compititor.affectedRows != 1) {
      result = false;
      message = 'COMPETITOR_APP_DELETE_FAIL';
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

//[GET] review summary (최고점 / 최저점)
exports.getReviewBestWorst = async (appId, providerType) => {
  const connection = await connectionPool.getConnection();
  let result = [];
  try {
    const search_best_query = `
    SELECT *
    FROM asobatch.tb_reviews
    WHERE appId = ?
      AND provider_type = ?
      AND register_date = CURDATE()
    ORDER BY score DESC
    LIMIT 1  
    `;

    const search_worst_query = `
    SELECT *
    FROM asobatch.tb_reviews
    WHERE appId = ?
      AND provider_type = ?
      AND register_date = CURDATE()
    ORDER BY score ASC
    LIMIT 1  
    `;

    const [rows] = await connection.query(search_best_query, [appId, providerType]);
    const [rows2] = await connection.query(search_worst_query, [appId, providerType]);

    if (rows.length > 0 && rows2.length > 0) {
      const camelRows = rows.map(objectToCamelCase);
      const camelRows2 = rows2.map(objectToCamelCase);
      result = [...camelRows, ...camelRows2];
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
    return result;
  }
};

//[GET] Featured History 조회
exports.getFeaturedHistory = async (providerType, searchType) => {
  const connection = await connectionPool.getConnection();

  const googleFeatured = [
    { type: 'TOP_FREE', collection: 'TOP_FREE', category: searchType === 'game' ? 'GAME' : 'APPLICATION' },
    { type: 'TOP_PAID', collection: 'TOP_PAID', category: searchType === 'game' ? 'GAME' : 'APPLICATION' },
    { type: 'GROSSING', collection: 'GROSSING', category: searchType === 'game' ? 'GAME' : 'APPLICATION' },
  ];

  const appStoreFeatured = [
    { type: 'TOP_FREE', collection: 'TOP_FREE_IOS', category: searchType === 'game' ? 6014 : 6005 },
    { type: 'TOP_PAID', collection: 'NEW_PAID_IOS', category: searchType === 'game' ? 6014 : 6005 },
    { type: 'GROSSING', collection: 'TOP_GROSSING_IOS', category: searchType === 'game' ? 6014 : 6005 },
  ];

  let result = [];
  try {
    const searchFeatured = providerType === 'google' ? googleFeatured : appStoreFeatured;

    for (let index = 0; index < searchFeatured.length; index++) {
      const element = searchFeatured[index];
      const [selectResult] = await connection.query(
        `
        SELECT *
        FROM asobatch.tb_list
        WHERE collection = ?
          AND provider_type = ?
          AND category = ?
          AND ranking < 11
          AND register_date = CURDATE()
      `,
        [element.collection, providerType, element.category]
      );

      result.push({ type: element.type, data: selectResult });
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
    return result;
  }
};

//[GET] Daily Review Count
exports.getDailyReviewCount = async (appId, providerType) => {
  const connection = await connectionPool.getConnection();
  let result = [];
  try {
    let search_query = `
      SELECT * 
      FROM tb_app_histogram
      WHERE appId = ?
        AND provider_type = ?
      ORDER BY register_date ASC
      `;

    const [rows] = await connection.query(search_query, [appId, providerType]);

    if (rows.length > 0) {
      result = rows.map((item) => {
        return {
          baseDate: item.register_date,
          star1: item.No1,
          star2: item.No2,
          star3: item.No3,
          star4: item.No4,
          star5: item.No5,
        };
      });
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
    return result;
  }
};

//[GET] Review
exports.getReviewList = async (appId, providerType) => {
  const connection = await connectionPool.getConnection();
  let result = [];
  try {
    let search_query = `
      SELECT *
      FROM tb_reviews
      WHERE appId = ?
        AND provider_type = ?
      ORDER BY register_datetime DESC
      LIMIT 10
      `;

    const [rows] = await connection.query(search_query, [appId, providerType]);
    if (rows.length > 0) {
      const camelRows = rows.map(objectToCamelCase);
      result = camelRows;
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
    return result;
  }
};
