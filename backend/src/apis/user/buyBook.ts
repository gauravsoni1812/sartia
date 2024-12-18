import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer"; // Import Nodemailer

const prisma = new PrismaClient();
const buyBook = Router();

// Configure Nodemailer (ensure environment variables are securely stored)
const transporter = nodemailer.createTransport({
  service: "gmail", // or another email provider
  auth: {
    user: process.env.EMAIL_PASS_SUPER_USER, // Sender email
    pass: process.env.EMAIL_PASS_SUPER_USER_PASS, // Email password or app-specific password
  },
});


// Function to send an email to the superadmin
const sendEmailToSuperAdmin = async (bookName: string, userName: string, userEmail: string) => {
  const mailOptions = {
    from: process.env.EMAIL_PASS_SUPER_USER, // Sender's email
    to: process.env.EMAIL_USER_SUPER , // Superadmin's email
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
    await transporter.sendMail(mailOptions);
    console.log(`Notification email sent to superadmin: ${process.env.EMAIL_USER_SUPER}`);
  } catch (error) {
    console.error("Failed to send email to superadmin:", error);
  }
};

// Buy Book Route
buyBook.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId, userId } = req.body; // Get the bookId and userId from the request body

    // Validate the request body
    if (!bookId || !userId) {
      res.status(400).json({ message: "Book ID and User ID are required." });
      return;
    }

    // Check if the book exists and is approved
    const book = await prisma.book.findUnique({
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Create a purchase record (if applicable)
    const purchase = await prisma.purchase.create({
      data: {
        bookId,
        userId,
        date: new Date(),
      },
    });

    // Send email to superadmin after purchase
    await sendEmailToSuperAdmin(book.name, user.name, user.email);

    res.status(200).json({
      message: "Book purchased successfully. Notification sent to superadmin.",
      purchase,
    });
  } catch (error: any) {
    console.error("Error purchasing book:", error.message);
    res.status(500).json({ message: "An error occurred while purchasing the book." });
  } finally {
    await prisma.$disconnect();
  }
});

export default buyBook;
