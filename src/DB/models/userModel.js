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
    lastname: {
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
    isdeleted: {
      type: Boolean,
      default: false,
    },
    isEmailConfirmend: {
      type: Boolean,
      default: false,
    },
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
UserSchema.virtual("username")
  .set(function (value) {
    const [first, last] = value.split(" ");
    this.set("firstName", first);
    this.set("lastname", last);
  })
  .get(function () {
    return `${this.firstName} ${this.lastname}`;
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
