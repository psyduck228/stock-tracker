import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Line,
    ComposedChart
} from 'recharts';
import { useStoreContext } from '../context/StoreContext';
import type { TimeRange } from '../types';
import './StockChart.css';

const RANGES: { label: TimeRange; days: number }[] = [
    { label: '1W', days: 7 },
    { label: '1M', days: 30 },
    { label: '6M', days: 180 },
    { label: '1Y', days: 365 },
    { label: 'All', days: 1000 }, // Mocking 'All' as 1000 days
];

const StockChart: React.FC = () => {
    const { activeStock, loadHistoryForActiveStock, isChartLoading } = useStoreContext();
    const [showMA, setShowMA] = useState(false);
    const [timeRange, setTimeRange] = useState<TimeRange>('1Y');

    // Fetch new historical data when symbol or time range changes
    useEffect(() => {
        if (activeStock) {
            const days = RANGES.find(r => r.label === timeRange)?.days || 365;
            loadHistoryForActiveStock(days);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStock?.symbol, timeRange, loadHistoryForActiveStock]);

    const filteredData = activeStock?.history || [];

    const formatDate = (dateStr: unknown) => {
        if (!dateStr || typeof dateStr !== 'string') return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatCurrency = (val: number) => `$${val}`;

    if (!activeStock) return null;

    return (
        <div className="chart-container glass-panel">
            <div className="chart-header">
                <div className="chart-title">
                    <h2>{activeStock.name} ({activeStock.symbol})</h2>
                    <span className="chart-subtitle">Interactive historical price chart</span>
                </div>

                <div className="chart-controls">
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={showMA}
                            onChange={(e) => setShowMA(e.target.checked)}
                        />
                        <span className="slider round"></span>
                        <span className="toggle-label">Show 20-Day MA</span>
                    </label>

                    <div className="time-filters">
                        {RANGES.map((range) => (
                            <button
                                key={range.label}
                                className={`filter-btn ${timeRange === range.label ? 'active' : ''}`}
                                onClick={() => setTimeRange(range.label)}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="chart-wrapper">
                {isChartLoading ? (
                    <div className="chart-loading-overlay">
                        <Loader2 className="search-spinner" size={32} />
                        <span>Fetching historical data...</span>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={filteredData}
                            margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-teal)" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="var(--color-teal)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                minTickGap={30}
                                stroke="var(--color-text-muted)"
                                tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                tickFormatter={formatCurrency}
                                stroke="var(--color-text-muted)"
                                tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                orientation="right"
                                dx={10}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(30, 33, 36, 0.9)',
                                    borderColor: 'var(--color-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-white)'
                                }}
                                itemStyle={{ color: 'var(--color-teal)' }}
                                labelFormatter={formatDate}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="var(--color-teal)"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                                name={activeStock.symbol}
                            />
                            {showMA && (
                                <Line
                                    type="monotone"
                                    dataKey="ma20"
                                    stroke="var(--color-gain)"
                                    strokeWidth={2}
                                    dot={false}
                                    name="MA(20)"
                                />
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default StockChart;
