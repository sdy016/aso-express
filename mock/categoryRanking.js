const _ = require('lodash');

// TODO: 더미데이터 만드는 함수.. 추후 삭제할 것..
const rankingCategoryMyAppData = () => {
  const baseDates = Array.from({ length: 12 }, (v, i) => i + 1).map((item) => {
    return `2022-03-${item >= 10 ? item : '0' + item}`;
  });
  const gameNames = ['onepunch'];
  const onePunchTypes = [
    'APPLICATION_TopFree',
    'APPLICATION_TopGross',
    'GAME_ACTION_TopFree',
    'GAME_ACTION_TopGross',
    'GAME_TopFree',
    'GAME_TopGross',
  ];

  const getPropertyByData = (gameName) => {
    return onePunchTypes;
  };

  let result = [];

  baseDates.forEach((baseDate) => {
    gameNames.forEach((gameName) => {
      getPropertyByData(gameName).forEach((property) => {
        result.push({
          baseDate,
          gameName,
          property,
          value: _.random(0, 100),
        });
      });
    });
  });

  return result;
};
const rankingCategoryCompititorsData = () => {
  const baseDates = Array.from({ length: 12 }, (v, i) => i + 1).map((item) => {
    return `2022-03-${item >= 10 ? item : '0' + item}`;
  });

  const gameNames = ['onepunch', 'bleach', 'kknd'];

  const onePunchTypes = [
    'APPLICATION_TopFree',
    'APPLICATION_TopGross',
    'GAME_ACTION_TopFree',
    'GAME_ACTION_TopGross',
    'GAME_TopFree',
    'GAME_TopGross',
  ];

  const bleachTypes = ['APPLICATION_TopPaid', 'GAME_ACTION_TopPaid', 'GAME_TopPaid'];

  const kknd = ['APPLICATION_TopFree', 'GAME_ACTION_TopFree', 'GAME_TopFree'];

  const getPropertyByData = (gameName) => {
    if (gameName === 'onepunch') {
      return onePunchTypes;
    } else if (gameName === 'bleach') {
      return bleachTypes;
    } else {
      return kknd;
    }
  };

  let result = [];

  baseDates.forEach((baseDate) => {
    gameNames.forEach((gameName) => {
      getPropertyByData(gameName).forEach((property) => {
        result.push({
          baseDate,
          gameName,
          property,
          value: _.random(0, 100),
        });
      });
    });
  });
  return result;
};

module.exports = { rankingCategoryMyAppData, rankingCategoryCompititorsData };
