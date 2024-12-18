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
const nodemailer_1 = __importDefault(require("nodemailer"));
const prisma = new client_1.PrismaClient();
const updateBook = (0, express_1.Router)();
// Configure Nodemailer for sending emails
const transporter = nodemailer_1.default.createTransport({
    service: "gmail", // Use "gmail" or another provider
    auth: {
        user: process.env.EMAIL_USER_SUPER, // Sender email (stored securely in .env)
        pass: process.env.EMAIL_PASS_SUPER, // App password or email password (stored securely in .env)
    },
});
updateBook.patch("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookId, status, updatedBy } = req.body; // Extract data from the request body
        // Input validation
        if (!bookId || !status || !updatedBy) {
            res
                .status(400)
                .json({
                message: "bookId, status, and updatedBy are required fields.",
            });
            return;
        }
        // Check if the user exists and has the 'superAdmin' role
        const user = yield prisma.user.findUnique({
            where: { email: updatedBy },
        });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        if (user.role !== "superadmin") {
            res
                .status(403)
                .json({ message: "Only superAdmins can approve or reject books." });
            return;
        }
        // Update the book status
        const updatedBook = yield prisma.book.update({
            where: { id: bookId }, // Use bookId from the body
            data: { status },
        });
        // If status is "rejected" or "approved", notify the admin
        if (status.toLowerCase() === "rejected" || status.toLowerCase() === "approved") {
            // Replace with your admin email
            const mailOptions = {
                from: process.env.EMAIL_USER_SUPER,
                to: updatedBy,
                subject: `Book Status Update: ${status}`,
                text: `The book with ID: ${bookId} has been ${status} by ${updatedBy}.`,
                html: `
          <p><strong>Book Status Update</strong></p>
          <p>The book with the following details has been updated:</p>
          <ul>
            <li><strong>Book ID:</strong> ${bookId}</li>
            <li><strong>Status:</strong> ${status}</li>
            <li><strong>Updated By:</strong> ${updatedBy}</li>
          </ul>
          <p>This is an automated notification.</p>
        `,
            };
            // Send the email
            yield transporter.sendMail(mailOptions);
        }
        res.status(200).json({
            success: true,
            message: "Book status updated successfully.",
            book: updatedBook,
        });
    }
    catch (error) {
        console.error("Error updating book status:", error.message);
        if (error.code === "P2025") {
            res.status(404).json({ message: "Book not found." });
        }
        else {
            res
                .status(500)
                .json({ message: "An error occurred while updating the book status." });
        }
    }
    finally {
        yield prisma.$disconnect();
    }
}));
exports.default = updateBook;
