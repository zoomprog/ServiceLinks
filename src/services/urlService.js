import { nanoid } from 'nanoid';
import { generateToken } from '../utils/jwt.js';
import * as urlModel from '../models/urlModel.js';
import * as visitModel from '../models/visitModel.js';

export const getToken = (req, res) => {
    const token = generateToken({ user: 'admin' });
    res.json({ token });
};

export const createShortUrl = (req, res) => {
    const db = req.app.locals.db;
    const { originalUrl } = req.body;
    if (!originalUrl) {
        return res.status(400).json({ success: false, message: 'originalUrl is required' });
    }
    urlModel.getUrlByOriginal(db, originalUrl, (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        if (row) {
            return res.json({ shortUrl: row.short_url });
        } else {
            const shortId = nanoid(8);
            const shortUrl = `${process.env.BASE_URL || "http://localhost:4000"}/${shortId}`;
            urlModel.insertUrl(db, originalUrl, shortUrl, function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: err.message });
                }
                return res.json({ shortUrl });
            });
        }
    });
};

export const getStats = (req, res) => {
    const db = req.app.locals.db;
    const shortId = req.params.code;
    const shortUrl = `${process.env.BASE_URL || "http://localhost:4000"}/${shortId}`;
    urlModel.getUrlByShort(db, shortUrl, (err, urlRow) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        if (!urlRow) {
            return res.status(404).json({ success: false, message: 'Short URL not found' });
        }
        visitModel.getVisitsByShortUrl(db, shortUrl, (err, visits) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            const visitsCount = visits.length;
            let firstVisit = null;
            let lastVisit = null;
            let uniqueIps = 0;
            if (visitsCount > 0) {
                const timestamps = visits.map(v => v.timestamp).sort();
                firstVisit = timestamps[0];
                lastVisit = timestamps[timestamps.length - 1];
                uniqueIps = new Set(visits.map(v => v.ip)).size;
            }
            return res.json({
                originalUrl: urlRow.url,
                visits: visitsCount,
                firstVisit,
                lastVisit,
                uniqueIps
            });
        });
    });
};

export const redirectShortUrl = (req, res) => {
    const db = req.app.locals.db;
    const shortId = req.params.shortId;
    const shortUrl = `${process.env.BASE_URL || "http://localhost:4000"}/${shortId}`;
    urlModel.getUrlByShort(db, shortUrl, (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        if (row) {
            // Логируем переход
            const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;
            const timestamp = new Date().toISOString();
            visitModel.insertVisit(db, shortUrl, ip, timestamp, function() {
                // Даже если логирование не удалось, всё равно делаем редирект
                return res.redirect(row.url);
            });
        } else {
            return res.status(404).json({ success: false, message: "Short URL not found" });
        }
    });
}; 