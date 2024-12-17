"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const signIn_1 = __importDefault(require("../apis/auth/signIn"));
const signup_1 = __importDefault(require("../apis/auth/signup"));
const createUser_1 = __importDefault(require("../apis/superAdmin/createUser"));
const getAllBooks_1 = __importDefault(require("../apis/superAdmin/getAllBooks"));
const update_book_1 = __importDefault(require("../apis/superAdmin/update_book"));
const createBook_1 = __importDefault(require("../apis/admin/createBook"));
const updateBook_1 = __importDefault(require("../apis/admin/updateBook"));
const showbooks_1 = __importDefault(require("../apis/user/showbooks"));
const delete_data_1 = __importDefault(require("../apis/admin/delete_data"));
const buyBook_1 = __importDefault(require("../apis/user/buyBook"));
const userRouter = (0, express_1.Router)();
// Set up routes correctly
userRouter.use("/signin", signIn_1.default); // Will match POST /signin
userRouter.use("/signup", signup_1.default); // Will match POST /signup
//superAdmin
userRouter.use("/createUser", createUser_1.default);
userRouter.use("/getAllBooks", getAllBooks_1.default);
userRouter.use("/updateBook", update_book_1.default);
//admin
userRouter.use("/createBook", createBook_1.default);
userRouter.use("/updateBookByAdmin", updateBook_1.default);
userRouter.use("/deleteAll", delete_data_1.default);
//user
userRouter.use("/showBooks", showbooks_1.default);
userRouter.use("/buyBooks", buyBook_1.default);
// You can add more routes here as needed
exports.default = userRouter;
