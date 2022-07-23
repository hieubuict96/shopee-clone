import Joi from "joi";
import multer from "multer";
import path from "path";
import fs from "fs";

const __dirWork = path.resolve();

const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirWork, "public", "image", "img-product"));
  },

  filename: function (req, file, cb) {
    const [oriName, extName] = file.originalname.split(".");
    const imgProduct = `${oriName}-${Date.now()}.${extName}`;
    req.body.imgProducts = req.body.imgProducts || [];
    req.body.imgProducts = [...req.body.imgProducts, imgProduct];
    cb(null, imgProduct);
  },
});

export const upload = multer({ storage: productStorage });

export function validateProduct(req, res, next) {
  const intRegex = /^[0-9]+$/;
  const schema = Joi.object({
    shopId: Joi.any(),

    productName: Joi.string().required(),

    categoryIdSelected: Joi.string().required(),

    price: Joi.string().pattern(intRegex).required(),

    quantity: Joi.string().pattern(intRegex).required(),

    priceSale: Joi.string().pattern(intRegex).allow(""),

    quantitySale: Joi.string().pattern(intRegex).allow(""),

    desc: Joi.any(),

    imgProducts: Joi.array().required(),

    productImages: Joi.any(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    req.body.imgProducts.forEach((value) => {
      fs.unlinkSync(
        path.join(__dirWork, "public", "image", "img-product", value)
      );
    });

    return res.status(400).json({ error: error.details[0].path[0] });
  }

  next();
}
