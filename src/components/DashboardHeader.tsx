import React from 'react';
import { useStoreContext } from '../context/StoreContext';
import './DashboardHeader.css';

const DashboardHeader: React.FC = () => {
    const { stats } = useStoreContext();

    return (
        <div className="dashboard-header-container">
            <h1 className="dashboard-title">Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card glass-panel">
                    <div className="stat-header">
                        <span className="stat-label">Watchlist Value</span>
                        <span className="stat-icon">$</span>
                    </div>
                    <div className="stat-value">${stats.totalValue.toFixed(2)}</div>
                    <div className={`stat-change ${stats.valueChange >= 0 ? 'text-gain' : 'text-loss'}`}>
                        {stats.valueChange >= 0 ? '↑' : '↓'}
                        {Math.abs(stats.valueChangePercent).toFixed(2)}% Today
                    </div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-header">
                        <span className="stat-label">Tracked Stocks</span>
                        <span className="stat-icon">#</span>
                    </div>
                    <div className="stat-value">{stats.trackedCount}</div>
                    <div className="stat-change text-muted">In your personalized watchlist</div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-header">
                        <span className="stat-label">Top Gainer</span>
                        <span className="stat-icon text-gain">+</span>
                    </div>
                    <div className="stat-value">{stats.topGainer?.symbol || '-'}</div>
                    <div className="stat-change text-gain">
                        ↑ {stats.topGainer?.changePercent.toFixed(2) || 0}%
                    </div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-header">
                        <span className="stat-label">Top Loser</span>
                        <span className="stat-icon text-loss">-</span>
                    </div>
                    <div className="stat-value">{stats.topLoser?.symbol || '-'}</div>
                    <div className="stat-change text-loss">
                        ↓ {Math.abs(stats.topLoser?.changePercent || 0).toFixed(2)}%
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
