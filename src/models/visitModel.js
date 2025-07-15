export function initVisitTable(db) {
    db.run(`CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_url TEXT NOT NULL,
        ip TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )`);
}

export function insertVisit(db, shortUrl, ip, timestamp, cb) {
    db.run('INSERT INTO visits (short_url, ip, timestamp) VALUES (?, ?, ?)', [shortUrl, ip, timestamp], cb);
}

export function getVisitsByShortUrl(db, shortUrl, cb) {
    db.all('SELECT * FROM visits WHERE short_url = ?', [shortUrl], cb);
} 