import React, { useEffect } from 'react';
import { X, Info, TrendingUp, GripVertical, AlertTriangle } from 'lucide-react';
import './InstructionsModal.css';

interface InstructionsModalProps {
    onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content instructions-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-group">
                        <Info className="text-teal" size={24} />
                        <h2>How to Use Stock Trend Tracker</h2>
                    </div>
                    <button className="close-btn" onClick={onClose} aria-label="Close">
                        <X size={24} />
                    </button>
                </div>

                <div className="instructions-body">
                    <section className="instruction-section">
                        <h3><TrendingUp size={18} className="section-icon" /> Dashboard & Quick Stats</h3>
                        <p>
                            The dashboard at the top of the main screen gives you a high-level overview of your tracked stocks.
                            It shows the total estimated value (based on current price), the daily gain/loss, and highlights
                            the top performing and underperforming stocks for the day.
                        </p>
                    </section>

                    <section className="instruction-section">
                        <h3><GripVertical size={18} className="section-icon" /> Managing Your Watchlist</h3>
                        <p>
                            The sidebar manages your watchlist. Use the search bar to find and add new stocks (minimum 2 characters).
                        </p>
                        <ul>
                            <li><strong>Reorder:</strong> Click and drag the <GripVertical size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} /> icon next to any stock to rearrange your list.</li>
                            <li><strong>Sort A-Z:</strong> Click the sort button in the Watchlist header to alphabetize your list.</li>
                            <li><strong>Select:</strong> Click anywhere else on a stock item to view its historical chart.</li>
                            <li><strong>Remove:</strong> Hover over a stock and click the trash icon to remove it.</li>
                        </ul>
                    </section>

                    <section className="instruction-section">
                        <h3>📈 Interactive Chart</h3>
                        <p>
                            The main visualizer displays historical data for the currently selected stock.
                        </p>
                        <ul>
                            <li><strong>Time Ranges:</strong> Select between 1 Week, 1 Month, 6 Months, 1 Year, or All available data.</li>
                            <li><strong>Moving Average:</strong> Toggle the 'Show 20-Day MA' switch to overlay a 20-day Simple Moving Average trendline.</li>
                            <li><strong>Hover:</strong> Hover over the chart area to see specific prices and dates.</li>
                        </ul>
                    </section>

                    <section className="instruction-section">
                        <h3><AlertTriangle size={18} className="section-icon text-teal" /> AI Trend Analysis</h3>
                        <p>
                            Click the <strong>AI Trend Analysis</strong> button at the bottom of the sidebar to get instant, AI-generated insights
                            on the selected stock's recent performance. You will need to provide a Google Gemini API Key the first time.
                            <em>(Note: AI analysis is generated text based on past data and does not constitute financial advice)</em>.
                        </p>
                    </section>
                </div>

                <div className="modal-footer">
                    <button className="save-btn instructions-ok-btn" onClick={onClose}>Got it!</button>
                </div>
            </div>
        </div>
    );
};

export default InstructionsModal;
