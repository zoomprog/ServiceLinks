export function initUrlTable(db) {
    db.run(`CREATE TABLE IF NOT EXISTS urls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        short_url TEXT NOT NULL,
        expires_at TEXT
    )`);
}

export function getUrlByShort(db, shortUrl, cb) {
    db.get('SELECT * FROM urls WHERE short_url = ?', [shortUrl], cb);
}

export function getUrlByOriginal(db, originalUrl, cb) {
    db.get('SELECT * FROM urls WHERE url = ?', [originalUrl], cb);
}

export function insertUrl(db, originalUrl, shortUrl, expiresAt, cb) {
    db.run('INSERT INTO urls (url, short_url, expires_at) VALUES (?, ?, ?)', [originalUrl, shortUrl, expiresAt], cb);
}

export function deleteUrlByShort(db, shortUrl, cb) {
    db.run('DELETE FROM urls WHERE short_url = ?', [shortUrl], cb);
} 