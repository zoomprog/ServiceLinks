import express from "express";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import apiRouter from "./routes/api.js";
import { initUrlTable } from "./models/urlModel.js";
import { initVisitTable } from "./models/visitModel.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const db = new sqlite3.Database('./database.sqlite');
initUrlTable(db);
initVisitTable(db);

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


