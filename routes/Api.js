import { Router } from "express";
import sqlite3 from "sqlite3";
import { nanoid } from "nanoid";

const router = Router();
const db = new sqlite3.Database('./database.sqlite');

db.run(`CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    short_url TEXT NOT NULL
)`);

router.post('/shrink', (req, res) => {
    const { link } = req.body;
    if (!link) {
        return res.status(400).json({
            success: false,
            message: "Link is required"
        });
    }

    db.get('SELECT * FROM urls WHERE url = ?', [link], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        if (row) {
            return res.json({ shortUrl: row.short_url });
        } else {
            const shortId = nanoid(8);
            const shortUrl = `${process.env.BASE_URL || "http://localhost:4000"}/${shortId}`;
            db.run('INSERT INTO urls (url, short_url) VALUES (?, ?)', [link, shortUrl], function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                return res.json({ shortUrl });
            });
        }
    });
});

// Новый маршрут для редиректа по короткой ссылке
router.get('/:shortId', (req, res) => {
    const shortId = req.params.shortId;
    const shortUrl = `${process.env.BASE_URL || "http://localhost:4000"}/${shortId}`;
    db.get('SELECT * FROM urls WHERE short_url = ?', [shortUrl], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        if (row) {
            return res.redirect(row.url);
        } else {
            return res.status(404).json({ success: false, message: "Short URL not found" });
        }
    });
});

export default router;