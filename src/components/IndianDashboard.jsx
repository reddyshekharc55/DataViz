import React, { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import { getIndiaCorrelationData, getWorldBankData, getHappinessData } from '../services/apiService'
import { getBarChartConfig, createBarDataset, CHART_COLORS } from '../utils/chartConfig'

const IndiaDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('5years')
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

  // Load data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Load correlation data
      const correlations = await getIndiaCorrelationData()
      setCorrelationData(correlations)

      // Load India's current happiness data
      const happinessData = await getHappinessData('IND', 2023)
      
      // Load some basic stats for India
      const gdpData = await getWorldBankData('IND', 'NY.GDP.PCAP.CD', 2020, 2023)
      const latestGDP = gdpData.length > 0 ? gdpData[gdpData.length - 1] : null

      setIndiaStats({
        happinessScore: happinessData.score,
        happinessRank: happinessData.rank,
        gdpPerCapita: latestGDP ? latestGDP.value : null,
        trend: '+0.2' // Mock 5-year trend
      })

      // Create correlation chart
      createCorrelationChart(correlations)

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

  const getYearRange = () => {
    switch (selectedTimeframe) {
      case '5years': return { start: 2019, end: 2023 }
      case '10years': return { start: 2014, end: 2023 }
      case 'all': return { start: 2010, end: 2023 }
      default: return { start: 2019, end: 2023 }
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
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', borderRadius: '10px', color: 'white' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Current Happiness Rank</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
            #{indiaStats ? indiaStats.happinessRank : '126'}
          </p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>out of 156 countries</p>
        </div>
        
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', borderRadius: '10px', color: '#333' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Happiness Score</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
            {indiaStats ? indiaStats.happinessScore.toFixed(3) : '4.036'}
          </p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>on scale of 0-10</p>
        </div>
        
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', borderRadius: '10px', color: '#333' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>{getYearRange().end - getYearRange().start + 1}-Year Trend</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>📈 {indiaStats ? indiaStats.trend : '+0.2'}</p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>slight improvement</p>
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
