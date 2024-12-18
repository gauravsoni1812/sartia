import { Request, Response, Router } from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt"; // Don't forget to import bcrypt
import { prisma } from "../..";
// Initialize routers
const resetPassword = Router();
const resetPasswordHandler = Router();

// In-memory store for demonstration. Replace with database storage.
const resetTokens: { [email: string]: string } = {};

// POST endpoint to request a password reset email
resetPassword.post("/", async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
    }

    try {
        // Generate a secure random token
        const token = crypto.randomBytes(32).toString("hex");

        // Save the token in a database or in-memory store (temporary demo)
        resetTokens[email] = token;

        // Create a link for the password reset
        const resetLink = `http://localhost:5173/reset-password?token=${token}&email=${email}`;

        // Configure the mail transport
        const transporter = nodemailer.createTransport({
            service: "Gmail", // or your preferred email provider
            auth: {
                user: process.env.EMAIL_USER_SUPER, // Your email address
                pass: process.env.EMAIL_PASS_SUPER, // Your email password or app-specific password
            },
        });

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER_SUPER,
            to: email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you didn't request this, please ignore this email.`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        console.error("Error sending reset email:", error);
        res.status(500).json({ message: "Error sending email" });
    }
});

// POST endpoint to handle password reset
resetPasswordHandler.post("/", async (req: Request, res: Response): Promise<void> => {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
        res.status(400).json({ message: "Invalid request" });
        return;
    }

    try {
        // Validate token
        const storedToken = resetTokens[email];
        if (!storedToken || storedToken !== token) {
            res.status(400).json({ message: "Invalid or expired token" });
            return;
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Optionally: Invalidate the token
        delete resetTokens[email];

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "An error occurred" });
    }
});


// Export both routers
export { resetPasswordHandler }; // Named export
export default resetPassword; // Default export
