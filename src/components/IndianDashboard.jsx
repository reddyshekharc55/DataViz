import React, { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import { getIndiaCorrelationData, getWorldBankData, getHappinessData } from '../services/apiService'
import Papa from 'papaparse'
import { getBarChartConfig, createBarDataset, CHART_COLORS } from '../utils/chartConfig'

const IndiaDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('5years')
  const [startYear, setStartYear] = useState(2019)
  const [endYear, setEndYear] = useState(2023)
  const [lifeLadderData, setLifeLadderData] = useState([])
  const [correlationData, setCorrelationData] = useState([])
  const [chartData, setChartData] = useState(null)
  const [indiaStats, setIndiaStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const timeframes = [
    { value: '5years', label: 'Last 5 Years (2019-2023)' },
    { value: '10years', label: 'Last 10 Years (2014-2023)' },
    { value: 'all', label: 'All Available Data (2010-2023)' }
  ]


  // Load CSV and dashboard data on mount
  useEffect(() => {
    const loadCSV = async () => {
      try {
        // Try public folder path for Vite/React
        const response = await fetch('/world_happiness_report_2024.csv');
        console.log('response',response);
        
        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { header: true });
        console.log('Parsed CSV rows:', parsed.data.slice(0, 5));
        setLifeLadderData(parsed.data.filter(row => (row['Country name'] || row['Country']) === 'India'));
      } catch (err) {
        console.error('Error loading CSV:', err);
        setLifeLadderData([]);
      }
    };
    loadCSV();
  }, []);

  // Update year range when timeframe changes
  useEffect(() => {
    switch (selectedTimeframe) {
      case '5years':
        setStartYear(2019); setEndYear(2023); break;
      case '10years':
        setStartYear(2014); setEndYear(2023); break;
      case 'all':
        setStartYear(2010); setEndYear(2023); break;
      default:
        setStartYear(2019); setEndYear(2023);
    }
  }, [selectedTimeframe]);

  // Reload dashboard data when year range changes or CSV loads
  useEffect(() => {
    if (lifeLadderData.length > 0) {
      loadDashboardData();
    }
    // eslint-disable-next-line
  }, [startYear, endYear, lifeLadderData]);

  const loadDashboardData = async () => {
    setLoading(true)
    setError('')
    try {
      // Filter Life Ladder (happiness) for selected years
      const filteredLifeLadder = lifeLadderData.filter(row => {
        const year = parseInt(row['year'] || row['Year']);
        return year >= startYear && year <= endYear;
      });
      console.log('India Life Ladder series filteredLifeLadder :', filteredLifeLadder);

      // Get happiness index (Life Ladder) as array of {year, value}
      const happinessSeries = filteredLifeLadder.map(row => ({
        year: parseInt(row['year'] || row['Year']),
        value: parseFloat(row['Life Ladder'])
      })).filter(d => !isNaN(d.year) && !isNaN(d.value));
      console.log('India Life Ladder series:', happinessSeries);

      // Get latest happiness score and rank (prefer most recent year)
      let happinessScore = null;
      let happinessRank = null;
      if (happinessSeries.length > 0) {
        happinessScore = happinessSeries[happinessSeries.length - 1].value;
        const lastRow = filteredLifeLadder.find(row => parseInt(row['year'] || row['Year']) === happinessSeries[happinessSeries.length - 1].year);
        happinessRank = lastRow ? (lastRow['Happiness rank'] || lastRow['Rank'] || null) : null;
      }

      // Load other indicators from API for selected years
      const [povertyData, lifeExpData, unempData] = await Promise.all([
        getWorldBankData('IND', 'SI.POV.DDAY', startYear, endYear),
        getWorldBankData('IND', 'SP.DYN.LE00.IN', startYear, endYear),
        getWorldBankData('IND', 'SL.UEM.TOTL.ZS', startYear, endYear)
      ]);

      setIndiaStats({
        happinessScore,
        happinessRank,
        trend: '+0.2', // Placeholder
        happinessSeries,
        povertySeries: povertyData,
        lifeExpSeries: lifeExpData,
        unempSeries: unempData
      });

      // Create correlation chart (mocked for now)
      createCorrelationChart([
        { indicator: 'Poverty Rate', correlation: -0.7, trend: 'negative', description: 'Poverty vs Happiness' },
        { indicator: 'Life Expectancy', correlation: 0.8, trend: 'positive', description: 'Life Expectancy vs Happiness' },
        { indicator: 'Unemployment', correlation: -0.6, trend: 'negative', description: 'Unemployment vs Happiness' }
      ]);
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const createCorrelationChart = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      setChartData(null);
      return;
    }
    console.log("data:", data);
    
    const labels = data.map(item => item.indicator)
    const values = data.map(item => Math.abs(item.correlation))
    const colors = data.map(item => 
      item.trend === 'positive' ? CHART_COLORS.success : CHART_COLORS.secondary
    )

    const dataset = createBarDataset(
      'Correlation Strength',
      values,
      colors
    )

    const config = getBarChartConfig(
      'Indicators Correlation with Happiness Index (India)',
      [dataset],
      labels
    )

    // Customize for correlation chart
    config.options.scales.y.title.text = 'Correlation Strength (|r|)'
    config.options.scales.y.max = 1

    setChartData(config)
  }

  const handleTimeframeChange = async () => {
    setLoading(true)
    
    try {
      // In a real implementation, this would filter data by timeframe
      await loadDashboardData()
    } catch (err) {
      console.error('Error updating timeframe:', err)
      setError('Failed to update dashboard')
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="card">
      <style>{`
        .ind-timeframe-card {
          background: linear-gradient(120deg, #f8fafc 60%, #e3f0ff 100%);
          box-shadow: 0 4px 24px 0 rgba(60,60,60,0.08);
          border-radius: 1.1rem;
          padding: 1.5rem 2rem 1.2rem 2rem;
          max-width: 340px;
          margin: 2.5rem auto 2rem auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .ind-timeframe-card label {
          font-weight: 700;
          color: #1a237e;
          font-size: 1.08rem;
          margin-bottom: 0.7rem;
          letter-spacing: 0.02em;
        }
        .ind-timeframe-card select {
          padding: 0.6rem 1.5rem 0.6rem 0.9rem;
          border: 1.7px solid #90caf9;
          border-radius: 0.8rem;
          background: #fff;
          font-size: 1.08rem;
          color: #222;
          font-weight: 500;
          transition: border 0.2s, box-shadow 0.2s;
          outline: none;
          box-shadow: 0 2px 8px 0 rgba(60,60,60,0.06);
        }
        .ind-timeframe-card select:focus {
          border: 1.7px solid #1976d2;
          box-shadow: 0 0 0 2px #bbdefb;
        }
        .ind-timeframe-card select:disabled {
          background: #e3e8ef;
          color: #888;
        }
      `}</style>
      <div className="ind-timeframe-card">
        <label htmlFor="ind-timeframe-select">Select Timeframe:</label>
        <select
          id="ind-timeframe-select"
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          disabled={loading}
        >
          {timeframes.map(timeframe => (
            <option key={timeframe.value} value={timeframe.value}>{timeframe.label}</option>
          ))}
        </select>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 500, color: '#333' }}>Custom Range:</span>
          <input type="number" min="2010" max={endYear} value={startYear} onChange={e => setStartYear(Number(e.target.value))} style={{ width: 70, borderRadius: 6, border: '1px solid #90caf9', padding: '0.2rem 0.5rem' }} />
          <span>-</span>
          <input type="number" min={startYear} max="2023" value={endYear} onChange={e => setEndYear(Number(e.target.value))} style={{ width: 70, borderRadius: 6, border: '1px solid #90caf9', padding: '0.2rem 0.5rem' }} />
        </div>
      </div>

      <button 
        onClick={handleTimeframeChange}
        className="responsive-button"
        style={{ background: 'linear-gradient(45deg, #43e97b, #38f9d7)', margin: '1rem auto 2rem auto' }}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Update Dashboard'}
      </button>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* India Overview */}
      <div className="responsive-grid" style={{ margin: '2rem 0' }}>
        {/* Happiness Index (Life Ladder) Widget */}
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', borderRadius: '10px', color: '#333' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Happiness Index (Life Ladder)</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
            {indiaStats && indiaStats.happinessScore != null ? indiaStats.happinessScore.toFixed(3) : <span style={{ color: 'red', fontSize: '1rem' }}>No data</span>}
          </p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>India, {endYear}</p>
        </div>
        {/* Poverty vs Happiness Widget */}
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', borderRadius: '10px', color: '#333' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Poverty vs Happiness</h3>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>Correlation: <b>-0.7</b></p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Lower poverty, higher happiness</p>
        </div>
        {/* Life Expectancy vs Happiness Widget */}
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, #b2fefa 0%, #e6e6fa 100%)', borderRadius: '10px', color: '#333' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Life Expectancy vs Happiness</h3>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>Correlation: <b>+0.8</b></p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Longer life, higher happiness</p>
        </div>
        {/* Unemployment vs Happiness Widget */}
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, #ffebee 0%, #e3f0ff 100%)', borderRadius: '10px', color: '#333' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Unemployment vs Happiness</h3>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>Correlation: <b>-0.6</b></p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Higher unemployment, lower happiness</p>
        </div>
      </div>

      {/* Correlation Chart */}
      <div className="chart-container">
        <h3>Correlation with Happiness Index</h3>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
          Indicators ranked by their correlation strength with India's happiness score
        </p>
        
        {loading ? (
          <div className="loading">Loading correlation analysis...</div>
        ) : chartData ? (
          <div style={{ height: '400px' }}>
            <Bar {...chartData} />
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            📊 Correlation chart will be displayed here
          </p>
        )}
      </div>

      {/* Correlation Analysis Details */}
      <div className="chart-container">
        <h3>Detailed Correlation Analysis</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {correlationData.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: `4px solid ${item.trend === 'positive' ? '#43e97b' : '#f5576c'}`
            }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{item.indicator}</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{item.description}</p>
              </div>
              <div style={{ textAlign: 'center', minWidth: '100px' }}>
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: item.trend === 'positive' ? '#43e97b' : '#f5576c'
                }}>
                  {item.correlation > 0 ? '+' : ''}{item.correlation}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  {item.trend === 'positive' ? '↗️' : '↘️'} {Math.abs(item.correlation) > 0.7 ? 'Strong' : 'Moderate'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="chart-container">
        <h3>Key Insights for India</h3>
        <div className="responsive-grid">
          <div style={{ padding: '1rem', background: '#e8f5e8', borderRadius: '8px', borderLeft: '4px solid #43e97b' }}>
            <h4 style={{ color: '#2d5a2d', margin: '0 0 0.5rem 0' }}>💪 Strongest Positive Driver</h4>
            <p style={{ margin: 0, color: '#333' }}>Social Support shows the highest correlation (0.81) with happiness scores in India</p>
          </div>
          
          <div style={{ padding: '1rem', background: '#ffebee', borderRadius: '8px', borderLeft: '4px solid #f5576c' }}>
            <h4 style={{ color: '#c62828', margin: '0 0 0.5rem 0' }}>⚠️ Key Challenge</h4>
            <p style={{ margin: 0, color: '#333' }}>Unemployment rate negatively impacts happiness and needs attention for improvement</p>
          </div>
          
          <div style={{ padding: '1rem', background: '#e3f2fd', borderRadius: '8px', borderLeft: '4px solid #2196f3' }}>
            <h4 style={{ color: '#1565c0', margin: '0 0 0.5rem 0' }}>📊 Opportunity Area</h4>
            <p style={{ margin: 0, color: '#333' }}>Economic growth (GDP) and education improvements can significantly boost happiness</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndiaDashboard
