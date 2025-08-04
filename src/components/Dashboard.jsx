import React from 'react';

const Dashboard = () => {
  return (
    <div className="card" style={{
      height: '100%',
      maxHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <h2 style={{ margin: 0, marginBottom: '0.5rem', color: '#2d3748' }}>📊 Dashboard Overview</h2>
      <p style={{ margin: 0, color: '#4a5568' }}>Welcome to the Global Happiness & Development Indicators Dashboard! Here you can find various data visualizations and insights.</p>
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          padding: '2rem',
          backgroundColor: '#f8fafc',
          borderRadius: 8,
          border: '2px dashed #cbd5e0',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h3 style={{ color: '#4a5568', margin: '0 0 1rem 0' }}>
            🚀 Getting Started
          </h3>
          <p style={{ color: '#718096', margin: 0, lineHeight: 1.5 }}>
            Use the navigation above to explore different features:
          </p>
          <ul style={{ 
            color: '#718096', 
            textAlign: 'left', 
            margin: '1rem 0 0 0',
            listStyle: 'none',
            padding: 0
          }}>
            <li style={{ margin: '0.5rem 0' }}>🌍 <strong>Country Explorer</strong> - Analyze trends for specific countries</li>
            <li style={{ margin: '0.5rem 0' }}>🗺️ <strong>Regional View</strong> - Browse World Bank regions</li>
            <li style={{ margin: '0.5rem 0' }}>😊 <strong>Happiness</strong> - Compare GDP vs Happiness Index ✨ NEW!</li>
            <li style={{ margin: '0.5rem 0' }}>📈 <strong>Regional Comparison</strong> - Coming soon!</li>
            <li style={{ margin: '0.5rem 0' }}>🇮🇳 <strong>India Dashboard</strong> - Coming soon!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
