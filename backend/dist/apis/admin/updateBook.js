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
const updateBookByAdmin = (0, express_1.Router)();
// Configure Nodemailer with a static email sender
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_PASS_SUPER_USER, // Your system or verified email
        pass: process.env.EMAIL_PASS_SUPER_USER_PASS, // App password for the sender email
    },
});
// Function to send an email notification to the superadmin
const sendEmailToSuperAdmin = (createdBy, name, description) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: process.env.EMAIL_PASS_SUPER_USER, // Static sender email (required for reliability)
        to: process.env.EMAIL_USER_SUPER, // Superadmin email
        subject: "New Book Created Notification",
        html: `
      <h3>Book ${name} is updated</h3>
      <p><strong>Updated By:</strong> ${createdBy}</p>
      <p><strong>Book Name:</strong> ${name}</p>
      <p><strong>Description:</strong> ${description}</p>
      <br />
      <p>Please review the book and approve/reject it.</p>
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
updateBookByAdmin.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Book ID from URL
        const { name, description, author } = req.body; // New fields to update
        // Input validation
        if (!name || !description || !author) {
            res.status(400).json({ message: "Name, description, author, and updatedBy are required fields." });
            return;
        }
        // Check if the user exists and has the 'superAdmin' role
        const user = yield prisma.user.findUnique({
            where: { email: author },
        });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        if (user.role !== "admin") {
            res.status(403).json({ message: "Only superAdmins can update book details." });
            return;
        }
        // Update the book details
        const updatedBook = yield prisma.book.update({
            where: { id },
            data: { name, description, createdBy: author }, // Update the book with new details
        });
        yield sendEmailToSuperAdmin(author, name, description);
        res.status(200).json({
            message: "Book updated successfully.",
            book: updatedBook,
        });
    }
    catch (error) {
        console.error("Error updating book details:", error.message);
        if (error.code === "P2025") {
            // Handle case when the book with the given ID does not exist
            res.status(404).json({ message: "Book not found." });
        }
        else {
            res.status(500).json({ message: "An error occurred while updating the book." });
        }
    }
    finally {
        yield prisma.$disconnect();
    }
}));
exports.default = updateBookByAdmin;
