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
const bcrypt_1 = __importDefault(require("bcrypt")); // Import bcrypt for password hashing
const prisma = new client_1.PrismaClient();
const createUser = (0, express_1.Router)();
// Configure the email transporter (replace with your SMTP credentials)
const transporter = nodemailer_1.default.createTransport({
    service: "gmail", // Use "gmail" or another email provider
    auth: {
        user: process.env.EMAIL_USER, // Sender email address (stored securely in .env)
        pass: process.env.EMAIL_PASS, // App password or email password (stored securely in .env)
    },
});
createUser.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, password, role } = req.body;
        // Input validation
        if (!email || !name || !password || !role) {
            res.status(400).json({ message: "Email, name, password, and role are required fields." });
            return;
        }
        // Ensure the role is valid
        const validRoles = ["user", "admin"];
        if (!validRoles.includes(role)) {
            res
                .status(400)
                .json({ message: `Role must be one of the following: ${validRoles.join(", ")}` });
            return;
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10); // Salt rounds = 10
        // Create a new user with hashed password
        const newUser = yield prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword, // Save hashed password
                role,
            },
        });
        // Send a welcome email to the user
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender email
            to: email, // Recipient email
            subject: "Welcome to Our Platform!",
            text: `Hello ${name},\n\nYour account has been created successfully with the role: ${role}.\n\nThank you for joining us!\n\nBest regards,\nSartia Global`,
            html: `
        <h3>Welcome to Our Platform, ${name}!</h3>
        <p>Your account has been created successfully with the following details:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Role:</strong> ${role}</li>
        </ul>
        <p>Thank you for joining us!</p>
        <p><strong>Best regards,</strong><br>Sartia Global Team</p>
      `,
        };
        yield transporter.sendMail(mailOptions);
        res.status(201).json({
            message: "User created successfully, and a welcome email has been sent.",
            user: { id: newUser.id, email: newUser.email, role: newUser.role },
        });
    }
    catch (error) {
        console.error("Error creating user:", error.message);
        if (error.code === "P2002") {
            // Handle unique constraint error (e.g., duplicate email)
            res.status(400).json({ message: "A user with this email already exists." });
        }
        else {
            res.status(500).json({ message: "An error occurred while creating the user." });
        }
    }
    finally {
        yield prisma.$disconnect();
    }
}));
exports.default = createUser;
