import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();
const updateBookByAdmin = Router();

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
    await transporter.sendMail(mailOptions);
    console.log(`Notification email sent to superadmin: ${process.env.EMAIL_USER_SUPER}`);
  } catch (error) {
    console.error("Failed to send email to superadmin:", error);
  }
};


updateBookByAdmin.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  
  try {
    const { id } = req.params; // Book ID from URL
    const { name, description, author } = req.body; // New fields to update

    // Input validation
    if (!name || !description || !author) {
      res.status(400).json({ message: "Name, description, author, and updatedBy are required fields." });
      return;
    }

    // Check if the user exists and has the 'superAdmin' role
    const user = await prisma.user.findUnique({
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
    const updatedBook = await prisma.book.update({
      where: { id },
      data: { name, description, createdBy:author }, // Update the book with new details
    });

    await sendEmailToSuperAdmin(author, name, description);


    res.status(200).json({
      message: "Book updated successfully.",
      book: updatedBook,
    });
  } catch (error: any) {
    console.error("Error updating book details:", error.message);

    if (error.code === "P2025") {
      // Handle case when the book with the given ID does not exist
      res.status(404).json({ message: "Book not found." });
    } else {
      res.status(500).json({ message: "An error occurred while updating the book." });
    }
  } finally {
    await prisma.$disconnect();
  }
});

export default updateBookByAdmin;
