import { useState } from 'react';
import './App.css';
import RegionList from './RegionList';
import CountryExplorer from './components/CountryExplorer';
import Dashboard from './components/Dashboard';
import BitsLogo from './components/BitsLogo';
import HappinessComparison from './components/HappinessComparison';



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
      mainContent = <Dashboard />;
      break;
    case 'country-explorer':
      mainContent = <CountryExplorer />;
      break;
    case 'regional-view':
      mainContent = <RegionList onRegionSelect={handleRegionSelect} />;
      break;
    case 'happiness':
      mainContent = <HappinessComparison />;
      break;
    default:
      mainContent = null;
  }


  return (
    <div style={{ height: '100%', width: '100vw', maxWidth: '100vw', minWidth: 0, background: '#e6f2f8', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100vw', maxWidth: '100vw', padding: '0.7rem 0.3rem 0.7rem 0.3rem', gap: '0.5rem', boxSizing: 'border-box', flexWrap: 'wrap', minWidth: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 60, maxWidth: 100, flexShrink: 1 }}>
          <BitsLogo />
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '0.5rem', minWidth: 0, maxWidth: '100vw', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button
            style={{ minWidth: 60, padding: '0.5rem 0.7rem', borderRadius: 8, border: '1.5px solid #0097a7', background: page === 'dashboard' ? '#0097a7' : '#fff', color: page === 'dashboard' ? '#fff' : '#005662', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001', flexShrink: 1 }}
            onClick={() => setPage('dashboard')}
          >
            Overview
          </button>
          <button
            style={{ minWidth: 60, padding: '0.5rem 0.7rem', borderRadius: 8, border: '1.5px solid #0097a7', background: page === 'country-explorer' ? '#0097a7' : '#fff', color: page === 'country-explorer' ? '#fff' : '#005662', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001', flexShrink: 1 }}
            onClick={() => setPage('country-explorer')}
          >
            Country Explorer
          </button>
          <button 
            style={{ minWidth: 60, padding: '0.5rem 0.7rem', borderRadius: 8, border: '1.5px solid #0097a7', background: page === 'happiness' ? '#0097a7' : '#fff', color: page === 'happiness' ? '#fff' : '#005662', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001', flexShrink: 1 }}
            onClick={() => setPage('happiness')}
          >
            Happiness
          </button>
          <button 
            style={{ minWidth: 60, padding: '0.5rem 0.7rem', borderRadius: 8, border: '1.5px solid #0097a7', background: page === 'regional-view' ? '#0097a7' : '#fff', color: page === 'regional-view' ? '#fff' : '#005662', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001', flexShrink: 1 }}
            onClick={() => setPage('regional-view')}
          >
            Regional View
          </button>
          <button style={{ minWidth: 60, padding: '0.5rem 0.7rem', borderRadius: 8, border: '1.5px solid #0097a7', background: '#fff', color: '#005662', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001', flexShrink: 1 }}>Regional Comparison</button>
          <button style={{ minWidth: 60, padding: '0.5rem 0.7rem', borderRadius: 8, border: '1.5px solid #0097a7', background: '#fff', color: '#005662', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001', flexShrink: 1 }}>India Dashboard</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 120, maxWidth: 320, flexShrink: 1, marginRight: '2vw' }}>
          <div style={{ color: '#005662', fontWeight: 700, fontSize: '1.05rem', letterSpacing: 0.5, textAlign: 'right', whiteSpace: 'nowrap' }}>
            <span role="img" aria-label="globe">🌍</span> DataBoard
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
        @media (max-width: 900px) {
          div[style*='flex-direction: row'][style*='align-items: center'] {
            flex-direction: column !important;
            gap: 0.5rem !important;
            width: 100vw !important;
            max-width: 100vw !important;
          }
          div[style*='min-width: 60px'] button {
            min-width: 40px !important;
            font-size: 0.8rem !important;
            padding: 0.3rem 0.3rem !important;
          }
          div[style*='min-width: 120px'][style*='align-items: flex-end'] {
            align-items: center !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
