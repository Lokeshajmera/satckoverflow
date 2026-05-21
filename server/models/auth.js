import mongoose from "mongoose";

const userschema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  about: { type: String },
  tags: { type: [String] },
  joinDate: { type: Date, default: Date.now },
  phoneNumber: { type: String },
  lastPasswordResetRequest: { type: Date },
  plan: {
    type: String,
    enum: ["Free", "Bronze", "Silver", "Gold"],
    default: "Free"
  },
  planExpiry: { type: Date },
  dailyQuestionStats: {
    date: { type: String, default: "" },
    count: { type: Number, default: 0 }
  },
  points: { type: Number, default: 0 },
  preferredLanguage: { type: String, default: "English" },
  loginHistory: [
    {
      browser: String,
      os: String,
      device: String,
      ip: String,
      date: { type: Date, default: Date.now }
    }
  ],
  otp: { type: String },
  otpExpiry: { type: Date }
});
export default mongoose.model("user", userschema);
