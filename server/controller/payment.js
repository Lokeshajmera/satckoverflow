import Razorpay from "razorpay";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/auth.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Razorpay lazily to ensure environment variables are loaded
let razorpay;
const getRazorpay = () => {
    if (!razorpay) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpay;
};

const isPaymentTimeWindow = () => {
    const now = new Date();
    // Create a date object with the current time in IST
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istTime = new Date(istString);
    const hours = istTime.getHours();

    // Allowed strictly between 10:00 AM and 11:00 AM IST
    return hours === 10;
};

export const createOrder = async (req, res) => {
    if (!isPaymentTimeWindow()) {
        return res.status(403).json({
            message: "Payments are only allowed between 10:00 AM and 11:00 AM IST."
        });
    }

    const { amount, planName } = req.body;

    const options = {
        amount: amount * 100, // amount in smallest currency unit (paise)
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: { planName },
    };

    try {
        const rzp = getRazorpay();
        if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes("placeholder")) {
            throw new Error("Razorpay API keys are missing or invalid in server .env");
        }
        const order = await rzp.orders.create(options);
        res.status(200).json({ data: order });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({
            message: "Unable to create order",
            error: error.description || error.message || JSON.stringify(error) || "Unknown error"
        });
    }
};

export const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName, amount } = req.body;
    const userid = req.userid;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "razorpay_secret_placeholder")
        .update(sign.toString())
        .digest("hex");

    if (razorpay_signature === expectedSign) {
        try {
            const expiry = new Date();
            expiry.setMonth(expiry.getMonth() + 1); // 1 month subscription

            const updatedUser = await User.findByIdAndUpdate(
                userid,
                { plan: planName, planExpiry: expiry },
                { new: true }
            );

            // Send Invoice Email
            await sendInvoiceEmail(updatedUser.email, updatedUser.name, planName, amount, razorpay_payment_id);

            res.status(200).json({ message: "Payment verified successfully", data: updatedUser });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    } else {
        res.status(400).json({ message: "Invalid signature" });
    }
};

const sendInvoiceEmail = async (email, name, planName, amount, paymentId) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: `Invoice for your ${planName} Subscription - CodeQuest`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #f48024; text-align: center;">CodeQuest Subscription Invoice</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for subscribing to the <strong>${planName} Plan</strong> on CodeQuest. Your transaction was successful.</p>
        <hr />
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Plan:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${planName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Amount Paid:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${amount}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Payment ID:</strong></td>
            <td style="padding: 10px; border-bottom: 10px solid #eee; text-align: right;">${paymentId}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Duration:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">1 Month</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">You can now enjoy increased daily question posting limits based on your plan.</p>
        <p style="text-align: center; color: #888; font-size: 12px; margin-top: 30px;">
          &copy; 2026 CodeQuest Inc. All rights reserved.
        </p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Invoice email sent to:", email);
    } catch (error) {
        console.error("Email error:", error);
    }
};
