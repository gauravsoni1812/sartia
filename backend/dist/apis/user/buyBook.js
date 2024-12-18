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
const express_1 = require("express");
const client_1 = require("@prisma/client");
const nodemailer_1 = __importDefault(require("nodemailer")); // Import Nodemailer
const prisma = new client_1.PrismaClient();
const buyBook = (0, express_1.Router)();
// Configure Nodemailer (ensure environment variables are securely stored)
const transporter = nodemailer_1.default.createTransport({
    service: "gmail", // or another email provider
    auth: {
        user: process.env.EMAIL_PASS_SUPER_USER, // Sender email
        pass: process.env.EMAIL_PASS_SUPER_USER_PASS, // Email password or app-specific password
    },
});
// Function to send an email to the superadmin
const sendEmailToSuperAdmin = (bookName, userName, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: process.env.EMAIL_PASS_SUPER_USER, // Sender's email
        to: process.env.EMAIL_USER_SUPER, // Superadmin's email
        subject: "Book Purchase Notification",
        html: `
      <h3>New Book Purchase</h3>
      <p><strong>User:</strong> ${userName} (${userEmail})</p>
      <p><strong>Book:</strong> ${bookName}</p>
      <p><strong>Status:</strong> Purchase Completed</p>
      <br />
      <p>Please review the purchase details.</p>
      <p>Best regards,<br>Your Platform Team</p>
    `,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log(`Notification email sent to superadmin: ${process.env.EMAIL_USER_SUPER}`);
    }
    catch (error) {
        console.error("Failed to send email to superadmin:", error);
    }
});
// Buy Book Route
buyBook.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookId, userId } = req.body; // Get the bookId and userId from the request body
        // Validate the request body
        if (!bookId || !userId) {
            res.status(400).json({ message: "Book ID and User ID are required." });
            return;
        }
        // Check if the book exists and is approved
        const book = yield prisma.book.findUnique({
            where: { id: bookId },
        });
        if (!book) {
            res.status(404).json({ message: "Book not found." });
            return;
        }
        if (book.status !== "approved") {
            res.status(400).json({ message: "Only approved books can be purchased." });
            return;
        }
        // Fetch the user's details
        const user = yield prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        // Create a purchase record (if applicable)
        const purchase = yield prisma.purchase.create({
            data: {
                bookId,
                userId,
                date: new Date(),
            },
        });
        // Send email to superadmin after purchase
        yield sendEmailToSuperAdmin(book.name, user.name, user.email);
        res.status(200).json({
            message: "Book purchased successfully. Notification sent to superadmin.",
            purchase,
        });
    }
    catch (error) {
        console.error("Error purchasing book:", error.message);
        res.status(500).json({ message: "An error occurred while purchasing the book." });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
exports.default = buyBook;
