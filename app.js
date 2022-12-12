/******************************************************
  process.env.NODE_ENV Define
******************************************************/
process.env.NODE_ENV =
  process.env.NODE_ENV && process.env.NODE_ENV.trim().toLowerCase() == 'production' ? 'production' : 'development';

/******************************************************
library module
******************************************************/
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const morgan = require('morgan');
// const expressSession = require('express-session');
const flash = require('connect-flash');
const passportConfig = require('./passport');
const cors = require('cors');
const appRouter = require('./routes/route.app');
// const mainbannerRouter = require('./routes/route.banner');
// const tokenRouter = require('./routes/route.token');
// const layoutRouter = require('./routes/route.layout');
// const settingRouter = require('./routes/route.setting');
// const usersRouter = require('./routes/route.users');
// const redeemRouter = require('./routes/route.redeem');

require('dotenv').config();
const prod = process.env.NODE_ENV === 'production';

/******************************************************
 express initialize
******************************************************/
const app = express();

app.use(passport.initialize());
passportConfig();

let originsWhitelist = prod ? ['http://backoffice.skyplay.io'] : ['http://localhost:3000', 'http://localhost:8080'];

let corsOptions = {
  origin: function (origin, callback) {
    let isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
    callback(null, isWhitelisted);
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('port', process.env.PORT || 8002);

if (prod) {
  app.use(morgan('combined'));
  app.use(helmet({ crossOriginResourcePolicy: false }));
} else {
  app.use(morgan('dev'));
}

app.use('/public', express.static('public'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(flash());
app.use(passport.initialize());
app.disable('x-powered-by');
/******************************************************
 Image Upload Multer configulation
******************************************************/

/******************************************************
 Router
******************************************************/
// app.use('/auth', authRouter);
// app.use('/mainbanner', mainbannerRouter);
// app.use('/token', tokenRouter);
// app.use('/layout', layoutRouter);
// app.use('/setting', settingRouter);
// app.use('/users', usersRouter);
// app.use('/redeem', redeemRouter);
app.use('/app', appRouter);

/******************************************************
 Server error,  listen
******************************************************/

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(prod ? process.env.PORT : 8082, () => {
  console.log(`server is running on ${prod ? process.env.PORT : 8082}`);
});
