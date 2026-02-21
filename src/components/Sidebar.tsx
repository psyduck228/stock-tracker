import React, { useState } from 'react';
import { Search, Plus, TrendingUp, AlertTriangle } from 'lucide-react';
import { useStoreContext } from '../context/StoreContext';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    const { watchlist, activeSymbol, setActiveSymbol } = useStoreContext();
    const [showAI, setShowAI] = useState(false);

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <TrendingUp className="logo-icon text-teal" size={24} />
                <h2 className="logo-text">TrendTrack</h2>
            </div>

            <div className="search-bar">
                <div className="search-input-wrapper">
                    <Search size={16} className="search-icon" />
                    <input type="text" placeholder="Add stock by symbol or name" className="search-input" />
                </div>
                <button className="add-btn">
                    <Plus size={16} />
                </button>
            </div>

            <div className="watchlist">
                {watchlist.map((stock) => {
                    const isPositive = stock.changeValue >= 0;
                    return (
                        <div
                            key={stock.symbol}
                            className={`watchlist-item ${activeSymbol === stock.symbol ? 'active' : ''}`}
                            onClick={() => setActiveSymbol(stock.symbol)}
                        >
                            <div className="stock-info">
                                <span className="stock-symbol">{stock.symbol}</span>
                                <span className="stock-price-muted">${stock.currentPrice.toFixed(2)}</span>
                            </div>
                            <div className="stock-stats">
                                <span className={`stock-change-pct ${isPositive ? 'text-gain' : 'text-loss'}`}>
                                    {isPositive ? '↑' : '↓'} {Math.abs(stock.changePercent).toFixed(2)}%
                                </span>
                                <span className={`stock-change-val ${isPositive ? 'text-gain' : 'text-loss'}`}>
                                    {isPositive ? '+' : '-'}{Math.abs(stock.changeValue).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    );
                })}
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
                        <p>
                            Based on recent moving average crossovers and volume profile, {activeSymbol} shows signs of a
                            short-term consolidation phase. Momentum indicators suggest cautious optimism.
                        </p>
                        <div className="ai-warning">
                            <strong>WARNING:</strong> This is a mock AI analysis. Do not use this as actual financial advice or for investment decisions.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
