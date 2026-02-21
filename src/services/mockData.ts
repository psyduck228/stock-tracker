import type { StockDataPoint, StockSummary } from '../types';

const generateMockHistory = (startPrice: number, days: number): StockDataPoint[] => {
    const history: StockDataPoint[] = [];
    let currentPrice = startPrice;
    const now = new Date();

    // Generate data looking backwards
    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Add random walk
        const change = (Math.random() - 0.48) * (startPrice * 0.02);
        currentPrice = Math.max(currentPrice + change, 1);

        history.push({
            date: date.toISOString().split('T')[0],
            price: currentPrice,
            ma20: null
        });
    }

    // Calculate MA20
    for (let i = 0; i < history.length; i++) {
        if (i >= 19) {
            let sum = 0;
            for (let j = 0; j < 20; j++) {
                sum += history[i - j].price;
            }
            history[i].ma20 = sum / 20;
        }
    }

    return history;
};

export const MOCK_STOCKS: Record<string, Omit<StockSummary, 'history'>> = {
    AAPL: {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        currentPrice: 188.91,
        changeValue: -0.45,
        changePercent: -0.24,
    },
    GOOGL: {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        currentPrice: 163.63,
        changeValue: 0.47,
        changePercent: 0.29,
    },
    MSFT: {
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        currentPrice: 301.04,
        changeValue: 1.99,
        changePercent: 0.67,
    },
    AMZN: {
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        currentPrice: 124.53,
        changeValue: -2.21,
        changePercent: -1.74,
    },
};

// Cache so it doesn't shift on every re-render
const histories: Record<string, StockDataPoint[]> = {};

export const getStockData = (symbol: string, days: number = 365): StockSummary => {
    const base = MOCK_STOCKS[symbol];
    if (!base) throw new Error('Stock not found');

    if (!histories[symbol]) {
        histories[symbol] = generateMockHistory(base.currentPrice * 0.8, days);
        // ensure the last price matches base.currentPrice
        const lastIdx = histories[symbol].length - 1;
        histories[symbol][lastIdx].price = base.currentPrice;
    }

    return {
        ...base,
        history: histories[symbol]
    };
};

export const getInitialWatchlist = (): StockSummary[] => {
    return [
        getStockData('AAPL'),
        getStockData('GOOGL'),
        getStockData('MSFT'),
        getStockData('AMZN')
    ];
};
