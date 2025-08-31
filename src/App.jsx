import { useState } from 'react';
import './App.css';
import RegionalAnalysis from './components/RegionalAnalysis';
import CountryExplorer from './components/CountryExplorer';
import Dashboard from './components/Dashboard';
import BitsLogo from './components/BitsLogo';
import HappinessComparison from './components/HappinessComparison';
import IndiaDashboard from './components/IndianDashboard';
import RegionalVisualization from './components/RegionalVisualization';


function App() {
  const [page, setPage] = useState('dashboard');
  const [selectedRegion, setSelectedRegion] = useState(null);

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    console.log('Selected region:', region);
  };

  let mainContent;
  switch (page) {
    case 'dashboard':
      mainContent = <Dashboard setPage={setPage} />;
      break;
    case 'country-explorer':
      mainContent = <CountryExplorer />;
      break;
    case 'regional-view':
      mainContent = <RegionalAnalysis onRegionSelect={handleRegionSelect} />;
      break;
    case 'regional-comparison':
      mainContent = <RegionalVisualization />;
      break;
    case 'happiness':
      mainContent = <HappinessComparison />;
      break;
    case 'india-dashboard':
      mainContent = <IndiaDashboard />;
      break;
    default:
      mainContent = null;
  }


  return (
    <div style={{ height: '100%', width: '100vw', maxWidth: '100vw', minWidth: 0, background: '#e6f2f8', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div className="header-container" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100vw', maxWidth: '100vw', padding: '0.7rem 0.3rem 0.7rem 0.3rem', gap: '0.5rem', boxSizing: 'border-box', flexWrap: 'wrap', minWidth: 0 }}>
        <div className="logo-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 60, maxWidth: 100, flexShrink: 1 }}>
          <BitsLogo />
        </div>
        <div className="nav-container" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '0.5rem', minWidth: 0, maxWidth: '100vw', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button
            className="nav-button"
            style={{ minWidth: 60, padding: '0.5rem 0.7rem', borderRadius: 8, border: '1.5px solid #0097a7', background: page === 'dashboard' ? '#0097a7' : '#fff', color: page === 'dashboard' ? '#fff' : '#005662', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001', flexShrink: 1 }}
            onClick={() => setPage('dashboard')}
          >
            Overview
          </button>
          <button
            className="nav-button"
            style={{ minWidth: 60, padding: '0.5rem 0.7rem', borderRadius: 8, border: '1.5px solid #0097a7', background: page === 'country-explorer' ? '#0097a7' : '#fff', color: page === 'country-explorer' ? '#fff' : '#005662', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001', flexShrink: 1 }}
            onClick={() => setPage('country-explorer')}
          >
            Country Explorer
          </button>
          <button 
            className="nav-button"
            style={{ minWidth: 60, padding: '0.5rem 0.7rem', borderRadius: 8, border: '1.5px solid #0097a7', background: page === 'happiness' ? '#0097a7' : '#fff', color: page === 'happiness' ? '#fff' : '#005662', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001', flexShrink: 1 }}
            onClick={() => setPage('happiness')}
          >
            Happiness
          </button>
          <button 
            className="nav-button"
            style={{ minWidth: 60, padding: '0.5rem 0.7rem', borderRadius: 8, border: '1.5px solid #0097a7', background: page === 'regional-view' ? '#0097a7' : '#fff', color: page === 'regional-view' ? '#fff' : '#005662', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001', flexShrink: 1 }}
            onClick={() => setPage('regional-view')}
          >
            Regional Analysis
          </button>
          <button 
            className="nav-button"
            style={{ minWidth: 60, padding: '0.5rem 0.7rem', borderRadius: 8, border: '1.5px solid #0097a7', background: page === 'regional-comparison' ? '#0097a7' : '#fff', color: page === 'regional-comparison' ? '#fff' : '#005662', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001', flexShrink: 1 }}
            onClick={() => setPage('regional-comparison')}
          >
            Regional Comparison
          </button>
          <button 
            className="nav-button"
            style={{ minWidth: 60, padding: '0.5rem 0.7rem', borderRadius: 8, border: '1.5px solid #0097a7', background: page === 'india-dashboard' ? '#0097a7' : '#fff', color: page === 'india-dashboard' ? '#fff' : '#005662', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001', flexShrink: 1 }}
            onClick={() => setPage('india-dashboard')}
          >
            India Dashboard
          </button>
        </div>
        <div className="title-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 120, maxWidth: 320, flexShrink: 1, marginRight: '2vw' }}>
          <div style={{ color: '#005662', fontWeight: 700, fontSize: '1.05rem', letterSpacing: 0.5, textAlign: 'right', whiteSpace: 'nowrap' }}>
            <span role="img" aria-label="globe">🌍</span> DataViz
          </div>
          <div style={{
            color: '#007c91',
            fontSize: '0.92rem',
            marginTop: '0.3rem',
            fontWeight: 500,
            maxWidth: 300,
            textAlign: 'right',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            lineHeight: 1.25
          }}>
            Global Happiness & Development Indicators Dashboard
          </div>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', overflow: 'hidden', width: '100vw', maxWidth: '100vw', display: 'flex', flexDirection: 'column' }}>
        {mainContent}
      </div>
      <style>{`
        html, body, #root {
          height: 100%;
          min-height: 100%;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          overflow-x: hidden !important;
          width: 100vw;
          max-width: 100vw;
        }
        #root > div {
          height: 100%;
          width: 100vw;
          max-width: 100vw;
        }
        
        /* Navigation responsiveness */
        @media (max-width: 1024px) {
          .header-container {
            flex-direction: column !important;
            gap: 0.8rem !important;
            padding: 0.5rem 0.2rem !important;
          }
          .nav-container {
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 0.3rem !important;
          }
          .title-container {
            align-items: center !important;
            text-align: center !important;
            margin-right: 0 !important;
            min-width: auto !important;
          }
        }
        
        @media (max-width: 768px) {
          .header-container {
            padding: 0.4rem 0.1rem !important;
          }
          .nav-button {
            min-width: 45px !important;
            font-size: 0.8rem !important;
            padding: 0.4rem 0.5rem !important;
          }
          .title-container div:first-child {
            font-size: 0.95rem !important;
          }
          .title-container div:last-child {
            font-size: 0.8rem !important;
            display: none !important;
          }
        }
        
        @media (max-width: 480px) {
          .nav-container {
            gap: 0.2rem !important;
          }
          .nav-button {
            min-width: 35px !important;
            font-size: 0.7rem !important;
            padding: 0.3rem 0.3rem !important;
            border-radius: 4px !important;
          }
          .title-container div:first-child {
            font-size: 0.85rem !important;
          }
        }
        
        /* Hide navigation text on very small screens */
        @media (max-width: 380px) {
          .nav-button {
            min-width: 30px !important;
            font-size: 0.6rem !important;
            padding: 0.25rem 0.2rem !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
