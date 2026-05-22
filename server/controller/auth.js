import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { generateOTP, sendEmailOTP, sendSMSOTP } from "../utils/otp.js";

const getISTTime = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + istOffset);
};

const parseUserAgent = (ua) => {
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let device = "Desktop";

  if (ua.includes("Edg") || ua.includes("MSIE") || ua.includes("Trident")) {
    browser = "Microsoft Browser";
  } else if (ua.includes("Chrome")) {
    browser = "Google Chrome";
  } else if (ua.includes("Firefox")) {
    browser = "Firefox";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browser = "Safari";
  }

  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "MacOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone")) os = "iOS";

  if (ua.includes("Mobi") || ua.includes("Android") || ua.includes("iPhone")) {
    device = "Mobile";
  }

  return { browser, os, device };
};

export const Signup = async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;
  try {
    const exisitinguser = await user.findOne({ email });
    if (exisitinguser) {
      return res.status(404).json({ message: "User already exist" });
    }
    const hashpassword = await bcrypt.hash(password, 12);
    const newuser = await user.create({
      name,
      email,
      password: hashpassword,
      phoneNumber,
    });
    const token = jwt.sign(
      { email: newuser.email, id: newuser._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.status(200).json({ data: newuser, token });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
export const Login = async (req, res) => {
  const { email, password } = req.body;
  const ua = req.headers["user-agent"] || "";
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const { browser, os, device } = parseUserAgent(ua);

  try {
    const exisitinguser = await user.findOne({ email });
    if (!exisitinguser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const ispasswordcrct = await bcrypt.compare(
      password,
      exisitinguser.password
    );
    if (!ispasswordcrct) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 1. Mobile Device Restriction (10:00 AM - 1:00 PM IST)
    if (device === "Mobile") {
      const nowIST = getISTTime();
      const hours = nowIST.getUTCHours(); // getUTCHours on an IST-offset date gives us IST hour
      if (hours < 10 || hours >= 13) {
        return res.status(403).json({
          message: "Mobile access is only allowed between 10:00 AM and 1:00 PM IST."
        });
      }
    }

    // Record Login History
    exisitinguser.loginHistory.push({ browser, os, device, ip });
    await exisitinguser.save();

    // 2. Google Chrome Exception (Require Email OTP)
    if (browser === "Google Chrome") {
      const otp = generateOTP();
      const emailSent = await sendEmailOTP(exisitinguser.email, otp);
      if (emailSent) {
        exisitinguser.otp = otp;
        exisitinguser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await exisitinguser.save();
        let message = "Verification OTP sent to your registered email.";
        message += ` [DEV ONLY: ${otp}]`;
        return res.status(200).json({
          otpRequired: true,
          message: message,
        });
      }
    }

    // 3. Microsoft Browser Access (Allowed without additional auth)
    // 4. Default Access (For others)
    const token = jwt.sign(
      { email: exisitinguser.email, id: exisitinguser._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.status(200).json({ data: exisitinguser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

export const verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const exisitinguser = await user.findOne({ email });
    if (!exisitinguser || exisitinguser.otp !== otp || new Date() > exisitinguser.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    exisitinguser.otp = null;
    exisitinguser.otpExpiry = null;
    await exisitinguser.save();

    const token = jwt.sign(
      { email: exisitinguser.email, id: exisitinguser._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.status(200).json({ data: exisitinguser, token });
  } catch (error) {
    res.status(500).json("something went wrong..");
  }
};

export const requestLanguageChangeOTP = async (req, res) => {
  const { newLanguage } = req.body;
  const userid = req.userid;

  try {
    const existingUser = await user.findById(userid);
    if (!existingUser) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    existingUser.otp = otp;
    existingUser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await existingUser.save();

    if (newLanguage === "French") {
      await sendEmailOTP(existingUser.email, otp);
    } else {
      if (!existingUser.phoneNumber) {
        return res.status(400).json({ message: "Mobile number not registered for this account." });
      }
      await sendSMSOTP(existingUser.phoneNumber, otp);
    }

    let message = `OTP sent to your registered ${newLanguage === "French" ? "email" : "mobile number"}.`;
    message += ` [DEV ONLY: ${otp}]`;

    res.status(200).json({
      message: message,
    });
  } catch (error) {
    res.status(500).json({ message: "Error requesting OTP" });
  }
};

export const verifyLanguageChangeOTP = async (req, res) => {
  const { otp, newLanguage } = req.body;
  const userid = req.userid;

  try {
    const existingUser = await user.findById(userid);
    if (!existingUser || existingUser.otp !== otp || new Date() > existingUser.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    existingUser.otp = null;
    existingUser.otpExpiry = null;
    existingUser.preferredLanguage = newLanguage;
    await existingUser.save();

    res.status(200).json({ data: existingUser, message: `Language changed to ${newLanguage}` });
  } catch (error) {
    res.status(500).json("something went wrong..");
  }
};

export const getallusers = async (req, res) => {
  try {
    const alluser = await user.find();
    res.status(200).json({ data: alluser });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { name, about, tags, phoneNumber } = req.body.editForm;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "User unavailable" });
  }
  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Name is required" });
  }
  try {
    const updateprofile = await user.findByIdAndUpdate(
      _id,
      { $set: { name: name, about: about, tags: tags, phoneNumber: phoneNumber } },
      { new: true, runValidators: true }
    );
    res.status(200).json({ data: updateprofile });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

export const forgotPassword = async (req, res) => {
  const { identifier } = req.body; // Can be email or phone number

  try {
    const existingUser = await user.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User with this email/phone not found" });
    }

    // Rate Limiting: Check if a request was made in the last 24 hours
    if (existingUser.lastPasswordResetRequest) {
      const lastRequest = new Date(existingUser.lastPasswordResetRequest);
      const now = new Date();
      const diffInHours = (now - lastRequest) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return res.status(403).json({ message: "You can use this option only one time per day." });
      }
    }

    // Password Generator: Uppercase and lowercase letters only
    const generatePassword = (length = 12) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      let password = "";
      for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const newPassword = generatePassword();
    const hashPassword = await bcrypt.hash(newPassword, 12);

    existingUser.password = hashPassword;
    existingUser.lastPasswordResetRequest = new Date();
    await existingUser.save();

    res.status(200).json({
      message: "Password reset successful.",
      newPassword: newPassword, // Sending in plain text for this simple UX requirement
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updatePassword = async (req, res) => {
  const { id: _id } = req.params;
  const { oldPassword, newPassword } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "User unavailable" });
  }

  try {
    const existingUser = await user.findById(_id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(oldPassword, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    const hashPassword = await bcrypt.hash(newPassword, 12);
    existingUser.password = hashPassword;
    await existingUser.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const transferPoints = async (req, res) => {
  const { amount, recipientId } = req.body;
  const senderId = req.userid;

  if (!mongoose.Types.ObjectId.isValid(recipientId)) {
    return res.status(400).json({ message: "Invalid recipient ID" });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  try {
    const sender = await user.findById(senderId);
    const recipient = await user.findById(recipientId);

    if (!sender || !recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    // Normalize: old documents may have null points
    const senderPoints = Number(sender.points) || 0;
    const recipientPoints = Number(recipient.points) || 0;

    if (senderPoints <= 10) {
      return res.status(403).json({ message: "You need more than 10 points to transfer points" });
    }

    if (senderPoints < numAmount) {
      return res.status(400).json({ message: "Insufficient points" });
    }

    sender.points = senderPoints - numAmount;
    recipient.points = recipientPoints + numAmount;

    await sender.save();
    await recipient.save();

    res.status(200).json({ message: "Points transferred successfully", senderPoints: sender.points });
  } catch (error) {
    console.error("Transfer Points Error:", error.message, error.stack);
    res.status(500).json({ message: "Internal Server Error: " + error.message });
  }
};

