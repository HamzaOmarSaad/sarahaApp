import mongoose, { model } from "mongoose";

const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jti: {
      type: String,
      required: true,
    },
    expiresIn: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
// delete it immediatly  when its time comes
schema.index("expiresIn", {
  expireAfterSeconds: 0,
});

const TokenModel =
  mongoose.models.revokedToken || model("revokedToken", schema);
export default TokenModel;
