import { Schema, model } from "mongoose";

const accountSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    password: {
      type: String,
    },
    provider: {
      type: String,
    },
    providerAccountId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Account = model("Account", accountSchema);
export default Account;
