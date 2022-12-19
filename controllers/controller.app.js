// const tokenService = require('../../services/service.token');
// const tokenExchangeRateFeeSettingService = require('../../services/token/service.exchangeRateFeeSetting');
const { CompetitorData } = require('../mock/competitor');
const { MyAppMockData } = require('../mock/myApp');
const Util = require('../utils/util');

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

    const result = MyAppMockData.find(
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

    return res.send(result);
  } catch (error) {
    console.log('error: ', error);
    return res.status(500).json(error.message);
  }
};

//[GET] 나의 경쟁 앱 리스트 조회
exports.getCompetitorApps = async (req, res, next) => {
  try {
    const result = CompetitorData.map((item) => {
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

// //[GET] 나의 앱 및 경쟁자 리스트 한꺼번에 조회
// exports.getMyAppAndCopetitorList = async (req, res, next) => {
//   try {
//     // const { memberId } = Util.getUserInfoByJWT(req);
//     // const result = await appService.getMyAppAndCopetitorList(memberId);
//     const result = [];
//     return res.send(result);
//   } catch (error) {
//     return res.status(500).json(error.message);
//   }
// };

// //[POST] 나의 앱 등록
// exports.setMyApps = async (req, res, next) => {
//   try {
//     // const { memberId } = Util.getUserInfoByJWT(req);

//     // const { result, message } = await appService.setMyApps(memberId, req.body);
//     // console.log('message: ', message);
//     // console.log('result123: ', result);
//     const result = [];
//     if (result) {
//       return res.send(result);
//     } else {
//       return res.status(500).send(message);
//     }
//   } catch (error) {
//     console.log('error: ', error);
//     return res.status(500).json(error.message);
//   }
// };

// //[POST] 나의 경쟁 앱 등록
// exports.setCompetitorApps = async (req, res, next) => {
//   try {
//     // const { memberId } = Util.getUserInfoByJWT(req);
//     const result = [];
//     return res.send(result);
//   } catch (error) {
//     return res.status(500).json(error.message);
//   }
// };

// //[DELETE] 나의 앱 & 경쟁앱 일괄 삭제
// exports.deleteMyApps = async (req, res, next) => {
//   try {
//     // const { result, message } = await appService.deleteMyApps(memberId, req.body);
//     const result = [];
//     return res.send(result);
//   } catch (error) {
//     return res.status(500).json(error.message);
//   }
// };

// //[GET] review summary (최고점 / 최저점)
// exports.getReviewBestWorst = async (req, res, next) => {
//   try {
//     const result = [];
//     return res.send(result);
//   } catch (error) {
//     return res.status(500).json(error.message);
//   }
// };

// //[GET] Featured History 조회
// exports.getFeaturedHistory = async (req, res, next) => {
//   try {
//     const result = [];
//     return res.send(result);
//   } catch (error) {
//     return res.status(500).json(error.message);
//   }
// };

// //[GET] Daily Review Count
// exports.getDailyReviewCount = async (req, res, next) => {
//   try {
//     const result = [];
//     return res.send(result);
//   } catch (error) {
//     return res.status(500).json(error.message);
//   }
// };

// //[GET] Review
// exports.getReviewList = async (req, res, next) => {
//   try {
//     const result = [];
//     return res.send(result);
//   } catch (error) {
//     return res.status(500).json(error.message);
//   }
// };
