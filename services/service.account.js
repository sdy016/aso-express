const { adminPool, serviceInfoPool } = require('../utils/dbConnection');
const bcrypt = require('bcrypt');
// passport 내에서 로그인 회원 존재 검증 여부.
exports.passportUserExists = async (userId) => {
  let returnData = {
    userId: 'sdy017',
    provider: 'google',
    providerId: '123456',
    providerEmail: 'sdy017@gmail.com',
  };
  try {
    if (userId) {
      return returnData;
    } else {
      return null;
    }
  } catch (error) {
    throw Error(error);
  }
};

exports.getUserInfo = async (userId) => {
  let returnData = {
    userId: 'sdy017',
    provider: 'google',
    providerId: '123456',
    providerEmail: 'sdy017@gmail.com',
  };

  try {
    return returnData;
  } catch (error) {
    throw Error(error);
  }
};
