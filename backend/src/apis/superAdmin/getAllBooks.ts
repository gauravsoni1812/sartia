import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const getAllBooks = Router();

getAllBooks.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all books without filtering by status
    const books = await prisma.book.findMany();

    res.status(200).json({
      message: "Books retrieved successfully.",
      books,
    });
  } catch (error: any) {
    console.error("Error retrieving books:", error.message);
    res.status(500).json({ message: "An error occurred while retrieving the books." });
  } finally {
    await prisma.$disconnect();
  }
});

export default getAllBooks;
