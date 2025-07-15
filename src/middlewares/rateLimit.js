const rateLimitMap = new Map();
const LIMIT = 100;
const WINDOW_MS = 60 * 60 * 1000; // 1 час

export function rateLimitMiddleware(req, res, next) {
    const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;
    const now = Date.now();
    let entry = rateLimitMap.get(ip);
    if (!entry || now - entry.start > WINDOW_MS) {
        // Новый IP или окно истекло
        entry = { count: 1, start: now };
    } else {
        entry.count += 1;
    }
    rateLimitMap.set(ip, entry);
    if (entry.count > LIMIT) {
        return res.status(429).json({ success: false, message: 'Слишком много запросов. Попробуйте ещё раз позже.' });
    }
    next();
} 