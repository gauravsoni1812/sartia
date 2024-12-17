import express from 'express';
import cors from 'cors';
import { PrismaClient } from "@prisma/client";
import userRouter from './routehandler/router'; // Import the correct router

export const prisma = new PrismaClient();

const app = express();
app.use(cors()); // Enable CORS for all routes

app.use(express.json()); // Middleware to parse JSON requests

app.get('/', (req, res) => {
    res.send("hi there from sartia global");
});

// Mount the userRouter at the root path
app.use('/', userRouter);

async function startServer() {
    try {
        await prisma.$connect(); // Ensure connection to the Prisma database
        console.log('Connected to the database');

        app.listen(3000, () => {
            console.log('Backend running on Port 3000');
        });
    } catch (error) {
        console.error('Failed to connect to the database', error);
        process.exit(1);
    }
}

startServer();
