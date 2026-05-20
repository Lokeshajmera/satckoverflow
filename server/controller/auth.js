import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const Signup = async (req, res) => {
  const { name, email, password } = req.body;
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
    });
    const token = jwt.sign(
      { email: newuser.email, id: newuser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ data: newuser, token });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
export const Login = async (req, res) => {
  const { email, password } = req.body;
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
    const token = jwt.sign(
      { email: exisitinguser.email, id: exisitinguser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ data: exisitinguser, token });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
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
  const { name, about, tags } = req.body.editForm;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "User unavailable" });
  }
  try {
    const updateprofile = await user.findByIdAndUpdate(
      _id,
      { $set: { name: name, about: about, tags: tags } },
      { new: true }
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
