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
const deleteAllData = (0, express_1.Router)();
deleteAllData.delete("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Delete all records in the User table
        yield prisma.user.deleteMany();
        console.log("All users have been deleted.");
        // Delete all records in the Book table
        yield prisma.book.deleteMany();
        console.log("All books have been deleted.");
        res.status(200).json({ message: "All user and book records have been deleted." });
    }
    catch (error) {
        console.error("Error deleting data:", error.message);
        res.status(500).json({ message: "An error occurred while deleting the data." });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
exports.default = deleteAllData;
