//[GET] Rosetta Score status 조회
exports.getRosettaScoreStatus = async (req, res, next) => {
  try {
    // const result = {
    //   mko: 70,
    //   cro: 62,
    //   rso: 53,
    //   goal: 250,
    // };
    // // FRONT- app.profile.model.ts > IRosettaScore 타입으로 변경처리
    const result = [
      {
        type: 'MKO',
        data: [
          { indicator: 'TITLE', name: 'Title', score: 10 },
          { indicator: 'SUB_TITLE', name: 'Subtitle', score: 10 },
          { indicator: 'PROMOTIONAL_TEXT', name: 'Promotional Text', score: 10 },
          { indicator: 'LONG_DESCRIPTION', name: 'Long Description', score: 10 },
        ],
      },
      {
        type: 'CRO',
        data: [
          { indicator: 'SCREENSHOT', name: 'Screenshot', score: 10 },
          { indicator: 'PREVIEW_VIDEO', name: 'Preview Video', score: 10 },
          { indicator: 'A/B_TEST', name: 'A/B Test', score: 10 },
        ],
      },
      {
        type: 'RSO',
        data: [
          { indicator: 'SIZE', name: 'Size', score: 10 },
          { indicator: 'VERSIONS', name: 'Versions', score: 10 },
          { indicator: '#_OF_REVIEWS', name: '# Of Reviews', score: 10 },
          { indicator: 'RATINGS', name: 'Ratings', score: 10 },
        ],
      },
    ];
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
//[GET] Rosetta Score 일별 조회
exports.getRosettaScoreDaily = async (req, res, next) => {
  try {
    const result = [
      {
        baseDate: '2022-04-01',
        mko: 56,
        cro: 9,
        rso: 57,
      },
      {
        baseDate: '2022-04-02',
        mko: 38,
        cro: 1,
        rso: 71,
      },
      {
        baseDate: '2022-04-03',
        mko: 87,
        cro: 38,
        rso: 53,
      },
      {
        baseDate: '2022-04-04',
        mko: 10,
        cro: 64,
        rso: 39,
      },
      {
        baseDate: '2022-04-05',
        mko: 23,
        cro: 52,
        rso: 33,
      },
      {
        baseDate: '2022-04-06',
        mko: 91,
        cro: 25,
        rso: 35,
      },
      {
        baseDate: '2022-04-07',
        mko: 39,
        cro: 12,
        rso: 55,
      },
      {
        baseDate: '2022-04-08',
        mko: 30,
        cro: 26,
        rso: 57,
      },
      {
        baseDate: '2022-04-09',
        mko: 8,
        cro: 11,
        rso: 48,
      },
      {
        baseDate: '2022-04-10',
        mko: 69,
        cro: 38,
        rso: 67,
      },
      {
        baseDate: '2022-04-11',
        mko: 75,
        cro: 2,
        rso: 51,
      },
      {
        baseDate: '2022-04-12',
        mko: 17,
        cro: 12,
        rso: 46,
      },
      {
        baseDate: '2022-04-13',
        mko: 46,
        cro: 86,
        rso: 88,
      },
      {
        baseDate: '2022-04-14',
        mko: 5,
        cro: 88,
        rso: 77,
      },
    ];
    return res.send(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
