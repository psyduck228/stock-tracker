import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, AlertTriangle, Loader2, Trash2, ArrowDownAZ, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStoreContext } from '../context/StoreContext';
import { searchStocks } from '../services/api';
import type { FinnhubSearchResponse } from '../services/api';
import type { StockSummary } from '../types';
import './Sidebar.css';

interface SortableWatchlistItemProps {
    stock: StockSummary;
    activeSymbol: string;
    setActiveSymbol: (symbol: string) => void;
    removeStockFromWatchlist: (symbol: string) => void;
}

const SortableWatchlistItem: React.FC<SortableWatchlistItemProps> = ({ stock, activeSymbol, setActiveSymbol, removeStockFromWatchlist }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: stock.symbol });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
        opacity: isDragging ? 0.8 : 1,
        position: 'relative' as const,
    };

    const isPositive = stock.changeValue >= 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`watchlist-item ${activeSymbol === stock.symbol ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
            onClick={() => setActiveSymbol(stock.symbol)}
        >
            <div className="stock-left">
                <div
                    className="drag-handle"
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical size={14} className="drag-icon" />
                </div>
                <div className="stock-info">
                    <span className="stock-symbol">{stock.symbol}</span>
                    <span className="stock-price-muted">${stock.currentPrice.toFixed(2)}</span>
                </div>
            </div>
            <div className="stock-stats">
                <span className={`stock-change-pct ${isPositive ? 'text-gain' : 'text-loss'}`}>
                    {isPositive ? '↑' : '↓'} {Math.abs(stock.changePercent || 0).toFixed(2)}%
                </span>
                <div className="stock-actions">
                    <span className={`stock-change-val ${isPositive ? 'text-gain' : 'text-loss'}`}>
                        {isPositive ? '+' : '-'}{Math.abs(stock.changeValue || 0).toFixed(2)}
                    </span>
                    <button
                        className="remove-stock-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeStockFromWatchlist(stock.symbol);
                        }}
                        title="Remove from Watchlist"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const Sidebar: React.FC = () => {
    const {
        watchlist,
        activeSymbol,
        setActiveSymbol,
        addStockToWatchlist,
        removeStockFromWatchlist,
        reorderWatchlist,
        sortWatchlistByName,
        isInitializing,
        apiKey,
        aiApiKey,
        setAiApiKey,
        aiModel,
        setAiModel,
        aiAnalysisText,
        setAiAnalysisText,
        isAnalyzing,
        fetchAIAnalysis
    } = useStoreContext();
    const [showAI, setShowAI] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<FinnhubSearchResponse['result']>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = watchlist.findIndex((s) => s.symbol === active.id);
            const newIndex = watchlist.findIndex((s) => s.symbol === over.id);
            reorderWatchlist(oldIndex, newIndex);
        }
    };

    // Clear old analysis when symbol changes
    useEffect(() => {
        setAiAnalysisText(null);
    }, [activeSymbol, setAiAnalysisText]);

    // Debounce search
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (searchQuery.trim().length < 2 || !apiKey) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        let active = true;

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await searchStocks(searchQuery, apiKey);
                if (!active) return;

                // Filter out non-equity results to keep it cleaner
                const equities = response.result.filter(r => r.type === 'Common Stock' || r.type === '');
                setSearchResults(equities.slice(0, 5));
            } catch (err) {
                console.error('Search failed', err);
            } finally {
                if (active) setIsSearching(false);
            }
        }, 500); // 500ms debounce

        return () => {
            active = false;
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchQuery, apiKey]);

    const handleAddStock = async (symbol: string, name: string) => {
        setSearchQuery('');
        setSearchResults([]);
        await addStockToWatchlist(symbol, name);
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <TrendingUp className="logo-icon text-teal" size={24} />
                <h2 className="logo-text">Stock Trend Tracker</h2>
            </div>

            <div className="search-bar">
                <div className="search-input-wrapper">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Add stock by symbol or name"
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSearching && <Loader2 size={16} className="search-spinner" />}
                </div>

                {searchResults.length > 0 && (
                    <div className="search-results-dropdown glass-panel">
                        {searchResults.map((result) => (
                            <div
                                key={result.symbol}
                                className="search-result-item"
                                onClick={() => handleAddStock(result.symbol, result.description)}
                            >
                                <div className="result-symbol">{result.symbol}</div>
                                <div className="result-name">{result.description}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="watchlist-section">
                <div className="watchlist-header">
                    <h3>Watchlist</h3>
                    <button className="sort-btn" onClick={sortWatchlistByName} title="Sort A-Z">
                        <ArrowDownAZ size={16} />
                    </button>
                </div>
                <div className="watchlist">
                    {isInitializing ? (
                        <div className="loading-state">
                            <Loader2 size={24} className="loading-spinner text-teal" />
                            <span>Loading live quotes...</span>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={watchlist.map(s => s.symbol)}
                                strategy={verticalListSortingStrategy}
                            >
                                {watchlist.map((stock) => (
                                    <SortableWatchlistItem
                                        key={stock.symbol}
                                        stock={stock}
                                        activeSymbol={activeSymbol}
                                        setActiveSymbol={setActiveSymbol}
                                        removeStockFromWatchlist={removeStockFromWatchlist}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>

            <div className="sidebar-footer">
                <button className="ai-btn" onClick={() => setShowAI(!showAI)}>
                    <AlertTriangle size={18} className="ai-icon" />
                    <div className="ai-btn-text">
                        <span>AI Trend Analysis</span>
                        <small>Get AI-powered insights for the selected stock.</small>
                    </div>
                </button>
            </div>

            {showAI && (
                <div className="ai-panel glass-panel">
                    <div className="ai-panel-header">
                        <h4>AI Analysis: {activeSymbol}</h4>
                        <button className="close-btn" onClick={() => setShowAI(false)}>&times;</button>
                    </div>
                    <div className="ai-panel-content">
                        {!aiApiKey ? (
                            <div className="ai-api-key-form">
                                <p className="ai-api-description">
                                    Enter your AI Provider API Key to unlock trend insights.
                                </p>
                                <p className="ai-api-helper">
                                    Don't have a key? Get one from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google Gemini</a>.
                                </p>
                                <input
                                    type="text"
                                    placeholder="sk-proj-..."
                                    className="ai-api-input"
                                    id="aiApiKeyInput"
                                />
                                <button
                                    className="ai-api-submit"
                                    onClick={() => {
                                        const input = document.getElementById('aiApiKeyInput') as HTMLInputElement;
                                        if (input && input.value.trim()) {
                                            setAiApiKey(input.value.trim());
                                        }
                                    }}
                                >
                                    Save Key
                                </button>
                            </div>
                        ) : (
                            <div className="ai-analysis-container">
                                <select
                                    className="ai-model-select"
                                    value={aiModel}
                                    onChange={(e) => setAiModel(e.target.value)}
                                    disabled={isAnalyzing}
                                >
                                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                    <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Exp</option>
                                </select>

                                {!aiAnalysisText && !isAnalyzing ? (
                                    <button className="ai-analyze-btn" onClick={fetchAIAnalysis}>
                                        Analyze {activeSymbol}
                                    </button>
                                ) : isAnalyzing ? (
                                    <div className="ai-analyzing-state">
                                        <Loader2 size={24} className="loading-spinner text-teal" />
                                        <span>Analyzing trend patterns...</span>
                                    </div>
                                ) : (
                                    <div className="ai-analysis-result">
                                        <p>{aiAnalysisText}</p>
                                        <button className="ai-analyze-btn secondary" onClick={fetchAIAnalysis}>
                                            Regenerate Analysis
                                        </button>
                                    </div>
                                )}

                                <div className="ai-warning">
                                    <strong>WARNING:</strong> This analysis is AI-generated. Do not use this as actual financial advice or for investment decisions.
                                </div>
                                <button className="ai-api-reset" onClick={() => setAiApiKey('')}>Reset API Key</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
