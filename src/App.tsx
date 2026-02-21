import { StoreProvider } from './context/StoreContext';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import StockChart from './components/StockChart';
import './index.css';

function AppContent() {
  return (
    <div className="layout-grid">
      <Sidebar />
      <div className="main-content">
        <DashboardHeader />
        <StockChart />
      </div>
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
