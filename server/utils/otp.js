import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendEmailOTP = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Your OTP for CodeQuest",
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2 style="color: #f48024;">CodeQuest Verification</h2>
                <p>Use the Following OTP to complete your request:</p>
                <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${otp}</h1>
                <p>This OTP is valid for 10 minutes.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP ${otp} sent to email: ${email}`);
        return true;
    } catch (error) {
        console.error("Email OTP error:", error);
        return false;
    }
};

export const sendSMSOTP = async (phoneNumber, otp) => {
    // MOCKED SMS SENDING
    console.log(`[MOCK SMS] OTP ${otp} sent to mobile: ${phoneNumber}`);
    return true;
};
