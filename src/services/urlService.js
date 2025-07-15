import { nanoid } from 'nanoid';
import { generateToken } from '../utils/jwt.js';
import * as urlModel from '../models/urlModel.js';
import * as visitModel from '../models/visitModel.js';

function getExpiresAt(ttl) {
    const hours = ttl ? Number(ttl) : Number(process.env.DEFAULT_TTL_HOURS) || 168;
    const expires = new Date(Date.now() + hours * 60 * 60 * 1000);
    return expires.toISOString();
}

function isExpired(expiresAt) {
    return expiresAt && new Date(expiresAt) < new Date();
}

export const getToken = (req, res) => {
    const token = generateToken({ user: 'admin' });
    res.json({ token });
};

export const createShortUrl = (req, res) => {
    const db = req.app.locals.db;
    const { originalUrl, ttl } = req.body;
    if (!originalUrl) {
        return res.status(400).json({ success: false, message: 'originalUrl is required' });
    }
    urlModel.getUrlByOriginal(db, originalUrl, (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        if (row) {
            if (isExpired(row.expires_at)) {
                urlModel.deleteUrlByShort(db, row.short_url, () => {});
            } else {
                return res.json({ shortUrl: row.short_url, expiresAt: row.expires_at });
            }
        }
        const shortId = nanoid(8);
        const shortUrl = `${process.env.BASE_URL || "http://localhost:4000"}/${shortId}`;
        const expiresAt = getExpiresAt(ttl);
        urlModel.insertUrl(db, originalUrl, shortUrl, expiresAt, function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            return res.json({ shortUrl, expiresAt });
        });
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
        if (!urlRow || isExpired(urlRow.expires_at)) {
            if (urlRow) urlModel.deleteUrlByShort(db, shortUrl, () => {});
            return res.status(404).json({ success: false, message: 'Короткий URL-адрес не найден или устарел.' });
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
                uniqueIps,
                expiresAt: urlRow.expires_at
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
        if (row && !isExpired(row.expires_at)) {
            // Логируем переход
            const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;
            const timestamp = new Date().toISOString();
            visitModel.insertVisit(db, shortUrl, ip, timestamp, function() {
                // Даже если логирование не удалось, всё равно делаем редирект
                return res.redirect(row.url);
            });
        } else {
            if (row) urlModel.deleteUrlByShort(db, shortUrl, () => {});
            return res.status(404).json({ success: false, message: "Короткий URL-адрес не найден или устарел." });
        }
    });
}; 