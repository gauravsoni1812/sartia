import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const purchasedBooks = Router();

// GET all purchases by userId
purchasedBooks.get("/:userId", async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    try {
        // Fetch all purchases for the given userId
        const purchases = await prisma.purchase.findMany({
            where: {
                userId: userId, // Filter by userId
            },
            include: {
                book: true, // Include related book information
            },
        });

        // Check if purchases exist
        if (purchases.length === 0) {
            res.status(404).json({ message: "No purchases found for this user" });
            return;
        }

        // Return the list of purchases with book information
        res.status(200).json(purchases);
    } catch (error) {
        // Handle errors and send response
        res.status(500).json({ message: "Internal server error", error });
    }
});

export default purchasedBooks;
