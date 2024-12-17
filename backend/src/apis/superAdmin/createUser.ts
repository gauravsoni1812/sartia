import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt"; // Import bcrypt for password hashing

const prisma = new PrismaClient();
const createUser = Router();

// Configure the email transporter (replace with your SMTP credentials)
const transporter = nodemailer.createTransport({
  service: "gmail", // Use "gmail" or another email provider
  auth: {
    user: process.env.EMAIL_USER, // Sender email address (stored securely in .env)
    pass: process.env.EMAIL_PASS, // App password or email password (stored securely in .env)
  },
});

createUser.post("/", async (req: Request, res: Response): Promise<void> => {
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
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    // Create a new user with hashed password
    const newUser = await prisma.user.create({
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

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "User created successfully, and a welcome email has been sent.",
      user: { id: newUser.id, email: newUser.email, role: newUser.role },
    });
  } catch (error: any) {
    console.error("Error creating user:", error.message);

    if (error.code === "P2002") {
      // Handle unique constraint error (e.g., duplicate email)
      res.status(400).json({ message: "A user with this email already exists." });
    } else {
      res.status(500).json({ message: "An error occurred while creating the user." });
    }
  } finally {
    await prisma.$disconnect();
  }
});

export default createUser;
