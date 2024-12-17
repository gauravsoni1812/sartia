"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllBooks = (0, express_1.Router)();
getAllBooks.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all books without filtering by status
        const books = yield prisma.book.findMany();
        res.status(200).json({
            message: "Books retrieved successfully.",
            books,
        });
    }
    catch (error) {
        console.error("Error retrieving books:", error.message);
        res.status(500).json({ message: "An error occurred while retrieving the books." });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
exports.default = getAllBooks;
