const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Util = require('../utils/util');
const accountService = require('../services/service.account');

/**
 * 회원 로그인
 */
exports.login = async (req, res, next) => {
  try {
    // 아까 local로 등록한 인증과정 실행
    passport.authenticate('local', (passportError, user, info) => {
      // 인증이 실패했거나 유저 데이터가 없다면 에러 발생
      if (passportError || !user) {
        res.status(401).json({ status: 401 });
        return;
      }
      // user데이터를 통해 로그인 진행
      req.login(user, { session: false }, (loginError) => {
        if (loginError) {
          res.status(401).send({ ...loginError, message: 'error' });
          return;
        }
        // 클라이언트에게 JWT생성 후 반환
        const token = jwt.sign(
          {
            admin_id: user.admin_id,
            admin_name: user.admin_name,
            company: user.company,
            company_id: user.company_id,
            company_type: user.company_type,
          },
          process.env.JWT_KEY
        );
        res.json({ accessToken: token });
      });
    })(req, res);
  } catch (error) {
    res.status(401).json({ status: 401 });
    console.error(error);
    next(error);
  }
};

/**
 * 회원 유저 정보 리턴.
 * @returns 유저정보
 */
exports.userinfo = async (req, res, next) => {
  try {
    const userInfo = Util.getUserInfoByJWT(req);
    if (userInfo) {
      const result = await accountService.getUserInfo(userInfo.admin_id);
      if (result) {
        return res.json(result);
      } else {
        return res.status(401);
      }
    } else {
      return res.status(401);
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
