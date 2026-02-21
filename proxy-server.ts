import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

app.use(cors());

// Proxy endpoint for Yahoo Finance Historical Data
app.get('/api/yahoo-finance/:symbol', async (req, res) => {
    const { symbol } = req.params;
    const { period1, period2, interval } = req.query;

    if (!symbol || !period1 || !period2 || !interval) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}`;
        const response = await fetch(yahooUrl);

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Yahoo API Error' });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
