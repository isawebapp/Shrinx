const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const TURNSTILE_SECRET_KEY = '0x4AAAAAAA2_Yq2QkGh8RQfVoBP_KJNPABI';

let entries = []; // Store data in memory for simplicity

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files

app.post('/save', async (req, res) => {
    const { subdomain, maindomain, redirectUrl, turnstileResponse } = req.body;

    // Verify Turnstile token
    try {
        const verificationResponse = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', null, {
            params: {
                secret: TURNSTILE_SECRET_KEY,
                response: turnstileResponse,
            },
        });

        if (!verificationResponse.data.success) {
            return res.status(400).send({ message: 'Turnstile verification failed.' });
        }
    } catch (error) {
        return res.status(500).send({ message: 'Error verifying Turnstile.' });
    }

    // Validate subdomain
    const subdomainPattern = /^[a-z0-9-]+$/i;
    if (!subdomainPattern.test(subdomain)) {
        return res.status(400).send({ message: 'Invalid subdomain.' });
    }

    const newEntry = {
        id: entries.length + 1,
        subdomain,
        maindomain,
        redirectUrl,
        lastEditTime: new Date().toISOString(),
    };

    entries.push(newEntry);
    res.send({ message: 'Saved successfully.', data: newEntry });
});

app.get('/entries', (req, res) => {
    res.send(entries);
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
