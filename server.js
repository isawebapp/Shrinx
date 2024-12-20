const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const app = express();
const cors = require('cors');

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
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    const { domain_path, maindomain, redirectUrl, turnstileResponse } = req.body;

    if (!turnstileResponse || !domain_path || !maindomain || !redirectUrl) {
        console.log('Missing fields:', { domain_path, maindomain, redirectUrl, turnstileResponse });
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

        console.log('Turnstile verification response:', response.data);

        if (response.data.success) {
            try {
                const connection = await pool.getConnection();
                const [result] = await connection.execute(
                    `INSERT INTO domain_paths (domain_path, maindomain, redirect_url, last_edit_time)
                     VALUES (?, ?, ?, NOW())`,
                    [domain_path, maindomain, redirectUrl]
                );
                connection.release();
            
                console.log('Database operation successful:', result);
                res.send({ 
                    message: 'Saved successfully.', 
                    data: { id: result.insertId, domain_path, maindomain, redirectUrl } 
                });
            } catch (dbError) {
                console.error('Database error:', dbError);
                res.status(500).send({ message: 'Database error.' });
            }
            
        } else {
            console.log('Turnstile verification failed:', response.data);
            res.status(400).send({ message: 'Turnstile verification failed.', details: response.data });
        }
    } catch (turnstileError) {
        console.error('Error verifying Turnstile token:', turnstileError);
        res.status(500).send({ message: 'Error verifying Turnstile token.' });
    }
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});