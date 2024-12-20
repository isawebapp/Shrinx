const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();

const cors = require('cors');
app.use(cors({
    origin: 'https://shorturl.isawebapp.com',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

const pool = mysql.createPool({
    host: 'localhost',
    user: 'shorturl',
    password: 'CUjGj35Qe8wVYr1x3qSb',
    database: 'shorturl',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', express.static('public', {
    setHeaders: (res, path) => {
        console.log(`Serving: ${path}`);
    }
}));

app.post('/save', async (req, res) => {
    console.log('Body: ', req.body);
    const { subdomain, maindomain, redirectUrl, turnstileResponse } = req.body;
    const secretKey = '0x4AAAAAAA2_Yq2QkGh8RQfVoBP_KJNPABI';

    if (!turnstileResponse || !subdomain || !maindomain || !redirectUrl) {
        return res.status(400).send({ message: 'Invalid request. Missing required fields.' });
    }

    try {
        const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', null, {
            params: {
                secret: secretKey,
                response: turnstileResponse,
            },
        });

        console.log('Turnstile verification response:', response.data);

        if (response.data.success) {
            // Do the logic
            try {
                const connection = await pool.getConnection();
                const [result] = await connection.execute(
                    `INSERT INTO subdomains (subdomain, maindomain, redirect_url, last_edit_time)
                     VALUES (?, ?, ?, ?)`,
                    [subdomain, maindomain, redirectUrl, new Date().toISOString()]
                );
                connection.release();

                res.send({ message: 'Saved successfully.', data: { id: result.insertId, subdomain, maindomain, redirectUrl } });
            } catch (error) {
                console.error('Database error:', error);
                res.status(500).send({ message: 'Database error.' });
            }
        } else {
            res.status(400).send({ message: 'Turnstile verification failed.', details: response.data });
        }
    } catch (error) {
        console.error('Error verifying Turnstile token:', error);
        res.status(500).send({ message: 'Error verifying Turnstile token.' });
    }
});

app.get('/entries', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`SELECT * FROM subdomains ORDER BY id DESC`);
        connection.release();
        res.send(rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send({ message: 'Database error.' });
    }
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});