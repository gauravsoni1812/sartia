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
const showBooks = (0, express_1.Router)();
showBooks.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch books with "approved" status
        const approvedBooks = yield prisma.book.findMany({
            where: {
                status: "approved",
            },
        });
        res.status(200).json({
            message: "Approved books retrieved successfully.",
            books: approvedBooks,
        });
    }
    catch (error) {
        console.error("Error retrieving approved books:", error.message);
        res.status(500).json({
            message: "An error occurred while retrieving the approved books.",
        });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
exports.default = showBooks;
