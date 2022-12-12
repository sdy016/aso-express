const jwt = require('jsonwebtoken');
const cookieConfig = require('../config/cookie.config');
require('dotenv').config();

exports.isNotLoggedIn = (req, res, next) => {
  try {
    const token = req.headers[cookieConfig.cookieName] || '';

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      if (decoded) {
        return res.status(500).json({
          code: 500,
          message: '이미 로그인 상태입니다.',
        });
      } else {
        return next();
      }
    } else {
      return next();
    }
  } catch (error) {
    return next();
  }
};

exports.isLoggedIn = (req, res, next) => {
  try {
    var token = req.headers[cookieConfig.cookieName];
    req.decoded = jwt.verify(token, process.env.JWT_KEY);
    return next();
  } catch (error) {
    return res.send(401);
  }
};
