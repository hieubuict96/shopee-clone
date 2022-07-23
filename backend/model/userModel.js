import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },

    lastName: {
      type: String,
    },

    email: {
      type: String,
    },

    hashPassword: {
      type: String,
    },

    userIdFacebook: {
      type: String,
    },

    phoneNumber: {
      type: String,
    },

    address: {
      type: String,
    },

    imgBuyer: {
      type: String,
    },

    shop: {
      shopName: {
        type: String,
      },

      imgShop: {
        type: String,
      },

      categories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
