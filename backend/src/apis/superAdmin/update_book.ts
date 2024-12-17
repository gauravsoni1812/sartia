import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();
const updateBook = Router();

// Configure Nodemailer for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail", // Use "gmail" or another provider
  auth: {
    user: process.env.EMAIL_USER_SUPER, // Sender email (stored securely in .env)
    pass: process.env.EMAIL_PASS_SUPER, // App password or email password (stored securely in .env)
  },
});

updateBook.patch("/", async (req: Request, res: Response): Promise<void> => {
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
    const user = await prisma.user.findUnique({
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
    const updatedBook = await prisma.book.update({
      where: { id: bookId }, // Use bookId from the body
      data: { status },
    });

    // If status is "rejected" or "approved", notify the admin
    if (status.toLowerCase() === "rejected" || status.toLowerCase() === "approved") {
      const adminEmail = "admin@example.com"; // Replace with your admin email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: adminEmail,
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
      await transporter.sendMail(mailOptions);
    }

    res.status(200).json({
      success: true,
      message: "Book status updated successfully.",
      book: updatedBook,
    });
  } catch (error: any) {
    console.error("Error updating book status:", error.message);

    if (error.code === "P2025") {
      res.status(404).json({ message: "Book not found." });
    } else {
      res
        .status(500)
        .json({ message: "An error occurred while updating the book status." });
    }
  } finally {
    await prisma.$disconnect();
  }
});

export default updateBook;
