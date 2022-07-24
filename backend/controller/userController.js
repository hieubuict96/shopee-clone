import twilio from "twilio";
import User from "../model/userModel.js";
import Code from "../model/code.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

const __dirWork = path.resolve();

export function sendPhoneNumber(req, res) {
  const phoneNumber = req.body.phoneNumber;
  User.findOne({ phoneNumber }).exec((error, user) => {
    if (error) return res.status(500).json({ error: "serverError" });
    if (user) return res.status(400).json({ error: "phoneNumberAlreadyUse" });

    const code = Math.random().toString().slice(6, 12);
    const timeSendCode = Date.now();

    var client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    Code.findOneAndUpdate(
      { phoneNumber },
      { code, timeSendCode },
      { new: true }
    ).exec(async (error, doc) => {
      if (error) return res.status(500).json({ error: "serverError" });
      if (doc) {
        try {
          const success = await client.messages.create({
            to: phoneNumber,
            from: process.env.PHONE_FROM,
            body: `Mã xác minh của bạn là ${code}`,
          });
          return res.status(200).json({ success: "success" });
        } catch (error) {
          console.log(error);
          return res.status(500).json({ error: "serverError" });
        }
      }

      const code_doc = new Code({
        phoneNumber,
        code,
        timeSendCode,
      });

      code_doc.save(async (error, doc) => {
        if (error) return res.status(500).json({ error: "serverError" });
        if (doc) {
          try {
            const success = await client.messages.create({
              to: phoneNumber,
              from: "+19362516568",
              body: `Mã xác minh của bạn là ${code}`,
            });

            return res.status(200).json({ success: "success" });
          } catch (error) {
            return res.status(500).json({ error: "serverError" });
          }
        }
      });
    });
  });
}

export function sendCode(req, res) {
  const { phoneNumber, code } = req.body;
  Code.findOne({ phoneNumber }).exec((error, doc) => {
    if (error) return res.status(500).json({ error: "serverError" });
    if (doc) {
      const timeVerifyCode = Date.now();
      if (timeVerifyCode - doc.timeSendCode < 300000) {
        if (code === doc.code) {
          return res.status(200).json({ success: "verifySuccess" });
        }

        return res.status(400).json({ error: "codeIncorrect" });
      }

      return res.status(400).json({ error: "timeoutVerifyCode" });
    }
  });
}

export function resendCode(req, res) {
  const phoneNumber = req.body.phoneNumber;

  const code = Math.random().toString().split(".")[1].slice(0, 6);
  const timeSendCode = Date.now();

  var client = twilio(
    "AC1f992454125cf5454177e5fe08e50b58",
    "8c727770c6d6b3e3cd4fba6088b471eb"
  );

  Code.findOneAndUpdate(
    { phoneNumber },
    { code, timeSendCode },
    { new: true }
  ).exec(async (error, doc) => {
    if (error) return res.status(500).json({ error: "serverError" });
    if (doc) {
      try {
        const success = await client.messages.create({
          to: phoneNumber,
          from: "+19362516568",
          body: `Mã xác minh của bạn là ${code}`,
        });
        return res.status(200).json({ success: "success" });
      } catch (error) {
        return res.status(500).json({ error: "serverError" });
      }
    }
  });
}

export function signup(req, res) {
  const { firstName, lastName, password, phoneNumber } = req.body;
  const hashPassword = bcryptjs.hashSync(password, 10);

  const user = new User({
    firstName,
    lastName,
    hashPassword,
    phoneNumber,
  });

  user.save((error, user) => {
    if (error) return res.status(500).json({ error: "serverError" });
    if (user) {
      const accessToken = jwt.sign(
        {
          _id: user._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      return res.status(200).json({
        user: {
          _id: user._id,
          firstName,
          lastName,
          phoneNumber,
        },
        accessToken,
      });
    }
  });
}

export function signin(req, res) {
  const { user, password } = req.body;
  console.log(user);
  if (/@/.test(user)) {
    User.findOne({ email: user }).exec((error, user) => {
      if (error) return res.status(500).json({ error: "serverError" });
      if (user) {
        const isPassword = bcryptjs.compareSync(password, user.hashPassword);
        if (isPassword) {
          const accessToken = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
          );

          return res.status(200).json({
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phoneNumber: user.phoneNumber,
              address: user.address,
              imgBuyer: user.imgBuyer,
              shop: user.shop,
            },
            accessToken,
          });
        }

        return res.status(400).json({ error: "signinFail" });
      }

      return res.status(400).json({ error: "signinFail" });
    });
  } else {
    const phoneNumber = `+84${user.slice(1)}`;
    User.findOne({ phoneNumber }).exec((error, user) => {
      if (error) return res.status(500).json({ error: "serverError" });

      if (user) {
        const isPassword = bcryptjs.compareSync(password, user.hashPassword);
        if (isPassword) {
          const accessToken = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
          );

          return res.status(200).json({
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phoneNumber: user.phoneNumber,
              address: user.address,
              imgBuyer: user.imgBuyer,
              shop: user.shop,
            },
            accessToken,
          });
        }

        return res.status(400).json({ error: "signinFail" });
      }

      return res.status(400).json({ error: "signinFail" });
    });
  }
}

export function signinWithGoogle(req, res) {
  const { email, familyName, givenName, imageUrl } = req.body.data.profileObj;
  User.findOne({ email }).exec((error, user) => {
    if (error) return res.status(500).json({ error: "serverError" });
    if (user) {
      const accessToken = jwt.sign(
        {
          _id: user._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      return res.status(200).json({
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          imgBuyer: user.imgBuyer,
          shop: user.shop,
        },
        accessToken,
      });
    }

    const newUser = new User({
      email,
      firstName: familyName,
      lastName: givenName,
      imgBuyer: imageUrl,
    });

    newUser.save((error, user) => {
      if (error) return res.status(500).json({ error: "serverError" });
      if (user) {
        const accessToken = jwt.sign(
          {
            _id: user._id,
          },
          process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );

        return res.status(200).json({
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address,
            imgBuyer: user.imgBuyer,
            shop: user.shop,
          },
          accessToken,
        });
      }
    });
  });
}

export function signinWithFacebook(req, res) {
  const { name, userID } = req.body.data;
  const img = req.body.data.picture.data.url;

  User.findOne({ userIdFacebook: userID }).exec((error, user) => {
    if (error) return res.status(500).json({ error: "serverError" });
    if (user) {
      const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });

      return res.status(200).json({
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          imgBuyer: user.imgBuyer,
          shop: user.shop,
        },
        accessToken,
      });
    }

    const arrName = name.split(" ");
    const lastName = arrName[arrName.length - 1];
    const firstName = name.slice(0, name.indexOf(lastName) - 1);
    const newUser = new User({
      firstName,
      lastName,
      userIdFacebook: userID,
      imgBuyer: img,
    });

    newUser.save((error, user) => {
      if (error) return res.status(500).json({ error: "serverError" });
      if (user) {
        const accessToken = jwt.sign(
          { _id: user._id },
          process.env.JWT_SECRET,
          {
            expiresIn: "30d",
          }
        );

        return res.status(200).json({
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address,
            imgBuyer: user.imgBuyer,
            shop: user.shop,
          },
          accessToken,
        });
      }
    });
  });
}

export function getData(req, res) {
  if (!req.headers.authorization) {
    return res.status(400).json({ error: "bad request" });
  }

  const accessToken = req.headers.authorization.split(" ")[1];

  try {
    const user = jwt.verify(accessToken, process.env.JWT_SECRET);
    User.findById(user._id).exec((error, user) => {
      if (error) return res.status(500).json({ error: "serverError" });
      if (user) {
        return res.status(200).json({
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address,
            imgBuyer: user.imgBuyer,
            shop: user.shop,
          },
        });
      }

      return res.status(500).json({ error: "serverError" });
    });
  } catch (error) {
    return res.status(400).json({ error: "verifyFail" });
  }
}

export function updateController(req, res) {
  const { _id, firstName, lastName, shopName, address, imgBuyer, imgShop } =
    req.body;
  const imgBuyerLink = imgBuyer ? `/public/image/img-buyer/${imgBuyer}` : "";
  const imgShopLink = imgShop ? `/public/image/img-shop/${imgShop}` : "";

  User.findById(_id).exec((error, user) => {
    if (error) {
      if (imgBuyer) {
        fs.unlinkSync(
          path.join(__dirWork, "public", "image", "img-buyer", imgBuyer)
        );
      }

      if (imgShop) {
        fs.unlinkSync(
          path.join(__dirWork, "public", "image", "img-shop", imgShop)
        );
      }

      return res.status(500).json({ error: "serverError" });
    }

    if (user) {
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (shopName) user.shop.shopName = shopName;
      if (address) user.address = address;
      if (imgBuyer) user.imgBuyer = imgBuyerLink;
      if (imgShop) user.shop.imgShop = imgShopLink;

      user.save((error, user) => {
        if (error) {
          if (imgBuyer) {
            fs.unlinkSync(
              path.join(__dirWork, "public", "image", "img-buyer", imgBuyer)
            );
          }

          if (imgShop) {
            fs.unlinkSync(
              path.join(__dirWork, "public", "image", "img-shop", imgShop)
            );
          }

          return res.status(500).json({ error: "serverError" });
        }

        return res.status(200).json({
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            address: user.address,
            imgBuyer: user.imgBuyer,
            shop: user.shop,
          },
        });
      });

      return;
    }

    if (imgBuyer) {
      fs.unlinkSync(
        path.join(__dirWork, "public", "image", "img-buyer", imgBuyer)
      );
    }

    if (imgShop) {
      fs.unlinkSync(
        path.join(__dirWork, "public", "image", "img-shop", imgShop)
      );
    }

    return res.status(500).json({ error: "serverError" });
  });
}

export async function sendCodeToEmail(req, res) {
  const { _id, newEmail, password } = req.body;

  let errorStep = 1;
  try {
    const doc = await User.findById(_id);
    errorStep = 2;
    const oldEmail = doc.email;
    const isPassword = bcryptjs.compareSync(password, doc.hashPassword);
    if (!isPassword) return res.status(400).json({ error: "wrongPassword" });
    const isEmailAlreadyUse = await User.findOne({ email: newEmail });
    errorStep = 3;
    if (isEmailAlreadyUse)
      return res.status(400).json({ error: "newEmailAlreadyUse" });
    res.status(200).json({ success: "sendCodeToEmailSuccess" });

    if (oldEmail) {
      const codeToOldEmail = Math.random().toString().split(".")[1].slice(0, 6);
      const timeSendCodeToOldEmail = Date.now();

      const dataToOldEmail = {
        from: process.env.EMAIL_SHOPEE,
        to: oldEmail,
        subject: "Xác thực tài khoản email cho Shopee",
        text: "this is text",
        html: `<p>Mã code của bạn là ${codeToOldEmail}. Mã code có thời gian tồn tại là 5 phút. Vui lòng điền vào biểu mẫu để xác nhận tài khoản email này thuộc về bạn</p>`,
      };

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_SHOPEE,
          pass: process.env.PWD_SHOPEE,
        },
      });

      transporter.sendMail(dataToOldEmail, (error) => {
        if (error) console.log(error);
      });

      Code.findOneAndUpdate(
        { email: oldEmail },
        { timeSendCode: timeSendCodeToOldEmail, code: codeToOldEmail },
        { new: true },
        (error, doc) => {
          if (error) return;
          if (!doc) {
            const doc = new Code({
              email: oldEmail,
              timeSendCode: timeSendCodeToOldEmail,
              code: codeToOldEmail,
            });

            doc.save((error, doc) => {});
          }
        }
      );
    }

    const codeToNewEmail = Math.random().toString().split(".")[1].slice(0, 6);
    const timeSendCodeToNewEmail = Date.now();

    const dataToNewEmail = {
      from: process.env.EMAIL_SHOPEE,
      to: newEmail,
      subject: "Xác thực tài khoản email cho Shopee",
      text: "this is text",
      html: `<p>Mã code của bạn là ${codeToNewEmail}. Mã code có thời gian tồn tại là 5 phút. Vui lòng điền vào biểu mẫu để xác nhận tài khoản email này thuộc về bạn</p>`,
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SHOPEE,
        pass: process.env.PWD_SHOPEE,
      },
    });

    transporter.sendMail(dataToNewEmail, (error) => {
      if (error) console.log(error);
    });

    Code.findOneAndUpdate(
      { email: newEmail },
      { timeSendCode: timeSendCodeToNewEmail, code: codeToNewEmail },
      { new: true },
      (error, doc) => {
        if (error) return;
        if (!doc) {
          const doc = new Code({
            email: newEmail,
            timeSendCode: timeSendCodeToNewEmail,
            code: codeToNewEmail,
          });

          doc.save((error, doc) => {});
        }
      }
    );
  } catch (error) {
    console.log(error);
    if (errorStep === 1 || errorStep === 2) {
      return res.status(500).json({ error: "serverError" });
    }
  }
}

export async function verifyCodeUpdateEmail(req, res) {
  const { _id, oldEmail, codeOldEmail, newEmail, codeNewEmail } = req.body;

  try {
    if (oldEmail) {
      const codeDataOld = await Code.findOne({ email: oldEmail });
      const codeDataNew = await Code.findOne({ email: newEmail });
      if (!codeDataOld || !codeDataNew)
        return res.status(500).json({ error: "serverError" });

      const timeNow = Date.now();
      if (
        timeNow - codeDataOld.timeSendCode > 300000 ||
        timeNow - codeDataNew.timeSendCode > 300000
      ) {
        return res.status(400).json({ error: "timeoutVerifyCode" });
      }

      if (
        codeOldEmail !== codeDataOld.code ||
        codeNewEmail !== codeDataNew.code
      ) {
        return res.status(400).json({ error: "verifyCodeFail" });
      }

      const newDoc = await User.findByIdAndUpdate(
        _id,
        { email: newEmail },
        { new: true }
      );

      if (!newDoc) return res.status(500).json({ error: "serverError" });

      return res.status(200).json({ success: "updateEmailSuccess" });
    } else {
      const codeDataNew = await Code.findOne({ email: newEmail });
      if (!codeDataNew) {
        return res.status(500).json({ error: "serverError" });
      }

      const timeNow = Date.now();

      if (timeNow - codeDataNew.timeSendCode > 300000) {
        return res.status(400).json({ error: "timeoutVerifyCode" });
      }

      if (codeNewEmail !== codeDataNew.code) {
        return res.status(400).json({ error: "verifyCodeFail" });
      }

      const newDoc = await User.findByIdAndUpdate(
        _id,
        { email: newEmail },
        { new: true }
      );

      if (!newDoc) return res.status(500).json({ error: "serverError" });

      return res.status(200).json({ success: "updateEmailSuccess" });
    }
  } catch (error) {
    res.status(500).json({ error: "serverError" });
  }
}
