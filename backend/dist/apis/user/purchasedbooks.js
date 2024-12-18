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
const purchasedBooks = (0, express_1.Router)();
// GET all purchases by userId
purchasedBooks.get("/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        // Fetch all purchases for the given userId
        const purchases = yield prisma.purchase.findMany({
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
    }
    catch (error) {
        // Handle errors and send response
        res.status(500).json({ message: "Internal server error", error });
    }
}));
exports.default = purchasedBooks;
