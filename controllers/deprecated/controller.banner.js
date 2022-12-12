const bannerService = require('../services/service.banner');
const Util = require('../utils/util');
const { createImageURL } = require('../config/multer.config');

exports.getAllMainBanner = async (req, res, next) => {
  try {
    const bannerType = req.params.bannerType;
    const result = await bannerService.getAllMainBanner(bannerType);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

exports.getPortalMainBanner = async (req, res, next) => {
  try {
    const bannerType = req.params.bannerType;
    const result = await bannerService.getPortalMainBanner(bannerType);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

exports.getMainBannerById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await bannerService.getMainBannerById(id);
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

exports.createMainBanner = async (req, res, next) => {
  try {
    const adminId = Util.getUserInfoByJWT(req).admin_id;
    const result = await bannerService.createMainBanner(req.body, adminId);

    if (result) {
      return res.send();
    } else {
      return res.status(500).send();
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

exports.updateMainBanner = async (req, res, next) => {
  try {
    const adminId = Util.getUserInfoByJWT(req).admin_id;
    const result = await bannerService.updateMainBanner(req.body, adminId);
    if (result) {
      return res.send();
    } else {
      return res.status(500).send();
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

exports.deleteMainBanner = async (req, res, next) => {
  try {
    const { ids, banner_type } = req.body;
    if (ids.length > 0 && banner_type) {
      for (let index = 0; index < ids.length; index++) {
        const id = ids[index];
        const result = await bannerService.deleteMainBanner(id);
        if (!result) {
          return res.status(500).send();
        }
      }
      const bannerList = await bannerService.getAllMainBanner(banner_type);
      return res.json(bannerList);
    } else {
      return res.status(500).send();
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

exports.pauseMainBanner = async (req, res, next) => {
  try {
    const { ids, banner_type } = req.body;
    if (ids.length > 0 && banner_type) {
      for (let index = 0; index < ids.length; index++) {
        const id = ids[index];
        const result = await bannerService.pauseMainBanner(id);
        if (!result) {
          return res.status(500).send();
        }
      }
      const bannerList = await bannerService.getAllMainBanner(banner_type);
      return res.json(bannerList);
    } else {
      return res.status(500).send();
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

exports.playMainBanner = async (req, res, next) => {
  try {
    const { ids, banner_type } = req.body;
    if (ids.length > 0 && banner_type) {
      for (let index = 0; index < ids.length; index++) {
        const id = ids[index];
        const result = await bannerService.playMainBanner(id);
        if (!result) {
          return res.status(500).send();
        }
      }
      const bannerList = await bannerService.getAllMainBanner(banner_type);
      return res.json(bannerList);
    } else {
      return res.status(500).send();
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

exports.uploadFiles = async (req, res, next) => {
  try {
    const filePath = createImageURL(req.file);
    return res.json({ data: { files: [filePath] } });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
