import express from "express";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import cors from "cors";
import fs from "fs";
import crypto from "crypto";
import apiRouter from "./routes/api.js";
import { initUrlTable } from "./models/urlModel.js";
import { initVisitTable } from "./models/visitModel.js";

dotenv.config();

function getOrCreateJwtSecret() {
    const secretFile = '.jwt_secret';
    if (fs.existsSync(secretFile)) {
        return fs.readFileSync(secretFile, 'utf8');
    }
    const secret = crypto.randomBytes(64).toString('hex');
    fs.writeFileSync(secretFile, secret);
    console.log('JWT_SECRET auto-generated and saved to .jwt_secret');
    return secret;
}

const app = express();
const PORT = process.env.PORT || 4000;

// Автоматическая генерация JWT_SECRET если не задан в .env
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = getOrCreateJwtSecret();
}

const db = new sqlite3.Database('./database.sqlite');
initUrlTable(db);
initVisitTable(db);

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Передаём db через req.app.locals
app.use((req, res, next) => {
    req.app.locals.db = db;
    next();
});

app.use('/', apiRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


