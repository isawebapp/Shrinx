const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'shorturl',
    password: 'CUjGj35Qe8wVYr1x3qSb',
    database: 'shorturl',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: 'https://shorturl.isawebapp.com',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/', express.static('public', {
    setHeaders: (res, path) => {
        console.log(`Serving: ${path}`);
    }
}));

app.post('/save', async (req, res) => {
    const { path, domain, redirectUrl, turnstileResponse } = req.body;

    if (!turnstileResponse || !path || !domain || !redirectUrl) {
        return res.status(400).send({ message: 'Invalid request. Missing required fields.' });
    }

    const secretKey = '0x4AAAAAAA2_Yq2QkGh8RQfVoBP_KJNPABI';

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
            try {
                const connection = await pool.getConnection();
                const [result] = await connection.execute(
                    `INSERT INTO paths (path, domain, redirect_url, last_edit_time)
                     VALUES (?, ?, ?, NOW())`,
                    [path, domain, redirectUrl]
                );
                connection.release();
            
                res.send({ 
                    message: 'Saved successfully.', 
                    data: { id: result.insertId, path, domain, redirectUrl } 
                });
            } catch (dbError) {
                res.status(500).send({ message: 'Database error.' });
            }
            
        } else {
            res.status(400).send({ message: 'Turnstile verification failed.', details: response.data });
        }
    } catch (turnstileError) {
        res.status(500).send({ message: 'Error verifying Turnstile token.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});