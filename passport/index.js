const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');
const { passportUserExists } = require('../services/service.account');

const passportConfig = { usernameField: 'admin_id', passwordField: 'password' };
const { ExtractJwt, Strategy: JWTStrategy } = require('passport-jwt');
const { cookieName } = require('../config/cookie.config');

const passportVerify = async (adminId, password, done) => {
  try {
    // 유저 아이디로 일치하는 유저 데이터 검색
    const admin = await passportUserExists(adminId);
    // 검색된 유저 데이터가 없다면 에러 표시
    if (!admin) {
      done(null, false, { reason: '존재하지 않는 사용자 입니다.' });
      return;
    }
    // 검색된 유저 데이터가 있다면 유저 해쉬된 비밀번호 비교
    const compareResult = await bcrypt.compare(password, admin.password);

    // 해쉬된 비밀번호가 같다면 유저 데이터 객체 전송
    if (compareResult) {
      done(null, admin);
      return;
    }
    // 비밀번호가 다를경우 에러 표시
    done(null, false, { reason: '아이디나 패스워드가 일치하지 않습니다.' });
  } catch (error) {
    console.error(error);
    done(error);
  }
};

const JWTConfig = {
  jwtFromRequest: ExtractJwt.fromHeader(cookieName),
  secretOrKey: process.env.JWT_KEY,
};

const JWTVerify = async (jwtPayload, done) => {
  try {
    // payload의 id값으로 유저의 데이터 조회
    const admin = await passportUserExists(jwtPayload.admin_id);
    //User.findOne({ where: { id: jwtPayload.id } });
    // 유저 데이터가 있다면 유저 데이터 객체 전송
    if (admin) {
      done(null, admin);
      return;
    }
    // 유저 데이터가 없을 경우 에러 표시
    done(null, false, { reason: '올바르지 않은 인증정보 입니다.' });
  } catch (error) {
    console.error(error);
    done(error);
  }
};

module.exports = () => {
  passport.use('local', new LocalStrategy(passportConfig, passportVerify));
  passport.use('jwt', new JWTStrategy(JWTConfig, JWTVerify));
};
