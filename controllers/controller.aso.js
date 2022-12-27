//[GET] Rosetta Score status 조회
exports.getRosettaScoreStatus = async (req, res, next) => {
  try {
    const result = {
      mko: 70,
      cro: 62,
      rso: 53,
      goal: 250,
    };
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
