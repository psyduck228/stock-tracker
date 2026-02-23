import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

app.use(cors({
    origin: /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/ // Restrict to local development only
}));

// Proxy endpoint for Yahoo Finance Historical Data
app.get('/api/yahoo-finance/:symbol', async (req, res) => {
    const { symbol } = req.params;
    const { period1, period2, interval } = req.query;

    if (!symbol || !period1 || !period2 || !interval) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Input Validation
    if (!/^[a-zA-Z0-9.^-]+$/.test(symbol)) {
        return res.status(400).json({ error: 'Invalid symbol format' });
    }

    // Strict numeric validation for timestamps
    if (!/^\d+$/.test(String(period1)) || !/^\d+$/.test(String(period2))) {
        return res.status(400).json({ error: 'Invalid period format. Expected positive integers.' });
    }

    if (Number(period1) >= Number(period2)) {
        return res.status(400).json({ error: 'period1 must be less than period2' });
    }

    const allowedIntervals = ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'];
    if (!allowedIntervals.includes(interval as string)) {
        return res.status(400).json({ error: 'Invalid interval format' });
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
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
