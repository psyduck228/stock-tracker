import React from 'react';
import { StoreProvider, useStoreContext } from './context/StoreContext';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import StockChart from './components/StockChart';
import ApiKeyModal from './components/ApiKeyModal';
import './index.css';

const AppContent: React.FC = () => {
  const { apiKey, setApiKey } = useStoreContext();

  return (
    <div className="layout-grid">
      {!apiKey && <ApiKeyModal onSave={setApiKey} />}
      <Sidebar />
      <main className="main-content">
        <DashboardHeader />
        <StockChart />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;
