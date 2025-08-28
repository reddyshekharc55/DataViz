import React from 'react';
import indiaMap from '../assets/india_map.png';

const pages = [
  {
    title: 'Country Explorer',
    description: 'Explore indicator trends for any country over time.',
    page: 'country-explorer',
    emoji: '🌍'
  },
  {
    title: 'Happiness',
    description: 'Analyze global happiness scores and trends.',
    page: 'happiness',
    emoji: '😊'
  },
  {
    title: 'Regional Analysis',
    description: 'View happiness and development indicators by region.',
    page: 'regional-view',
    emoji: '🗺️'
  },
  {
    title: 'Regional Comparison',
    description: 'Compare happiness and indicators across regions.',
    page: 'regional-comparison',
    emoji: '📊'
  },
  {
    title: 'Indian Dashboard',
    description: 'Deep dive into India’s happiness and development data.',
    page: 'india-dashboard',
    emoji: (
      <img src={indiaMap} alt="India Map" style={{ width: 38, height: 38, objectFit: 'contain', verticalAlign: 'middle', filter: 'drop-shadow(0 2px 4px #1976d233)' }} />
    )
  }
];

const Dashboard = ({ setPage }) => {
  return (
    <div className="card" style={{
      height: '100%',
      maxHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <div style={{ maxWidth: 700, margin: '2rem auto', textAlign: 'center', fontSize: '1.08rem', color: '#2d3748', fontWeight: 500 }}>
        <p>
          Discover happiness around the world! 🌏<br/>
          Explore trends, compare countries, and see what drives well-being. Real data. Simple insights. Enjoy the journey!
        </p>
      </div>
      <style>{`
        .dashboard-cards {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          justify-content: center;
          margin-top: 1.5rem;
          width: 100%;
        }
        @media (max-width: 900px) {
          .dashboard-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(2, auto);
            gap: 1rem;
            justify-items: center;
            align-items: stretch;
          }
          .dashboard-card {
            min-width: 140px;
            max-width: 100vw;
            padding: 1.2rem 0.5rem;
            font-size: 0.98rem;
          }
        }
        @media (max-width: 600px) {
          .dashboard-cards {
            grid-template-columns: 1fr;
            grid-template-rows: none;
            gap: 0.7rem;
          }
          .dashboard-card {
            min-width: 90vw;
            max-width: 98vw;
            padding: 1rem 0.2rem;
            font-size: 0.93rem;
          }
        }
        .dashboard-card {
          cursor: pointer;
          background: linear-gradient(135deg, #e0eafc 0%, #f8fafc 100%);
          border-radius: 16px;
          box-shadow: 0 2px 12px 0 rgba(60,60,60,0.08);
          padding: 1.2rem 0.7rem;
          min-width: 130px;
          max-width: 180px;
          flex: 1 1 140px;
          text-align: center;
          color: #2d3748;
          font-weight: 600;
          font-size: 1.02rem;
          transition: box-shadow 0.2s, transform 0.2s;
          border: 2px solid #e3e8ef;
          margin-bottom: 1rem;
        }
        @media (max-width: 900px) {
          .dashboard-cards {
            gap: 1rem;
          }
          .dashboard-card {
            min-width: 110px;
            max-width: 160px;
            padding: 0.9rem 0.3rem;
            font-size: 0.95rem;
          }
        }
        @media (max-width: 600px) {
          .dashboard-cards {
            flex-direction: column;
            align-items: center;
            gap: 0.7rem;
          }
          .dashboard-card {
            min-width: 90vw;
            max-width: 96vw;
            padding: 0.7rem 0.1rem;
            font-size: 0.91rem;
          }
        }
      `}</style>
      <div className="dashboard-cards">
        {pages.map(page => (
          <div
            key={page.title}
            className="dashboard-card"
            onClick={() => setPage(page.page)}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(44,62,80,0.13)';
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 2px 12px 0 rgba(60,60,60,0.08)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '0.7rem' }}>{page.emoji}</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>{page.title}</div>
            <div style={{ fontSize: '0.98rem', color: '#4a5568', fontWeight: 500 }}>{page.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
