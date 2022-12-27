// const tokenService = require('../../services/service.token');
// const tokenExchangeRateFeeSettingService = require('../../services/token/service.exchangeRateFeeSetting');
const { CompetitorData } = require('../mock/competitor');
const { MyAppMockData } = require('../mock/myApp');
const { summaryWords, newWords } = require('../mock/words');
const { rankingCategoryMyAppData, rankingCategoryCompititorsData } = require('../mock/categoryRanking');
const Util = require('../utils/util');
const moment = require('moment');

//[GET] 나의 앱 리스트 조회
exports.getMyApps = async (req, res, next) => {
  try {
    const result = MyAppMockData.map((item) => {
      const { appId, provider_type, icon, title, country } = item;
      return {
        appId,
        providerType: provider_type,
        icon,
        title,
        country,
      };
    });
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//[GET] 앱 상세 정보 조회
exports.getAppDetail = async (req, res, next) => {
  try {
    // const { memberId } = Util.getUserInfoByJWT(req);
    const _appId = req.query.appId;
    const _country = req.query.country;
    const _providerType = req.query.providerType;

    const result = [...MyAppMockData, ...CompetitorData].find(
      (x) => x.appId === _appId && x.provider_type === _providerType && x.country === _country
    );

    const {
      appId,
      provider_type,
      icon,
      title,
      free,
      price,
      score,
      genres,
      description,
      url,
      histogram,
      size,
      languages,
      developerId,
      developer,
      country,
      primaryGenre,
      ranking,
      screenshots,
      summary,
    } = result;

    const _result = {
      appId,
      providerType: provider_type,
      country,
      icon,
      title,
      free,
      price,
      score,
      genres,
      description,
      url,
      size,
      languages,
      primaryGenre,
      ranking,
      summary,
      screenShots: screenshots,
      histogram,
      developerId,
      developer,
    };

    return res.send(_result);
  } catch (error) {
    console.log('error: ', error);
    return res.status(500).json(error.message);
  }
};

//[GET] 나의 경쟁 앱 리스트 조회
exports.getCompetitorApps = async (req, res, next) => {
  try {
    const _appId = req.query.appId;
    const _country = req.query.country;
    const _providerType = req.query.providerType;

    const result = CompetitorData.map((item) => {
      const { appId, provider_type, icon, title, country, registeredDate } = item;
      return {
        appId,
        providerType: provider_type,
        icon,
        title,
        country,
        registeredDate,
      };
    });
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//[GET] Rosetta Score
// exports.getRosettaScore = async (req, res, next) => {
//   try {
//     const _appId = req.query.appId;
//     const _country = req.query.country;
//     const _providerType = req.query.providerType;
//     const result = [
//       { type: 'mko', score: 70 },
//       { type: 'cro', score: 62 },
//       { type: 'rso', score: 53 },
//       { type: 'goal', score: 120 },
//     ];
//     return res.send(result);
//   } catch (error) {
//     return res.status(500).json(error.message);
//   }
// };

//[GET] Review  Best / Worst
exports.getReviewSummary = async (req, res, next) => {
  try {
    const _appId = req.query.appId;
    const _country = req.query.country;
    const _providerType = req.query.providerType;
    const result = [
      {
        userName: 'mko',
        score: 5,
        text: 'The latest ONE PIECE mobile game. Real-time team battles with REAL PLAYERS',
        date: '2022-01-01',
      },
      {
        userName: 'cro',
        score: 1,
        text: 'The latest ONE PIECE mobile game. Real-time team battles with REAL PLAYERS',
        date: '2022-01-01',
      },
    ];
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//[GET] Review Chart Data
exports.getReviewChart = async (req, res, next) => {
  try {
    const _appId = req.query.appId;
    const _country = req.query.country;
    const _providerType = req.query.providerType;
    const _startDate = req.query.startDate;
    const _endDate = req.query.endDate;
    const getDaysArray = function (start, end) {
      for (var arr = [], dt = new Date(start); dt <= new Date(end); dt.setDate(dt.getDate() + 1)) {
        arr.push(moment(dt).format('YYYY-MM-DD'));
      }
      return arr;
    };
    const getRandomValue = function (start, end) {
      return Math.floor(Math.random() * (end - start + 1) + start);
    };
    const daylist = getDaysArray(new Date(_startDate), new Date(_endDate));

    const result = daylist.map((item) => {
      return {
        baseDate: item,
        star1: getRandomValue(50, 100),
        star2: getRandomValue(50, 100),
        star3: getRandomValue(50, 100),
        star4: getRandomValue(50, 100),
        star5: getRandomValue(50, 100),
      };
    });
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//[GET] Review word cloud
exports.getReviewWords = async (req, res, next) => {
  try {
    const _appId = req.query.appId;
    const _country = req.query.country;
    const _providerType = req.query.providerType;
    const _baseDate = req.query.baseDate;
    const _type = req.query.type;

    let result = _type === 'SUMMARY' ? summaryWords : newWords;
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

exports.getCategoryRanking = async (req, res, next) => {
  try {
    const _appId = req.query.appId;
    const _country = req.query.country;
    const _providerType = req.query.providerType;
    const _startDate = req.query.startDate;
    const _endDate = req.query.endDate;
    const _type = req.query.type;

    let result = [];
    if (_type === 'MYAPP') {
      result = rankingCategoryMyAppData();
    } else {
      result = rankingCategoryCompititorsData();
    }
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
