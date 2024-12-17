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
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const router_1 = __importDefault(require("./routehandler/router")); // Import the correct router
exports.prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use((0, cors_1.default)()); // Enable CORS for all routes
app.use(express_1.default.json()); // Middleware to parse JSON requests
app.get('/', (req, res) => {
    res.send("hi there from sartia global");
});
// Mount the userRouter at the root path
app.use('/', router_1.default);
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.prisma.$connect(); // Ensure connection to the Prisma database
            console.log('Connected to the database');
            app.listen(3000, () => {
                console.log('Backend running on Port 3000');
            });
        }
        catch (error) {
            console.error('Failed to connect to the database', error);
            process.exit(1);
        }
    });
}
startServer();
