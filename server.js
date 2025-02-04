const express = require('express');
const session = require('express-session');
const axios = require('axios');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const yaml = require('js-yaml');
const fs = require('fs');

// Load configuration from config.yml
let config;
try {
    config = yaml.load(fs.readFileSync(path.join(__dirname, 'config.yml'), 'utf8'));
} catch (e) {
    console.error('Error loading config.yml:', e);
    process.exit(1);
}

const app = express();
const PORT = config.server.port;

// SQLite3 database connection
const db = new sqlite3.Database(config.database.path, (err) => {
    if (err) {
        console.error('Error opening SQLite database:', err);
        process.exit(1);
    }
});

// Initialize the database
const initDatabase = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS paths (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL,
            domain TEXT NOT NULL,
            redirect_url TEXT NOT NULL,
            last_edit_time TEXT NOT NULL
        );
    `;
    
    db.run(createTableQuery, (err) => {
        if (err) {
            console.error('Error initializing database:', err);
        } else {
            console.log('Database initialized successfully');
        }
    });
};

// Initialize the database when the app starts
initDatabase();

// Middleware setup
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// **Serve static files from `public/` directory**
app.use(express.static(path.join(__dirname, 'public')));

// **Root Route - Serve index.html only for localhost**
app.get('/', (req, res) => {
    if (!["localhost", "127.0.0.1"].includes(req.hostname)) {
        return res.status(403).send('Forbidden');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// **Serve login page**
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// **Serve domains as JSON (only for localhost)**
app.get('/api/domains', (req, res) => {
    if (!["localhost", "127.0.0.1"].includes(req.hostname)) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    res.json({ domains: config.domains });
});

// **Error page (only for localhost)**
app.get('/error', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'error.html'));
});

// **Updated Route: Redirect handling moved to `/url/:path`**
app.get('/url/:path', (req, res, next) => {
    if (!config.domains.includes(req.hostname)) {
        return next(); // Ignore if not in allowed domains
    }

    const { path } = req.params;

    db.get(
        'SELECT redirect_url FROM paths WHERE path = ? AND domain = ?',
        [path.trim(), req.hostname],
        (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal Server Error');
            }

            if (row) {
                let redirectUrl = row.redirect_url.trim(); // Trim whitespace and control characters
                
                // Ensure proper protocol handling
                if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
                    redirectUrl = 'http://' + redirectUrl; // Default to HTTP if no protocol is specified
                }

                return res.redirect(redirectUrl);
            } else {
                return next();
            }
        }
    );
});

// **Authentication & Admin Routes (Only for localhost)**
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

const adminAuth = (req, res, next) => {
    if (req.session.isAuthenticated) return next();
    res.redirect('/login');
};

// **Admin login POST route**
app.post('/admin/login', (req, res) => {
    if (!["localhost", "127.0.0.1"].includes(req.hostname)) return res.status(403).send('Forbidden');

    const { username, password } = req.body;
    if (username === config.admin.username && password === config.admin.password) {
        req.session.isAuthenticated = true;
        res.redirect('/admin');
    } else {
        res.status(401).send('Invalid username or password');
    }
});

// **Admin dashboard route**
app.get('/admin', adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// **Admin: Fetch all redirects**
app.get('/admin/redirects', adminAuth, (req, res) => {
    db.all('SELECT * FROM paths', (err, rows) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.json({ redirects: rows });
    });
});

// **Admin: Add a new redirect**
app.post('/admin/add', adminAuth, (req, res) => {
    const { path, domain, redirectUrl } = req.body;
    if (!path || !domain || !redirectUrl) return res.status(400).send('Missing required fields');

    const stmt = db.prepare(
        'INSERT INTO paths (path, domain, redirect_url, last_edit_time) VALUES (?, ?, ?, datetime("now"))'
    );

    stmt.run([path, domain, redirectUrl], function (err) {
        if (err) return res.status(500).send('Database error');
        res.status(200).send({ message: 'Redirect added successfully' });
    });
});

// **Admin: Delete a redirect**
app.delete('/admin/delete/:id', adminAuth, (req, res) => {
    db.run('DELETE FROM paths WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).send('Database error');
        res.status(200).send({ message: 'Redirect deleted successfully' });
    });
});

// **404 Handler - Redirect to error page only for localhost**
// app.use((req, res) => {
//     if (["localhost", "127.0.0.1"].includes(req.hostname)) {
//         res.redirect('/error');
//     } else {
//         res.status(404).send('Not Found');
//     }
// });

// **Start server**
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
