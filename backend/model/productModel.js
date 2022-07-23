import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },

    slug: {
      type: String,
    },

    price: {
      type: Number,
    },

    quantity: {
      type: Number,
    },

    priceSale: {
      type: Number,
    },

    quantitySale: {
      type: Number,
    },

    description: {
      type: String,
    },

    order: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },

        quantity: Number
      }
    ],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    productImages: [
      {
        type: String,
      },
    ],

    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rate: {
          type: Number,
          enum: [1, 2, 3, 4, 5],
        },
        review: String,
      },
    ],

    updateAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
