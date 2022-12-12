const express = require('express');
const passport = require('passport');
var router = express.Router();

const settingController = require('../controllers/controller.setting');

//회사 관리
router.get('/company', passport.authenticate('jwt', { session: false }), settingController.getCompany);
router.post('/company', passport.authenticate('jwt', { session: false }), settingController.setCompany);

//관리자 계정 관리
router.post('/admin/list', passport.authenticate('jwt', { session: false }), settingController.getAdminList);
router.get('/admin/roles', passport.authenticate('jwt', { session: false }), settingController.getRoles);
router.post('/admin', passport.authenticate('jwt', { session: false }), settingController.updateAdminInfo);
router.post('/admin/join', passport.authenticate('jwt', { session: false }), settingController.setCreateAdmin);
router.post(
  '/admin/password/reset',
  passport.authenticate('jwt', { session: false }),
  settingController.setResetPassword
);

//권한 그룹 설정
router.get('/role/group', passport.authenticate('jwt', { session: false }), settingController.getRoleGroup);
//router.get('/role/group/page', passport.authenticate('jwt', { session: false }), settingController.getRoleGroupPage);
router.post('/role/group', passport.authenticate('jwt', { session: false }), settingController.setRoleGroupPage);
//서비스 조회
router.get('/services', passport.authenticate('jwt', { session: false }), settingController.getServices);

module.exports = router;
