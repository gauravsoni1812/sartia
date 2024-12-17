import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const showBooks = Router();

showBooks.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch books with "approved" status
    const approvedBooks = await prisma.book.findMany({
      where: {
        status: "approved",
      },
    });

    res.status(200).json({
      message: "Approved books retrieved successfully.",
      books: approvedBooks,
    });
  } catch (error: any) {
    console.error("Error retrieving approved books:", error.message);
    res.status(500).json({
      message: "An error occurred while retrieving the approved books.",
    });
  } finally {
    await prisma.$disconnect();
  }
});

export default showBooks;
