import mongoose from "mongoose";

const codeSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
    },

    email: {
      type: String,
    },

    code: {
      type: String,
      required: true,
    },

    timeSendCode: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Code", codeSchema);
