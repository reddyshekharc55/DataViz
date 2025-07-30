import { useState } from 'react';
import './App.css';
import RegionList from './RegionList';
import CountryExplorer from './components/CountryExplorer'



function App() {
  const [page, setPage] = useState('home');
  const [selectedRegion, setSelectedRegion] = useState(null);

  // List of epics (add more as needed)
  const epics = [
    {
      key: 'regional-happiness',
      title: 'Regional Happiness Distribution',
      description: 'Explore happiness distribution across World Bank regions.'
    },
    // Add other epics here
    {
      key: 'country-explorer',
      title: 'Country Explorer',
      description: 'Explore trends for a specific country over time.'
    }
  ];

  // Responsive container style
  const containerStyle = {
    minHeight: '100vh',
    minWidth: '100vw',
    background: '#e6f2f8',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    boxSizing: 'border-box',
  };

  return (
    <div style={containerStyle}>
      <header style={{ textAlign: 'center', padding: '2rem 0 1rem 0', width: '100%', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem', color: '#005662', letterSpacing: 1 }}>DataViz Platform</h1>
        <p style={{ color: '#222', marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Explore global happiness and development indicators.
        </p>
      </header>
      {page === 'home' && (
        <main style={{
          flex: 1,
          width: '100%',
          maxWidth: 700,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <h2 style={{ color: '#005662', fontSize: '1.3rem', marginBottom: '1.2rem', textAlign: 'center' }}>Epics</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {epics.map(epic => (
              <li key={epic.key} style={{ marginBottom: '1.2rem' }}>
                <button
                  style={{
                    width: '100%',
                    background: '#fff',
                    border: '1.5px solid #0097a7',
                    borderRadius: 8,
                    padding: '1rem',
                    fontSize: '1.08rem',
                    color: '#005662',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px #0001',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => setPage(epic.key)}
                >
                  {epic.title}
                  <div style={{ fontWeight: 400, fontSize: '0.98rem', color: '#333', marginTop: 4 }}>{epic.description}</div>
                </button>
              </li>
            ))}
          </ul>
        </main>
      )}
      {page === 'regional-happiness' && (
        <main style={{
          flex: 1,
          width: '100%',
          maxWidth: 700,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <button
            style={{ marginBottom: '1.2rem', background: 'none', border: 'none', color: '#0097a7', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
            onClick={() => setPage('home')}
          >
            ← Back to Epics
          </button>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: '2rem 1.5rem', width: '100%', boxSizing: 'border-box' }}>
            <RegionList onRegionSelect={setSelectedRegion} />
            {selectedRegion && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '1.1rem', color: '#005662' }}>
                <strong>Selected Region:</strong> {selectedRegion}
              </div>
            )}
            {/* New button to open Country Explorer */}
            <button
              style={{ marginTop: '2rem', background: '#0097a7', color: '#fff', border: 'none', borderRadius: 8, padding: '0.8rem 1.2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}
              onClick={() => setPage('country-explorer')}
            >
              Open Country Explorer
            </button>
          </div>
        </main>
      )}

      {page === 'country-explorer' && (
        <main style={{
          flex: 1,
          width: '100%',
          maxWidth: 700,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <button
            style={{ marginBottom: '1.2rem', background: 'none', border: 'none', color: '#0097a7', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
            onClick={() => setPage('home')}
          >
            ← Back to Epics
          </button>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: '2rem 1.5rem', width: '100%', boxSizing: 'border-box' }}>
            <CountryExplorer />
          </div>
        </main>
      )}
      {/* Responsive styles */}
      <style>{`
        html, body, #root {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        @media (max-width: 900px) {
          main, .region-list-card {
            max-width: 98vw !important;
          }
        }
        @media (max-width: 600px) {
          h1 { font-size: 1.3rem !important; }
          h2 { font-size: 1.05rem !important; }
          main > div, .region-list-card {
            padding: 1rem 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App
