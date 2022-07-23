import multer from "multer";
import path from 'path';

const __dirWork = path.resolve();

const categoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirWork, "public", "image", "img-category"));
  },

  filename: function (req, file, cb) {
    const [oriName, extName] = file.originalname.split(".");
    const imgCategory = `${oriName}-${Date.now()}.${extName}`;
    req.body.imgCategory = imgCategory;
    cb(null, imgCategory);
  },
});

export const upload = multer({ storage: categoryStorage });
