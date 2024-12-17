import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const deleteAllData = Router();

deleteAllData.delete("/", async (req: Request, res: Response): Promise<void> => {
  try {
    // Delete all records in the User table
    await prisma.user.deleteMany();
    console.log("All users have been deleted.");

    // Delete all records in the Book table
    await prisma.book.deleteMany();
    console.log("All books have been deleted.");

    res.status(200).json({ message: "All user and book records have been deleted." });
  } catch (error: any) {
    console.error("Error deleting data:", error.message);
    res.status(500).json({ message: "An error occurred while deleting the data." });
  } finally {
    await prisma.$disconnect();
  }
});

export default deleteAllData;
