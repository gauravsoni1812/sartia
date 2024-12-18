"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const purchasedbooks_1 = __importDefault(require("../apis/user/purchasedbooks"));
const resetPassword_1 = __importStar(require("../apis/auth/resetPassword"));
const userRouter = (0, express_1.Router)();
// Set up routes correctly
userRouter.use("/signin", signIn_1.default); // Will match POST /signin
userRouter.use("/signup", signup_1.default); // Will match POST /signup
userRouter.use("/resetpassword", resetPassword_1.default); // Will match POST /signup
userRouter.use("/resetpasswordhandler", resetPassword_1.resetPasswordHandler); // Will match POST /signup
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
userRouter.use("/buyBook", buyBook_1.default);
userRouter.use("/purchased", purchasedbooks_1.default);
// You can add more routes here as needed
exports.default = userRouter;
