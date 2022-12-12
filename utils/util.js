const jwt = require('jsonwebtoken');
const { extname } = require('path');
const uuid4 = require('uuid4');
const cookieConfig = require('../config/cookie.config');
const _ = require('lodash');
module.exports = class Util {
  constructor() {}
  /**
   *
   * @param { Request } request
   */
  static getUserInfoByJWT(request) {
    // var token = request.headers[cookieConfig.cookieName];
    // request.decoded = jwt.verify(token, process.env.JWT_KEY);
    // const userInfo = request.decoded;
    const userInfo = {
      memberId: 'TEST_USER_ID',
    };
    return userInfo;
  }

  /**
   * uuid 생성
   */
  static uuid() {
    const tokens = uuid4().split('-');
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
  }

  static uuidRandom(file) {
    const uuidPath = `${uuid4()}${extname(file.originalname)}`;
    return uuidPath;
  }

  /**
   * mysql query 결과 중 property name  을 camelCase 로 바꿔주는 함수.
   * @param {*} obj
   * @returns
   */
  static objectToCamelCase(obj) {
    return _.mapKeys(obj, (v, k) => _.camelCase(k));
  }
};
