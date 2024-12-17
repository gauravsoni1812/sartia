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
const createBook = (0, express_1.Router)();
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
      <h3>New Book Created</h3>
      <p><strong>Created By:</strong> ${createdBy}</p>
      <p><strong>Book Name:</strong> ${name}</p>
      <p><strong>Description:</strong> ${description}</p>
      <p><strong>Status:</strong> Pending</p>
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
// Create Book Route
createBook.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, createdBy } = req.body;
        // Input validation
        if (!name || !description || !createdBy) {
            res.status(400).json({ message: "Name, description, and createdBy are required fields." });
            return;
        }
        // Create the book with a default status of 'pending'
        const newBook = yield prisma.book.create({
            data: {
                name,
                description,
                createdBy,
                status: "pending",
            },
        });
        // Send email notification to the superadmin
        yield sendEmailToSuperAdmin(createdBy, name, description);
        res.status(201).json({
            message: "Book created successfully. Notification sent to superadmin.",
            book: newBook,
        });
    }
    catch (error) {
        console.error("Error creating book:", error.message);
        if (error.code === "P2002") {
            res.status(400).json({ message: "A book with this name already exists." });
        }
        else {
            res.status(500).json({ message: "An error occurred while creating the book." });
        }
    }
    finally {
        yield prisma.$disconnect();
    }
}));
exports.default = createBook;
