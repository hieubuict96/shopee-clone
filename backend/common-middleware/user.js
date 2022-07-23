import Joi from "joi";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

const __dirWork = path.resolve();

export function validatePhoneNumber(req, res, next) {
  const regexPhoneNumber = /^\+[0-9]+$/;
  const schema = Joi.object({
    phoneNumber: Joi.string().pattern(regexPhoneNumber).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].path[0] });
  next();
}

export function validateInfo(req, res, next) {
  const regexPassword = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  const schema = Joi.object({
    firstName: Joi.string().required(),

    lastName: Joi.string().required(),

    password: Joi.string().pattern(regexPassword).required(),

    phoneNumber: Joi.string().required,
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].path[0] });
  next();
}

export function validateUpdate(req, res, next) {
  const schema = Joi.object({
    _id: Joi.any(),

    firstName: Joi.string().required(),

    lastName: Joi.string().required(),

    address: Joi.any(),

    shopName: Joi.any(),

    imgBuyer: Joi.any(),

    imgShop: Joi.any(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    if (req.body.imgBuyer) {
      fs.unlinkSync(
        path.join(__dirWork, "public", "image", "img-buyer", req.body.imgBuyer)
      );
    }

    if (req.body.imgShop) {
      fs.unlinkSync(
        path.join(__dirWork, "public", "image", "img-shop", req.body.imgShop)
      );
    }

    return res.status(400).json({ error: error.details[0].path[0] });
  }
  next();
}

const userStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    //Nếu upload nhiều file thì biến file trong function này sẽ duyệt từng file và trả về
    if (file.fieldname === "imgBuyer") {
      cb(null, path.join(__dirWork, "public", "image", "img-buyer"));
    }

    if (file.fieldname === "imgShop") {
      cb(null, path.join(__dirWork, "public", "image", "img-shop"));
    }
  },

  filename: function (req, file, cb) {
    const [oriName, extName] = file.originalname.split(".");
    if (file.fieldname === "imgBuyer") {
      const imgBuyer = `${oriName}-${Date.now()}.${extName}`;
      req.body.imgBuyer = imgBuyer;
      cb(null, imgBuyer);
    }

    if (file.fieldname === "imgShop") {
      const imgShop = `${oriName}-${Date.now()}.${extName}`;
      req.body.imgShop = imgShop;
      cb(null, imgShop);
    }
  },
});

export const upload = multer({ storage: userStorage });

export function requireSignin(req, res, next) {
  const is_next = req.headers['is-next'];
  const accessToken = req.headers.authorization
    ? req.headers.authorization.split("Bearer ")[1]
    : "";
  try {
    const user = jwt.verify(accessToken, process.env.JWT_SECRET);
    next();
  } catch (error) {
    if (is_next) {
      req.headers.is_verify_fail = true;
      return next();
    }
    return res.status(400).json({ error: "verifyFail" });
  }
}

export function validateEmail(req, res, next) {
  const regexEmail = /^[^ ]+@[^ ]+\.[^ ]+$/;
  const schema = Joi.object({
    _id: Joi.string().required(),

    newEmail: Joi.string().pattern(regexEmail).required(),

    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].path[0] });
  next();
}
