import mongoose, { model, Schema } from "mongoose";
import { Gender } from "../enums/userEnums.js";
import { provider, RoleEnum } from "../../enums/security.enums.js";
import { decrypt, encrypt } from "../../security/encryption.security.js";

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minLength: 13,
      required: function () {
        if (this.provider == provider.system) {
          return true;
        } else {
          return false;
        }
      },
    },
    phone: {
      type: String,
      set: function (value) {
        if (value) {
          return encrypt(value, "cryptojs");
        }
      },
      get: function (value) {
        if (value) {
          return decrypt(value, "cryptojs");
        }
      },
    },
    gender: {
      type: Number,
      enum: [Gender.male, Gender.female],
    },
    role: {
      type: Number,
      enum: [RoleEnum.admin, RoleEnum.user],
    },
    provider: {
      type: Number,
      enum: Object.values(provider),
    },
    profilePicture: String,
    coverPictures: [{ type: String }],
    isdeleted: {
      type: Boolean,
      default: false,
    },
    isEmailConfirmend: {
      type: Boolean,
      default: false,
    },
    cloudProfilePicture: {
      public_id: { type: String },
      secure_url: { type: String },
    },
    cloudCoverPictures: [
      {
        public_id: { type: String },
        secure_url: { type: String },
      },
    ],

    credantial_changed_at: Date,
    otp: String,
    otpExpires: Date,
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    strict: true,
    strictQuery: true,
    toJSON: {
      virtuals: true,
      getters: true,
    },
    toObject: {
      virtuals: true,
      getters: true,
    },
  },
);
//=====virtuals=====//
UserSchema.virtual("userName")
  .set(function (value) {
    const parts = value.trim().split(/\s+/);

    const first = parts[0];
    const last = parts.slice(1).join(" ");
    this.set("firstName", first);
    this.set("lastName", last);
  })
  .get(function () {
    if (!this.firstName || !this.lastName) return "";

    return `${this.firstName} ${this.lastName}`;
  });

UserSchema.virtual("messageSent", {
  ref: "message",
  foreignField: "senderId",
  localField: "_id",
});
UserSchema.virtual("messageRecived", {
  ref: "message",
  foreignField: "recieverId",
  localField: "_id",
});

const UserModel = mongoose.models.user || model("user", UserSchema);
export default UserModel;
