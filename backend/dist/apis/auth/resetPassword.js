"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordHandler = void 0;
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const bcrypt_1 = __importDefault(require("bcrypt")); // Don't forget to import bcrypt
const __1 = require("../..");
// Initialize routers
const resetPassword = (0, express_1.Router)();
const resetPasswordHandler = (0, express_1.Router)();
exports.resetPasswordHandler = resetPasswordHandler;
// In-memory store for demonstration. Replace with database storage.
const resetTokens = {};
// POST endpoint to request a password reset email
resetPassword.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
    }
    try {
        // Generate a secure random token
        const token = crypto_1.default.randomBytes(32).toString("hex");
        // Save the token in a database or in-memory store (temporary demo)
        resetTokens[email] = token;
        // Create a link for the password reset
        const resetLink = `http://localhost:5173/reset-password?token=${token}&email=${email}`;
        // Configure the mail transport
        const transporter = nodemailer_1.default.createTransport({
            service: "Gmail", // or your preferred email provider
            auth: {
                user: process.env.EMAIL_USER_SUPER, // Your email address
                pass: process.env.EMAIL_PASS_SUPER, // Your email password or app-specific password
            },
        });
        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER_SUPER,
            to: email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you didn't request this, please ignore this email.`,
        };
        // Send the email
        yield transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Password reset email sent" });
    }
    catch (error) {
        console.error("Error sending reset email:", error);
        res.status(500).json({ message: "Error sending email" });
    }
}));
// POST endpoint to handle password reset
resetPasswordHandler.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
        res.status(400).json({ message: "Invalid request" });
        return;
    }
    try {
        // Validate token
        const storedToken = resetTokens[email];
        if (!storedToken || storedToken !== token) {
            res.status(400).json({ message: "Invalid or expired token" });
            return;
        }
        // Hash the new password
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Update the password in the database
        const user = yield __1.prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Optionally: Invalidate the token
        delete resetTokens[email];
        res.status(200).json({ message: "Password reset successfully" });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "An error occurred" });
    }
}));
exports.default = resetPassword; // Default export
