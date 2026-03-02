import React, { useState } from 'react';
import { KeyRound, ShieldAlert } from 'lucide-react';
import './ApiKeyModal.css';

interface ApiKeyModalProps {
    onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) {
            setError('Please enter a valid API key.');
            return;
        }
        onSave(inputValue.trim());
    };

    return (
        <div className="api-modal-overlay">
            <div className="api-modal-content glass-panel">
                <div className="api-modal-header">
                    <div className="api-modal-icon-wrapper">
                        <KeyRound size={28} className="text-teal" />
                    </div>
                    <h2>Welcome to TrendTrack</h2>
                    <p>Please enter your Finnhub API Key to access real-time market data.</p>
                </div>

                <form onSubmit={handleSubmit} className="api-modal-form">
                    <div className="input-group">
                        <input
                            type="password"
                            autoComplete="off"
                            placeholder="Paste your API key here..."
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                setError('');
                            }}
                            className={`api-input ${error ? 'error' : ''}`}
                            autoFocus
                        />
                        {error && <span className="api-error-text">{error}</span>}
                    </div>

                    <button type="submit" className="api-submit-btn">Continue to Dashboard</button>
                </form>

                <div className="api-modal-footer">
                    <ShieldAlert size={16} className="text-muted" />
                    <p>
                        Don't have a key? Get a free one at <a href="https://finnhub.io/" target="_blank" rel="noopener noreferrer">finnhub.io</a>.
                        Your key is strictly stored locally in your browser.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
