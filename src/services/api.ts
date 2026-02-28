import type { StockDataPoint } from '../types';

const BASE_URL = 'https://finnhub.io/api/v1';

export interface FinnhubQuote {
    c: number; // Current price
    d: number; // Change
    dp: number; // Percent change
    h: number; // High price of the day
    l: number; // Low price of the day
    o: number; // Open price of the day
    pc: number; // Previous close price
}

export interface FinnhubSearchResponse {
    count: number;
    result: {
        description: string;
        displaySymbol: string;
        symbol: string;
        type: string;
    }[];
}

export interface FinnhubCandleResponse {
    c: (number | null)[]; // Close prices
    h: (number | null)[]; // High prices
    l: (number | null)[]; // Low prices
    o: (number | null)[]; // Open prices
    s: string; // Status
    t: number[]; // Timestamps
    v: (number | null)[]; // Volume
}

export const fetchQuote = async (symbol: string, token: string): Promise<FinnhubQuote> => {
    if (!token) throw new Error('API Key missing');
    const params = new URLSearchParams({ symbol, token });
    const response = await fetch(`${BASE_URL}/quote?${params.toString()}`);
    if (!response.ok) throw new Error(`Failed to fetch quote for ${symbol}`);
    return response.json();
};

export const searchStocks = async (query: string, token: string): Promise<FinnhubSearchResponse> => {
    if (!token) throw new Error('API Key missing');
    const params = new URLSearchParams({ q: query, token });
    const response = await fetch(`${BASE_URL}/search?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to search stocks');
    return response.json();
};

export const fetchCandles = async (
    symbol: string,
    resolution: string,
    from: number,
    to: number
): Promise<FinnhubCandleResponse> => {
    // Finnhub's stock/candle endpoint requires a paid subscription for most tickers
    // Fallback to a free public Yahoo Finance API proxy for demonstration
    // We map the YF response to match our internal FinnhubCandleResponse format so the rest of the app doesn't break.
    try {
        const yfResolution = resolution === '60' ? '1h' : (resolution === 'W' ? '1wk' : '1d');
        const params = new URLSearchParams({
            period1: from.toString(),
            period2: to.toString(),
            interval: yfResolution
        });
        const encodedSymbol = encodeURIComponent(symbol);
        const response = await fetch(
            `http://localhost:3001/api/yahoo-finance/${encodedSymbol}?${params.toString()}`
        );

        if (!response.ok) throw new Error(`Yahoo Finance API returned ${response.status}`);
        const data = await response.json();
        const result = data.chart.result?.[0];

        if (!result || !result.timestamp) {
            return { c: [], h: [], l: [], o: [], s: 'no_data', t: [], v: [] };
        }

        const quote = result.indicators.quote[0];

        return {
            c: quote.close || [],
            h: quote.high || [],
            l: quote.low || [],
            o: quote.open || [],
            s: 'ok',
            t: result.timestamp,
            v: quote.volume || []
        };

    } catch (err) {
        console.error('Fallback Fetch Failed', err);
        throw err;
    }
};

// Helper to convert candle data to our app's internal format, including MA20 calculation
export const mapCandlesToDataPoints = (data: FinnhubCandleResponse): StockDataPoint[] => {
    if (data.s !== 'ok' || !data.t || data.t.length === 0) return [];

    const points: StockDataPoint[] = [];

    // Yahoo finance data might have nulls in the arrays, so we need to filter them out carefully
    data.t.forEach((timestamp, index) => {
        const closePrice = data.c[index];
        if (closePrice !== null && closePrice !== undefined) {
            points.push({
                date: new Date(timestamp * 1000).toISOString().split('T')[0],
                price: closePrice,
                ma20: null,
            });
        }
    });

    // Calculate 20-period moving average
    for (let i = 0; i < points.length; i++) {
        if (i >= 19) {
            let sum = 0;
            for (let j = 0; j < 20; j++) {
                sum += points[i - j].price;
            }
            points[i].ma20 = sum / 20;
        }
    }

    return points;
};

import { GoogleGenAI } from '@google/genai';

export const generateAIAnalysis = async (
    symbol: string,
    history: { date: string, price: number }[],
    quote: FinnhubQuote,
    apiKey: string,
    model: string = 'gemini-2.5-flash'
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey });

        const historyString = history.map(h => `${h.date}: $${h.price.toFixed(2)}`).join('\n');

        const prompt = `You are a strict, concise financial charting assistant.
Analyze the following recent price data for ${symbol}.
Current Price: $${quote.c}
Today's Change: ${quote.d > 0 ? '+' : ''}${quote.d} (${quote.dp}%)
Recent Closing Prices:
${historyString}

Provide a 2-3 sentence technical analysis summary. Do not give financial advice. Focus on trend direction, momentum, and recent price action relative to the given history.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text || 'No analysis could be generated at this time.';
    } catch (error) {
        console.error('Error generating AI analysis:', error);
        throw new Error('Failed to generate AI analysis. Please check your API key and try again.');
    }
};
