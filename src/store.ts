import { useState, useMemo, useEffect, useCallback } from 'react';
import type { StockSummary, WatchlistStats } from './types';
import { fetchQuote, fetchCandles, mapCandlesToDataPoints, generateAIAnalysis } from './services/api';

const loadWatchlistSymbols = (): string[] => {
    const cached = localStorage.getItem('tracked_symbols');
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
            console.error('Failed to parse cached watchlist symbols', e);
        }
    }
    return ['AAPL', 'GOOGL', 'MSFT', 'AMZN'];
};
export const useStore = () => {
    const [apiKey, setApiKeyState] = useState<string | null>(() => {
        return localStorage.getItem('finnhub_api_key');
    });
    const [aiApiKey, setAiApiKeyState] = useState<string | null>(() => {
        return localStorage.getItem('ai_api_key');
    });
    const [aiModel, setAiModelState] = useState<string>(() => {
        return localStorage.getItem('ai_model') || 'gemini-2.5-flash';
    });
    const [aiAnalysisText, setAiAnalysisText] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [watchlist, setWatchlist] = useState<StockSummary[]>([]);
    const [activeSymbol, setActiveSymbol] = useState<string>('AAPL');
    const [isInitializing, setIsInitializing] = useState(true);
    const [isChartLoading, setIsChartLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setApiKey = useCallback((key: string) => {
        localStorage.setItem('finnhub_api_key', key);
        setApiKeyState(key);
        setIsInitializing(true); // Retrigger initial load
    }, []);

    const setAiApiKey = useCallback((key: string) => {
        if (!key) {
            localStorage.removeItem('ai_api_key');
        } else {
            localStorage.setItem('ai_api_key', key);
        }
        setAiApiKeyState(key || null);
    }, []);

    const setAiModel = useCallback((model: string) => {
        localStorage.setItem('ai_model', model);
        setAiModelState(model);
    }, []);
    // Load initial quotes for the watchlist once API key is present
    useEffect(() => {
        if (!apiKey) {
            setIsInitializing(false);
            return;
        }

        let mounted = true;
        const loadInitialWatchlist = async () => {
            try {
                const symbolsToLoad = loadWatchlistSymbols();
                const promises = symbolsToLoad.map(async (symbol) => {
                    try {
                        const quote = await fetchQuote(symbol, apiKey);
                        return {
                            symbol,
                            name: symbol, // Finnhub quote doesn't provide name, simplified for now
                            currentPrice: quote.c,
                            changeValue: quote.d,
                            changePercent: quote.dp,
                            history: [], // History loaded separately when active
                        } as StockSummary;
                    } catch (err) {
                        console.error(`Failed to load initial quote for ${symbol}`, err);
                        return null;
                    }
                });

                const resultsRaw = await Promise.all(promises);
                const results = resultsRaw.filter((s): s is StockSummary => s !== null);
                if (mounted) {
                    // Update active symbol to first available on load
                    if (results.length > 0) setActiveSymbol(results[0].symbol);
                    setWatchlist(results);
                    setIsInitializing(false);
                }
            } catch (err) {
                if (mounted) {
                    const message = err instanceof Error ? err.message : 'Unknown error';
                    setError(message || 'Failed to load initial watchlist');
                    setIsInitializing(false);
                }
            }
        };

        loadInitialWatchlist();

        return () => {
            mounted = false;
        };
    }, [apiKey]);

    const addStockToWatchlist = useCallback(async (symbol: string, name: string) => {
        if (!apiKey) {
            setError('Please configure your API key first');
            return;
        }

        try {
            if (watchlist.find(s => s.symbol === symbol)) return; // Already exists

            const quote = await fetchQuote(symbol, apiKey);
            const newStock: StockSummary = {
                symbol,
                name,
                currentPrice: quote.c,
                changeValue: quote.d,
                changePercent: quote.dp,
                history: [],
            };

            setWatchlist(prev => {
                const updated = [...prev, newStock];
                localStorage.setItem('tracked_symbols', JSON.stringify(updated.map(s => s.symbol)));
                return updated;
            });
            setActiveSymbol(symbol);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setError(`Failed to add ${symbol}: ${message}`);
        }
    }, [watchlist, apiKey]);

    const removeStockFromWatchlist = useCallback((symbolToRemove: string) => {
        setWatchlist(prev => {
            const updated = prev.filter(s => s.symbol !== symbolToRemove);
            localStorage.setItem('tracked_symbols', JSON.stringify(updated.map(s => s.symbol)));

            // If we removed the active symbol, switch to another valid one
            if (activeSymbol === symbolToRemove) {
                setActiveSymbol(updated.length > 0 ? updated[0].symbol : '');

                // Clear out the AI analysis since the context changed
                setAiAnalysisText(null);
            }

            return updated;
        });
    }, [activeSymbol]);

    const reorderWatchlist = useCallback((oldIndex: number, newIndex: number) => {
        setWatchlist(prev => {
            if (oldIndex < 0 || oldIndex >= prev.length || newIndex < 0 || newIndex >= prev.length) return prev;
            const updated = [...prev];
            const [moved] = updated.splice(oldIndex, 1);
            updated.splice(newIndex, 0, moved);
            localStorage.setItem('tracked_symbols', JSON.stringify(updated.map(s => s.symbol)));
            return updated;
        });
    }, []);

    const sortWatchlistByName = useCallback(() => {
        setWatchlist(prev => {
            const updated = [...prev].sort((a, b) => a.symbol.localeCompare(b.symbol));
            localStorage.setItem('tracked_symbols', JSON.stringify(updated.map(s => s.symbol)));
            return updated;
        });
    }, []);

    // Load History for the currently active stock
    const loadHistoryForActiveStock = useCallback(async (days: number) => {
        if (!activeSymbol || isInitializing) return;

        setIsChartLoading(true);
        try {
            // Finnhub expects UNIX timestamps in seconds
            const toIndex = Math.floor(Date.now() / 1000);
            const fromIndex = toIndex - (days * 24 * 60 * 60);

            // Determine resolution based on days requested to fit Finnhub limits/granularity
            let resolution = 'D';
            if (days <= 7) resolution = '60'; // 60 min intervals for 1 week
            else if (days <= 30) resolution = 'D'; // Daily for 1 month
            else resolution = 'W'; // Weekly for longer periods

            const candleData = await fetchCandles(activeSymbol, resolution, fromIndex, toIndex);
            console.log('Fetched candles:', candleData); // Debug log
            const historyPoints = mapCandlesToDataPoints(candleData);

            setWatchlist(prev => prev.map(stock => {
                if (stock.symbol === activeSymbol) {
                    return { ...stock, history: historyPoints };
                }
                return stock;
            }));
        } catch (err) {
            console.error('Fetch history failed', err);
            const message = err instanceof Error ? err.message : String(err);
            setError(`Failed to load history for ${activeSymbol}: ${message}`);
        } finally {
            setIsChartLoading(false);
        }
    }, [activeSymbol, isInitializing]);

    const fetchAIAnalysis = useCallback(async () => {
        const activeStock = watchlist.find((s) => s.symbol === activeSymbol);
        if (!aiApiKey || !activeStock || !activeStock.history.length) return;

        setIsAnalyzing(true);
        // Take the last 10 days of history to limit context window
        const recentHistory = activeStock.history.slice(-10);
        const quote = {
            c: activeStock.currentPrice,
            d: activeStock.changeValue,
            dp: activeStock.changePercent,
            h: 0, l: 0, o: 0, pc: 0
        };

        try {
            const result = await generateAIAnalysis(activeSymbol, recentHistory, quote, aiApiKey, aiModel);
            setAiAnalysisText(result);
        } catch (err) {
            console.error('AI Analysis failed', err);
            const message = err instanceof Error ? err.message : String(err);
            setAiAnalysisText(`Analysis Error: ${message}`);
        } finally {
            setIsAnalyzing(false);
        }
    }, [activeSymbol, watchlist, aiApiKey, aiModel]);

    const activeStock = useMemo(() => {
        return watchlist.find((s) => s.symbol === activeSymbol) || null;
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
        isInitializing,
        isChartLoading,
        error,
        addStockToWatchlist,
        removeStockFromWatchlist,
        reorderWatchlist,
        sortWatchlistByName,
        loadHistoryForActiveStock,
        apiKey,
        setApiKey,
        aiApiKey,
        setAiApiKey,
        aiModel,
        setAiModel,
        aiAnalysisText,
        setAiAnalysisText,
        isAnalyzing,
        fetchAIAnalysis
    };
};

export type StoreType = ReturnType<typeof useStore>;
