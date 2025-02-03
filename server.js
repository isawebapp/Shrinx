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
    process.exit(1); // Exit if the config file cannot be loaded
}

const app = express();
const PORT = config.server.port;

// SQLite3 database connection (using the file path from config.yml)
const db = new sqlite3.Database(config.database.path, (err) => {
    if (err) {
        console.error('Error opening SQLite database:', err);
        process.exit(1);
    }
});

// Database initialization
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

// Static file serving
app.use('/', express.static('public', {
    setHeaders: (res, path) => {}
}));

// Serve domains from config.yml as JSON
app.get('/api/domains', (req, res) => {
    if (config.domains && Array.isArray(config.domains)) {
        res.json({ domains: config.domains });
    } else {
        res.status(500).json({ error: 'Domains not found in config.yml' });
    }
});


// Error page route
app.get('/error', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'error.html'));
});

// Redirect handling route (from File 2)
app.get('/:path', (req, res, next) => {
    const { path } = req.params;
    const domain = req.url;

    db.get(
        'SELECT redirect_url FROM paths WHERE path = ? AND domain = ?',
        [path, domain],
        (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal Server Error');
            }

            if (row) {
                return res.redirect(row.redirect_url);
            } else {
                return next();
            }
        }
    );
});

// Save URL route (from File 1)
app.post('/save', async (req, res) => {
    console.log(req.body);
    const { path, domain, redirectUrl, turnstileResponse } = req.body;

    if (!turnstileResponse || !path || !domain || !redirectUrl) {
        console.log({ message: 'Invalid request. Missing required fields.' });
        return res.status(400).send({ message: 'Invalid request. Missing required fields.' });
    }

    const secretKey = config.turnstile.secret_key; // Using Turnstile secret key from config.yml

    try {
        const response = await axios.post(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                secret: secretKey,
                response: turnstileResponse,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.data.success) {
            // Check for existing entry
            db.get(
                'SELECT * FROM paths WHERE path = ? AND domain = ?',
                [path, domain],
                (err, row) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).send({ message: 'Database error.' });
                    }

                    if (row) {
                        return res.status(400).send({ 
                            message: 'An entry with the same path and domain already exists.' 
                        });
                    }

                    // Insert new entry
                    const stmt = db.prepare(
                        'INSERT INTO paths (path, domain, redirect_url, last_edit_time) VALUES (?, ?, ?, datetime("now"))'
                    );

                    stmt.run([path, domain, redirectUrl], function (err) {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).send({ message: 'Database error.' });
                        }

                        res.send({ 
                            message: 'Saved successfully.', 
                            data: { id: this.lastID, path, domain, redirectUrl } 
                        });
                    });
                }
            );
        } else {
            res.status(400).send({ message: 'Turnstile verification failed.', details: response.data });
        }
    } catch (turnstileError) {
        console.log({ message: 'Error verifying Turnstile token.', error: turnstileError });
        res.status(500).send({ message: 'Error verifying Turnstile token.' });
    }
});

//404 handler for unmatched routes
app.use((req, res) => {
    res.redirect(config.url + '/error'); // Redirect to error page URL from config.yml
});

// Use session for authentication
app.use(session({
    secret: 'your-secret-key',  // Change this to a secure key
    resave: false,
    saveUninitialized: true
}));

// Admin login route
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    const adminUsername = config.admin.username;
    const adminPassword = config.admin.password;

    if (username === adminUsername && password === adminPassword) {
        req.session.isAuthenticated = true;
        res.redirect('/admin');
    } else {
        res.status(401).send('Invalid username or password');
    }
});

// Admin authentication middleware
const adminAuth = (req, res, next) => {
    if (req.session.isAuthenticated) {
        return next();
    } else {
        res.redirect('/login');
    }
};

// Admin dashboard route (protected)
app.get('/admin', adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Fetch all redirects
app.get('/admin/redirects', adminAuth, (req, res) => {
    db.all('SELECT * FROM paths', (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.json({ redirects: rows });
    });
});

// Add a new redirect
app.post('/admin/add', adminAuth, (req, res) => {
    const { path, domain, redirectUrl } = req.body;

    if (!path || !domain || !redirectUrl) {
        return res.status(400).send('Missing required fields');
    }

    const stmt = db.prepare(
        'INSERT INTO paths (path, domain, redirect_url, last_edit_time) VALUES (?, ?, ?, datetime("now"))'
    );

    stmt.run([path, domain, redirectUrl], function (err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }
        res.status(200).send({ message: 'Redirect added successfully' });
    });
});

// Delete a redirect
app.delete('/admin/delete/:id', adminAuth, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM paths WHERE id = ?', [id], function (err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }
        res.status(200).send({ message: 'Redirect deleted successfully' });
    });
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://${config.server.url}:${PORT}`);
});
