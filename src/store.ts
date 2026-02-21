import { useState, useMemo } from 'react';
import { getInitialWatchlist } from './services/mockData';
import type { StockSummary, WatchlistStats } from './types';

// Simple lightweight store using a custom hook for React context
export const useStore = () => {
    const [watchlist, setWatchlist] = useState<StockSummary[]>(getInitialWatchlist());
    const [activeSymbol, setActiveSymbol] = useState<string>('AAPL');

    const activeStock = useMemo(() => {
        return watchlist.find((s) => s.symbol === activeSymbol) || watchlist[0];
    }, [watchlist, activeSymbol]);

    const stats: WatchlistStats = useMemo(() => {
        let totalValue = 0;
        let valueChange = 0;
        let topGainer: StockSummary | null = null;
        let topLoser: StockSummary | null = null;

        watchlist.forEach((stock) => {
            totalValue += stock.currentPrice;
            valueChange += stock.changeValue;

            if (!topGainer || stock.changePercent > topGainer.changePercent) {
                topGainer = stock;
            }
            if (!topLoser || stock.changePercent < topLoser.changePercent) {
                topLoser = stock;
            }
        });

        const valueChangePercent = totalValue === 0 ? 0 : (valueChange / (totalValue - valueChange)) * 100;

        return {
            totalValue,
            valueChange,
            valueChangePercent,
            trackedCount: watchlist.length,
            topGainer,
            topLoser,
        };
    }, [watchlist]);

    return {
        watchlist,
        setWatchlist,
        activeSymbol,
        setActiveSymbol,
        activeStock,
        stats,
    };
};

export type StoreType = ReturnType<typeof useStore>;
