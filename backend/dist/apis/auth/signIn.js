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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const __1 = require("../..");
const signinDetails = (0, express_1.Router)();
signinDetails.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = (yield __1.prisma.user.findUnique({
            where: { email },
        }));
        if (!user) {
            res.status(404).send({ error: "Email not found" });
            return;
        }
        console.log(user);
        const passwordCheck = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordCheck) {
            res.status(401).send({ error: "Password does not match" });
            return;
        }
        // Create JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role
        }, process.env.SECRET_KEY, { expiresIn: "24h" });
        res.status(200).send({
            msg: "Login Successful",
            userName: user.email,
            role: user.role,
            token,
        });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ error });
        return;
    }
}));
exports.default = signinDetails;
