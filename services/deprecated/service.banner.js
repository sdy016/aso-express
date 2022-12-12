const { adminPool } = require('../utils/dbConnection');

exports.getAllMainBanner = async (bannerType) => {
  let returnData = [];
  const connection = await adminPool.getConnection();
  try {
    if (bannerType) {
      const [rows] = await connection.query(
        `
        SELECT *
        FROM main_banner
        WHERE is_delete = 'N'
          AND banner_type = ?
      `,
        [bannerType]
      );
      if (rows) {
        returnData = rows;
      }
      return returnData;
    } else {
      return null;
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};

exports.getPortalMainBanner = async (bannerType) => {
  let returnData = [];
  const connection = await adminPool.getConnection();
  try {
    if (bannerType) {
      const [rows] = await connection.query(
        `
        SELECT *
        FROM main_banner
        WHERE is_delete = 'N'
          AND banner_type = ?
          AND is_use = 'Y'
          AND now() >= banner_display_start_date
          AND now() <= banner_display_end_date
      `,
        [bannerType]
      );
      if (rows) {
        returnData = rows;
      }
      return returnData;
    } else {
      return null;
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};

exports.getMainBannerById = async (id) => {
  let returnData = [];
  const connection = await adminPool.getConnection();
  try {
    if (id) {
      const [rows] = await connection.query(
        `
        SELECT *
        FROM main_banner
        WHERE is_delete = 'N'
          AND id = ?
      `,
        [id]
      );
      if (rows) {
        returnData = rows[0];
      }
      return returnData;
    } else {
      return null;
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};

exports.createMainBanner = async (bannerData, adminId) => {
  const connection = await adminPool.getConnection();
  try {
    if (bannerData && adminId) {
      const {
        banner_display_end_date,
        banner_display_start_date,
        banner_image_mobile_fileName,
        banner_image_mobile_url,
        banner_image_pc_fileName,
        banner_image_pc_url,
        banner_type,
        is_use,
        title,
      } = bannerData;

      const [insert_process] = await connection.query(
        `
      INSERT INTO main_banner 
      (
        banner_type, 
        title, 
        is_use, 
        is_delete, 
        register, 
        banner_display_start_date, 
        banner_display_end_date, 
        banner_image_pc_url, 
        banner_image_mobile_url, 
        banner_image_pc_fileName, 
        banner_image_mobile_fileName
      ) 
      VALUES
      (
        ?, ?, ?,'N',?,?,?,?,?,?,?
      )
      `,
        [
          banner_type,
          title,
          is_use,
          adminId,
          banner_display_start_date,
          banner_display_end_date,
          banner_image_pc_url,
          banner_image_mobile_url,
          banner_image_pc_fileName,
          banner_image_mobile_fileName,
        ]
      );
      if (insert_process.affectedRows === 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};

exports.updateMainBanner = async (bannerData, adminId) => {
  const connection = await adminPool.getConnection();
  try {
    if (bannerData && adminId) {
      const { id } = bannerData;
      let bannerInfo = null;
      const [rows] = await connection.query(
        `
        SELECT *
        FROM main_banner
        WHERE is_delete = 'N'
          AND id = ?
      `,
        [id]
      );
      if (rows) {
        bannerInfo = rows[0];
      }
      if (bannerInfo) {
        const keys = [
          'title',
          'is_use',
          'banner_display_start_date',
          'banner_display_end_date',
          'banner_image_pc_url',
          'banner_image_mobile_url',
          'banner_image_pc_fileName',
          'banner_image_mobile_fileName',
        ];
        keys.forEach((element) => {
          bannerInfo[element] = bannerData[element];
        });
      }

      const {
        banner_display_end_date,
        banner_display_start_date,
        banner_image_mobile_fileName,
        banner_image_mobile_url,
        banner_image_pc_fileName,
        banner_image_pc_url,
        is_use,
        title,
      } = bannerData;

      const [update_process] = await connection.query(
        `
      UPDATE main_banner
      SET
        title = ?, 
        is_use = ?, 
        banner_display_start_date = ?, 
        banner_display_end_date = ?, 
        banner_image_pc_url = ?, 
        banner_image_mobile_url = ?, 
        banner_image_pc_fileName = ?, 
        banner_image_mobile_fileName = ?
      WHERE id = ?
      `,
        [
          title,
          is_use,
          banner_display_start_date,
          banner_display_end_date,
          banner_image_pc_url,
          banner_image_mobile_url,
          banner_image_pc_fileName,
          banner_image_mobile_fileName,
          id,
        ]
      );
      if (update_process.affectedRows === 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};

exports.deleteMainBanner = async (id) => {
  const connection = await adminPool.getConnection();
  try {
    if (id) {
      const [delete_process] = await connection.query(
        `
        UPDATE main_banner
          SET  is_delete = 'Y'
        WHERE id = ?
      `,
        [id]
      );
      if (delete_process.affectedRows === 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};

exports.pauseMainBanner = async (id) => {
  const connection = await adminPool.getConnection();
  try {
    if (id) {
      const [pause_process] = await connection.query(
        `
        UPDATE main_banner
          SET  is_use = 'N'
        WHERE id = ?
      `,
        [id]
      );
      if (pause_process.affectedRows === 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};

exports.playMainBanner = async (id) => {
  const connection = await adminPool.getConnection();
  try {
    if (id) {
      const [pause_process] = await connection.query(
        `
        UPDATE main_banner
          SET  is_use = 'Y'
        WHERE id = ?
      `,
        [id]
      );
      if (pause_process.affectedRows === 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  } catch (error) {
    throw Error(error);
  } finally {
    connection.release();
  }
};
