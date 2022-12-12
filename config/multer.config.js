const multer = require("multer");
const { uuidRandom } = require('../utils/util');
const { existsSync, mkdirSync } = require('fs');

exports.multerConfig = {
  fileFilter: (req, file, callback) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      callback(null, true);
    } else {
      callback(new Error('지원하지 않는 이미지 형식입니다.'));
    }
  },
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      const uploadPath = './public';
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      callback(null, uploadPath);
    },
    filename: function (req, file, callback) {
      callback(null, uuidRandom(file));
    }
  })
}


exports.createImageURL = (file) => {
  const serverAddress = process.env.SERVER_ADDRESS;
  return `${serverAddress}/public/${file.filename}`;
}