require('dotenv').config();

var mysql = require('mysql2/promise');

exports.connectionPool = mysql.createPool({
  host: process.env.AIX_SERVICE_DB_HOST,
  user: process.env.AIX_SERVICE_DB_USER,
  password: process.env.AIX_SERVICE_DB_PW,
  port: process.env.AIX_SERVICE_DB_PORT,
  database: process.env.AIX_SERVICE_DB_NAME,
});

// exports.memberInfoPool = mysql.createPool({
//   host: process.env.SKY_PORTAL_MEMBER_DB_HOST,
//   user: process.env.SKY_PORTAL_MEMBER_DB_USER,
//   password: process.env.SKY_PORTAL_MEMBER_DB_PW,
//   port: process.env.SKY_PORTAL_MEMBER_DB_PORT,
//   database: process.env.SKY_PORTAL_MEMBER_DB_NAME
// });

// exports.accountInfoPool = mysql.createPool({
//   host: process.env.SKY_PORTAL_ACCOUNT_DB_HOST,
//   user: process.env.SKY_PORTAL_ACCOUNT_DB_USER,
//   password: process.env.SKY_PORTAL_ACCOUNT_DB_PW,
//   port: process.env.SKY_PORTAL_ACCOUNT_DB_PORT,
//   database: process.env.SKY_PORTAL_ACCOUNT_DB_NAME
// });

// exports.serviceInfoPool = mysql.createPool({
//   host: process.env.SKY_PORTAL_SERVICE_DB_HOST,
//   user: process.env.SKY_PORTAL_SERVICE_DB_USER,
//   password: process.env.SKY_PORTAL_SERVICE_DB_PW,
//   port: process.env.SKY_PORTAL_SERVICE_DB_PORT,
//   database: process.env.SKY_PORTAL_SERVICE_DB_NAME
// });
