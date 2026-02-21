export interface StockDataPoint {
    date: string;
    price: number;
    ma20: number | null;
}

export interface StockSummary {
    symbol: string;
    name: string;
    currentPrice: number;
    changeValue: number;
    changePercent: number;
    history: StockDataPoint[];
}

export type TimeRange = '1W' | '1M' | '6M' | '1Y' | 'All';

export interface WatchlistStats {
    totalValue: number;
    valueChange: number;
    valueChangePercent: number;
    trackedCount: number;
    topGainer: StockSummary | null;
    topLoser: StockSummary | null;
}
