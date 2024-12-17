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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const __1 = require("../..");
const signupDetails = (0, express_1.Router)();
signupDetails.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { password, email, role, name } = req.body;
        // Check if userName already exists (ensure userName is unique in your schema)
        const existUser = yield __1.prisma.user.findUnique({
            where: { email: email }, // This will now work because userName is unique
        });
        if (existUser) {
            res.status(400).json({ error: "Please use a unique username" });
            return;
        }
        if (password) {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            try {
                const response = yield __1.prisma.user.create({
                    data: {
                        name: name,
                        password: hashedPassword,
                        email: email,
                        role
                    }
                });
                console.log(response);
                res.status(200).json({ msg: `Welcome ${name} to Tablesprint!` });
                return;
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ status: false, error });
                return;
            }
        }
        else {
            res.status(400).json({ error: "Password is required" });
            return;
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
        return;
    }
}));
exports.default = signupDetails;
