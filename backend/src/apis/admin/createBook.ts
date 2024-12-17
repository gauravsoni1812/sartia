import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();
const createBook = Router();

// Configure Nodemailer with a static email sender
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_PASS_SUPER_USER, // Your system or verified email
    pass: process.env.EMAIL_PASS_SUPER_USER_PASS, // App password for the sender email
  },
});


// Function to send an email notification to the superadmin
const sendEmailToSuperAdmin = async (createdBy: string, name: string, description: string) => {
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
    await transporter.sendMail(mailOptions);
    console.log(`Notification email sent to superadmin: ${process.env.EMAIL_USER_SUPER}`);
  } catch (error) {
    console.error("Failed to send email to superadmin:", error);
  }
};

// Create Book Route
createBook.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, createdBy } = req.body;

    // Input validation
    if (!name || !description || !createdBy) {
      res.status(400).json({ message: "Name, description, and createdBy are required fields." });
      return;
    }

    // Create the book with a default status of 'pending'
    const newBook = await prisma.book.create({
      data: {
        name,
        description,
        createdBy,
        status: "pending",
      },
    });

    // Send email notification to the superadmin
    await sendEmailToSuperAdmin(createdBy, name, description);

    res.status(201).json({
      message: "Book created successfully. Notification sent to superadmin.",
      book: newBook,
    });
  } catch (error: any) {
    console.error("Error creating book:", error.message);

    if (error.code === "P2002") {
      res.status(400).json({ message: "A book with this name already exists." });
    } else {
      res.status(500).json({ message: "An error occurred while creating the book." });
    }
  } finally {
    await prisma.$disconnect();
  }
});

export default createBook;
