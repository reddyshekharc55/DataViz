// Import Chart.js and datalabels plugin
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components and plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

import React, { useState, useEffect, useRef } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import { getIndiaCorrelationData, getWorldBankData, getHappinessData } from '../services/apiService'
import Papa from 'papaparse'
import { getBarChartConfig, createBarDataset, getLineChartConfig, createTrendDataset, CHART_COLORS } from '../utils/chartConfig'

// Helper: get emoji for each year based on score change
function getHappinessEmojis(series) {
  if (!series || series.length === 0) return [];
  let emojis = ["😊"];
  for (let i = 1; i < series.length; i++) {
    if (series[i].value > series[i-1].value + 0.01) {
      emojis.push("😊");
    } else if (series[i].value < series[i-1].value - 0.01) {
      emojis.push("😢");
    } else {
      emojis.push("😐");
    }
  }
  return emojis;
}

const IndiaDashboard = () => {
  // Chart refs for export
  const happinessTrendRef = useRef(null);
  const indicatorsLineRef = useRef(null);
  const correlationBarRef = useRef(null);

  // Robust export function (Chart.js v2/v3/v4)
  const exportChart = (ref, filename) => {
    let chart = null;
    if (ref.current) {
      chart = ref.current.chart || ref.current;
    }
    if (chart && chart.toBase64Image) {
      try {
        const url = chart.toBase64Image();
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        alert('Export failed');
      }
    } else {
      alert('Chart instance not found. Export is not supported in this environment or Chart.js version.');
    }
  };

  const [selectedTimeframe, setSelectedTimeframe] = useState('5years')
  const [startYear, setStartYear] = useState(2019)
  const [endYear, setEndYear] = useState(2023)
  const [availableYears, setAvailableYears] = useState([])
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
        const response = await fetch('./world_happiness_report_2024_with_codes.csv');
        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { header: true });
        const indiaData = parsed.data.filter(row => (row['Country name'] || row['Country']) === 'India');
        setLifeLadderData(indiaData);
        
        // Get available years from India data
        if (indiaData.length > 0) {
          const years = indiaData
            .map(row => parseInt(row['year'] || row['Year']))
            .filter(year => !isNaN(year))
            .sort((a, b) => b - a); // Sort descending (newest first)
          setAvailableYears([...new Set(years)]); // Remove duplicates
        }
      } catch (err) {
        console.error('Error loading CSV:', err);
        setLifeLadderData([]);
        // Fallback years if CSV loading fails
        setAvailableYears([2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010]);
      }
    };
    loadCSV();
  }, []);

  // Update year range when timeframe changes
  useEffect(() => {
    if (availableYears.length === 0) return; // Wait for available years to load
    
    let newStartYear, newEndYear;
    switch (selectedTimeframe) {
      case '5years':
        newEndYear = Math.max(...availableYears);
        newStartYear = Math.max(newEndYear - 4, Math.min(...availableYears));
        break;
      case '10years':
        newEndYear = Math.max(...availableYears);
        newStartYear = Math.max(newEndYear - 9, Math.min(...availableYears));
        break;
      case 'all':
        newStartYear = Math.min(...availableYears);
        newEndYear = Math.max(...availableYears);
        break;
      default:
        newEndYear = Math.max(...availableYears);
        newStartYear = Math.max(newEndYear - 4, Math.min(...availableYears));
    }
    
    // Only update if the new years are different and valid
    if (availableYears.includes(newStartYear) && availableYears.includes(newEndYear)) {
      setStartYear(newStartYear);
      setEndYear(newEndYear);
    }
  }, [selectedTimeframe, availableYears]);

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

      // Compute real correlation coefficients for each indicator vs happiness
      function computeCorrelation(xArr, yArr) {
        // Pearson correlation coefficient
        const n = xArr.length;
        if (n !== yArr.length || n === 0) return null;
        const meanX = xArr.reduce((a, b) => a + b, 0) / n;
        const meanY = yArr.reduce((a, b) => a + b, 0) / n;
        const num = xArr.map((x, i) => (x - meanX) * (yArr[i] - meanY)).reduce((a, b) => a + b, 0);
        const denX = Math.sqrt(xArr.map(x => (x - meanX) ** 2).reduce((a, b) => a + b, 0));
        const denY = Math.sqrt(yArr.map(y => (y - meanY) ** 2).reduce((a, b) => a + b, 0));
        if (denX === 0 || denY === 0) return null;
        return num / (denX * denY);
      }

      const corrData = [];
      if (happinessSeries.length > 1) {
        // Poverty
        if (povertyData && povertyData.length > 1) {
          const povertyYears = povertyData.map(d => d.year);
          const povertyVals = povertyData.map(d => d.value);
          const happyVals = povertyYears.map(y => {
            const found = happinessSeries.find(h => h.year === y);
            return found ? found.value : null;
          });
          const valid = happyVals.map((v, i) => v != null && !isNaN(povertyVals[i]) && !isNaN(v));
          const x = povertyVals.filter((_, i) => valid[i]);
          const y = happyVals.filter((_, i) => valid[i]);
          const corr = computeCorrelation(x, y);
          if (corr !== null) corrData.push({ indicator: 'Poverty Rate', correlation: corr, trend: corr > 0 ? 'positive' : 'negative', description: 'Poverty vs Happiness' });
        }
        // Life Expectancy
        if (lifeExpData && lifeExpData.length > 1) {
          const lifeExpYears = lifeExpData.map(d => d.year);
          const lifeExpVals = lifeExpData.map(d => d.value);
          const happyVals = lifeExpYears.map(y => {
            const found = happinessSeries.find(h => h.year === y);
            return found ? found.value : null;
          });
          const valid = happyVals.map((v, i) => v != null && !isNaN(lifeExpVals[i]) && !isNaN(v));
          const x = lifeExpVals.filter((_, i) => valid[i]);
          const y = happyVals.filter((_, i) => valid[i]);
          const corr = computeCorrelation(x, y);
          if (corr !== null) corrData.push({ indicator: 'Life Expectancy', correlation: corr, trend: corr > 0 ? 'positive' : 'negative', description: 'Life Expectancy vs Happiness' });
        }
        // Unemployment
        if (unempData && unempData.length > 1) {
          const unempYears = unempData.map(d => d.year);
          const unempVals = unempData.map(d => d.value);
          const happyVals = unempYears.map(y => {
            const found = happinessSeries.find(h => h.year === y);
            return found ? found.value : null;
          });
          const valid = happyVals.map((v, i) => v != null && !isNaN(unempVals[i]) && !isNaN(v));
          const x = unempVals.filter((_, i) => valid[i]);
          const y = happyVals.filter((_, i) => valid[i]);
          const corr = computeCorrelation(x, y);
          if (corr !== null) corrData.push({ indicator: 'Unemployment', correlation: corr, trend: corr > 0 ? 'positive' : 'negative', description: 'Unemployment vs Happiness' });
        }
      }
      setCorrelationData(corrData);
      createCorrelationChart(corrData);
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
    <div className="card" style={{
      height: '100%',
      maxHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      boxSizing: 'border-box',
      padding: '1.5rem',
      overflow: 'auto',
      background: '#ffffff',
      color: '#333'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ 
          margin: 0, 
          marginBottom: '0.5rem', 
          fontSize: '2rem',
          fontWeight: 700,
          color: '#2d3748'
        }}>
          🇮🇳 India Happiness Dashboard
        </h2>
        <p style={{ 
          margin: '0 auto', 
          fontSize: '1rem',
          color: '#4a5568',
          maxWidth: '600px'
        }}>
          Comprehensive analysis of India's happiness trends and socio-economic indicators
        </p>
      </div>
    
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column',
        paddingRight: '8px'
      }}>
      <div className="ind-timeframe-row">
          <style>{`
            .form-group {
              display: flex;
              flex-direction: column;
              gap: 0.4rem;
            }
            .form-group label {
              font-weight: 600;
              color: #0097a7;
              margin-bottom: 0.2rem;
              font-size: 1rem;
            }
            .form-group select, .form-group input[type='number'] {
              padding: 0.5rem 0.75rem;
              border: 2px solid #0097a7;
              border-radius: 6px;
              background: #fff;
              font-size: 0.9rem;
              font-weight: 600;
              color: #0097a7;
              transition: all 0.2s ease;
              outline: none;
              cursor: pointer;
            }
            .form-group select:focus, .form-group input[type='number']:focus {
              border-color: #0097a7;
              box-shadow: 0 0 0 2px rgba(0, 151, 167, 0.2);
            }
            .form-group select:disabled, .form-group input[type='number']:disabled {
              background: #e2e8f0;
              color: #888;
              border-color: #e2e8f0;
            }
            
            /* Custom scrollbar styling */
            .card {
              scrollbar-width: thin;
              scrollbar-color: #cbd5e0 #f7fafc;
            }
            
            .card::-webkit-scrollbar {
              width: 8px;
            }
            
            .card::-webkit-scrollbar-track {
              background: #f7fafc;
              border-radius: 4px;
            }
            
            .card::-webkit-scrollbar-thumb {
              background: #cbd5e0;
              border-radius: 4px;
            }
            
            .card::-webkit-scrollbar-thumb:hover {
              background: #a0aec0;
            }
          `}</style>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            background: '#e0f7fa',
            borderRadius: '8px',
            border: '1px solid #0097a7',
            flexWrap: 'wrap'
          }}>
            <div className="form-group" style={{ minWidth: 180, flex: 1 }}>
              <label htmlFor="ind-timeframe-select">⏱️ Timeframe:</label>
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
            <div className="form-group" style={{ minWidth: 110, flex: 1 }}>
              <label>📅 Start Year:</label>
              <select
                value={startYear}
                onChange={e => setStartYear(Number(e.target.value))}
                disabled={loading || availableYears.length === 0}
              >
                {availableYears.length > 0 ? (
                  availableYears
                    .filter(year => year <= endYear)
                    .map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))
                ) : (
                  <option value="">Loading years...</option>
                )}
              </select>
            </div>
            <div className="form-group" style={{ minWidth: 110, flex: 1 }}>
              <label>📅 End Year:</label>
              <select
                value={endYear}
                onChange={e => setEndYear(Number(e.target.value))}
                disabled={loading || availableYears.length === 0}
              >
                {availableYears.length > 0 ? (
                  availableYears
                    .filter(year => year >= startYear)
                    .map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))
                ) : (
                  <option value="">Loading years...</option>
                )}
              </select>
            </div>
            {/* <button 
              onClick={handleTimeframeChange}
              className="export-btn"
              style={{ marginBottom: 0 }}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Update Dashboard'}
            </button> */}
            <button
              className="export-btn"
              onClick={() => exportChart(happinessTrendRef, `India-Happiness-Trend.png`)}
              disabled={loading || !indiaStats || !indiaStats.happinessSeries || indiaStats.happinessSeries.length === 0}
            >
              📸 Export Happiness Trend Chart
            </button>
            <button
              className="export-btn"
              onClick={() => exportChart(indicatorsLineRef, `India-Development-Indicators.png`)}
              disabled={loading || !indiaStats || !indiaStats.happinessSeries || indiaStats.happinessSeries.length === 0}
            >
              📸 Export Development Indicators Chart
            </button>
            <button
              className="export-btn"
              onClick={() => exportChart(correlationBarRef, `India-Correlation-Chart.png`)}
              disabled={loading || !correlationData || correlationData.length === 0}
            >
              📸 Export Correlation Chart
            </button>
          </div>
          {error && (
            <div style={{
              background: '#fed7d7',
              color: '#c53030',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}
    {/* Export Buttons Styling */}
    <style>{`
      .export-btn {
        padding: 0.5rem 1rem;
        background: #0097a7;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.2s;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
      }
      .export-btn:hover {
        background: #00838f;
      }
      .export-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    `}</style>
    </div>

    {/* --- SECTION 1: INDIAN HAPPINESS SCORE --- */}
    <h2 style={{ textAlign: 'center', color: '#1a237e', fontWeight: 800, fontSize: '2rem', margin: '2.5rem 0 1.5rem 0', letterSpacing: 0.5 }}>Indian Happiness Score</h2>
      <style>{`
        .ind-timeframe-row {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 1.5rem;
          align-items: center;
          justify-content: flex-start;
          margin: 2.5rem 0 2rem 0;
        }
        .ind-timeframe-row label {
          font-weight: 700;
          color: #1a237e;
          font-size: 1.08rem;
          margin-right: 0.7rem;
          letter-spacing: 0.02em;
        }
        .ind-timeframe-row select, .ind-timeframe-row input {
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
          width: auto;
        }
        .ind-timeframe-row select:focus, .ind-timeframe-row input:focus {
          border: 1.7px solid #1976d2;
          box-shadow: 0 0 0 2px #bbdefb;
        }
        .ind-timeframe-row select:disabled, .ind-timeframe-row input:disabled {
          background: #e3e8ef;
          color: #888;
        }
        .ind-timeframe-row .responsive-button {
          padding: 0.6rem 1.5rem;
          background: linear-gradient(45deg, #43e97b, #38f9d7);
          color: #fff;
          border: none;
          border-radius: 0.7rem;
          font-weight: 600;
          font-size: 1.08rem;
          cursor: pointer;
          box-shadow: 0 1px 4px 0 rgba(60,60,60,0.04);
          margin: 0;
        }
      `}</style>



      {/* India Happiness Trend Chart */}
      <div style={{ 
        margin: '2rem 0', 
        background: '#ffffff', 
        borderRadius: '8px', 
        border: '1px solid #e2e8f0',
        padding: '1.5rem', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          textAlign: 'center', 
          color: '#2d3748', 
          fontWeight: 700, 
          fontSize: '1.5rem', 
          marginBottom: '1.2rem'
        }}>
          🇮🇳 India: Happiness Trend
        </h3>
        {indiaStats && indiaStats.happinessSeries && indiaStats.happinessSeries.length > 0 ? (
          <div style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
            <Line
              ref={happinessTrendRef}
              data={{
                labels: indiaStats.happinessSeries.map(d => d.year),
                datasets: [
                  {
                    label: 'Happiness Score',
                    data: indiaStats.happinessSeries.map(d => d.value),
                    borderColor: function(ctx) {
                      // fallback for legend
                      return '#ffb300';
                    },
                    backgroundColor: 'rgba(255,193,7,0.15)',
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#ffb300',
                    pointRadius: 8,
                    pointHoverRadius: 12,
                    tension: 0.3,
                    fill: true,
                    datalabels: {
                      display: true,
                      align: 'top',
                      font: { size: 24 },
                      formatter: (value, context) => {
                        const emojis = getHappinessEmojis(indiaStats.happinessSeries);
                        return emojis[context.dataIndex] || '';
                      }
                    },
                    segment: {
                      borderColor: ctx => {
                        const i = ctx.p0DataIndex;
                        const data = ctx.chart.data.datasets[0].data;
                        if (i === undefined || i === null || i === data.length - 1) return '#ffb300';
                        if (data[i+1] > data[i]) return '#43e97b'; // green for increase
                        if (data[i+1] < data[i]) return '#f5576c'; // red for decrease
                        return '#ffb300'; // yellow for no change
                      }
                    }
                  }
                ]
              }}
              options={{
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: ctx => `Happiness: ${ctx.parsed.y.toFixed(3)}`
                    }
                  },
                  datalabels: {
                    display: true
                  }
                },
                scales: {
                  x: {
                    title: { display: true, text: 'Year', font: { size: 14, family: 'inherit', weight: 600 } },
                    ticks: { color: '#2d3748', font: { size: 13, family: 'inherit' } },
                    grid: { color: 'rgba(44,62,80,0.07)' }
                  },
                  y: {
                    title: { display: true, text: 'Happiness Score', font: { size: 14, family: 'inherit', weight: 600 } },
                    min: 0, max: 10,
                    ticks: { color: '#2d3748', font: { size: 13, family: 'inherit' } },
                    grid: { color: 'rgba(44,62,80,0.07)' }
                  }
                }
              }}
            />
          </div>
        ) : (
          <p style={{ color: '#c62828', textAlign: 'center', fontSize: '1.1rem' }}>No happiness data available for India.</p>
        )}
        {/* Short description below the chart */}
        {indiaStats && indiaStats.happinessSeries && indiaStats.happinessSeries.length > 1 && (
          <div style={{ marginTop: '1.2rem', textAlign: 'center', fontSize: '1.08rem', color: '#4a5568', fontWeight: 500, fontFamily: 'inherit' }}>
            {(() => {
              const first = indiaStats.happinessSeries[0].value;
              const last = indiaStats.happinessSeries[indiaStats.happinessSeries.length-1].value;
              if (last > first + 0.05) return 'India is becoming happier! 😊';
              if (last < first - 0.05) return 'Happiness has decreased in recent years. 😢';
              return 'Happiness has remained fairly stable.';
            })()}
          </div>
        )}
      </div>
  {/* Detailed Analysis Section */}
  <div style={{
    textAlign: 'center',
    marginTop: '3rem',
    marginBottom: '2rem'
  }}>
    <h2 style={{ 
      margin: 0, 
      marginBottom: '0.5rem', 
      fontSize: '1.8rem',
      fontWeight: 700,
      color: '#2d3748'
    }}>
      📊 Detailed Analysis
    </h2>
    <p style={{ 
      margin: '0 auto', 
      fontSize: '1rem',
      color: '#4a5568',
      maxWidth: '600px'
    }}>
      Comprehensive view of happiness trends and socio-economic indicators
    </p>
  </div>
  
  <div className="responsive-grid" style={{ 
    margin: '2rem 0', 
    display: 'flex', 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: '2rem', 
    justifyContent: 'center', 
    alignItems: 'flex-start', 
    width: '100%' 
  }}>
        {/* Multi-Line Chart for All Indicators vs Happiness */}
        <div style={{ 
          flex: '1 1 420px', 
          minWidth: 340, 
          maxWidth: 700, 
          background: '#ffffff', 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0',
          color: '#333', 
          minHeight: 380, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '1.5rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>India: Happiness & Development Indicators</h3>
          {indiaStats && indiaStats.happinessSeries && indiaStats.happinessSeries.length > 0 ? (
            <div style={{ width: '100%', maxWidth: 640, height: 300 }}>
              <Line
                ref={indicatorsLineRef}
                {...getLineChartConfig(
                  'Indicators vs Happiness (India)',
                  [
                    indiaStats.povertySeries && indiaStats.povertySeries.length > 0 ? createTrendDataset('Poverty Rate', indiaStats.povertySeries.map(d => d.value), CHART_COLORS.secondary, CHART_COLORS.secondaryBorder) : null,
                    indiaStats.lifeExpSeries && indiaStats.lifeExpSeries.length > 0 ? createTrendDataset('Life Expectancy', indiaStats.lifeExpSeries.map(d => d.value), CHART_COLORS.success, CHART_COLORS.successBorder) : null,
                    indiaStats.unempSeries && indiaStats.unempSeries.length > 0 ? createTrendDataset('Unemployment Rate', indiaStats.unempSeries.map(d => d.value), CHART_COLORS.warning, CHART_COLORS.warningBorder) : null,
                    createTrendDataset('Life Ladder (Happiness)', indiaStats.happinessSeries.map(d => d.value), CHART_COLORS.primary, CHART_COLORS.primaryBorder)
                  ].filter(Boolean),
                  indiaStats.happinessSeries.map(d => d.year)
                )}
                options={{
                  ...getLineChartConfig(
                    'Indicators vs Happiness (India)',
                    [
                      indiaStats.povertySeries && indiaStats.povertySeries.length > 0 ? createTrendDataset('Poverty Rate', indiaStats.povertySeries.map(d => d.value), CHART_COLORS.secondary, CHART_COLORS.secondaryBorder) : null,
                      indiaStats.lifeExpSeries && indiaStats.lifeExpSeries.length > 0 ? createTrendDataset('Life Expectancy', indiaStats.lifeExpSeries.map(d => d.value), CHART_COLORS.success, CHART_COLORS.successBorder) : null,
                      indiaStats.unempSeries && indiaStats.unempSeries.length > 0 ? createTrendDataset('Unemployment Rate', indiaStats.unempSeries.map(d => d.value), CHART_COLORS.warning, CHART_COLORS.warningBorder) : null,
                      createTrendDataset('Life Ladder (Happiness)', indiaStats.happinessSeries.map(d => d.value), CHART_COLORS.primary, CHART_COLORS.primaryBorder)
                    ].filter(Boolean),
                    indiaStats.happinessSeries.map(d => d.year)
                  ).options,
                  plugins: {
                    ...getLineChartConfig(
                      'Indicators vs Happiness (India)',
                      [
                        indiaStats.povertySeries && indiaStats.povertySeries.length > 0 ? createTrendDataset('Poverty Rate', indiaStats.povertySeries.map(d => d.value), CHART_COLORS.secondary, CHART_COLORS.secondaryBorder) : null,
                        indiaStats.lifeExpSeries && indiaStats.lifeExpSeries.length > 0 ? createTrendDataset('Life Expectancy', indiaStats.lifeExpSeries.map(d => d.value), CHART_COLORS.success, CHART_COLORS.successBorder) : null,
                        indiaStats.unempSeries && indiaStats.unempSeries.length > 0 ? createTrendDataset('Unemployment Rate', indiaStats.unempSeries.map(d => d.value), CHART_COLORS.warning, CHART_COLORS.warningBorder) : null,
                        createTrendDataset('Life Ladder (Happiness)', indiaStats.happinessSeries.map(d => d.value), CHART_COLORS.primary, CHART_COLORS.primaryBorder)
                      ].filter(Boolean),
                      indiaStats.happinessSeries.map(d => d.year)
                    ).options.plugins,
                    datalabels: { display: false }
                  }
                }}
              />
            </div>
          ) : (
            <p style={{ color: 'red', fontSize: '1rem', margin: '2rem 0' }}>No data</p>
          )}
          <p style={{ margin: 0, fontSize: '0.9rem' }}>India, {startYear}-{endYear}</p>
        </div>
        {/* Correlation Bar Chart */}
        <div style={{ 
          flex: '1 1 340px', 
          minWidth: 340, 
          maxWidth: 480, 
          background: '#ffffff', 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0',
          color: '#333', 
          minHeight: 380, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '1.5rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Correlation with Happiness Index</h3>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#555' }}>Indicators ranked by their correlation strength with India's happiness score</p>
          {correlationData && correlationData.length > 0 ? (
            <div style={{ width: '100%', maxWidth: 400, height: 300 }}>
              {/* Use the correlation chart config from createCorrelationChart */}
              <Bar
                ref={correlationBarRef}
                {...getBarChartConfig(
                  'Indicators Correlation with Happiness Index (India)',
                  [createBarDataset(
                    'Correlation Strength',
                    correlationData.map(item => Math.abs(item.correlation)),
                    correlationData.map(item => item.trend === 'positive' ? CHART_COLORS.success : CHART_COLORS.secondary)
                  )],
                  correlationData.map(item => item.indicator)
                )}
                options={{
                  ...getBarChartConfig(
                    'Indicators Correlation with Happiness Index (India)',
                    [createBarDataset(
                      'Correlation Strength',
                      correlationData.map(item => Math.abs(item.correlation)),
                      correlationData.map(item => item.trend === 'positive' ? CHART_COLORS.success : CHART_COLORS.secondary)
                    )],
                    correlationData.map(item => item.indicator)
                  ).options,
                  plugins: {
                    ...getBarChartConfig(
                      'Indicators Correlation with Happiness Index (India)',
                      [createBarDataset(
                        'Correlation Strength',
                        correlationData.map(item => Math.abs(item.correlation)),
                        correlationData.map(item => item.trend === 'positive' ? CHART_COLORS.success : CHART_COLORS.secondary)
                      )],
                      correlationData.map(item => item.indicator)
                    ).options.plugins,
                    datalabels: { display: false }
                  }
                }}
              />
            </div>
          ) : (
            <p style={{ color: 'red', fontSize: '1rem', margin: '2rem 0' }}>No correlation data</p>
          )}
        </div>
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
      <div style={{
        margin: '2rem 0',
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          textAlign: 'center',
          color: '#2d3748',
          fontWeight: 700,
          fontSize: '1.5rem',
          marginBottom: '1.2rem'
        }}>
          💡 Key Insights for India
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ 
            padding: '1rem', 
            background: '#e8f5e8', 
            borderRadius: '8px', 
            borderLeft: '4px solid #43e97b' 
          }}>
            <h4 style={{ color: '#2d5a2d', margin: '0 0 0.5rem 0' }}>💪 Strongest Positive Driver</h4>
            <p style={{ margin: 0, color: '#333' }}>Social Support shows the highest correlation (0.81) with happiness scores in India</p>
          </div>
          
          <div style={{ 
            padding: '1rem', 
            background: '#ffebee', 
            borderRadius: '8px', 
            borderLeft: '4px solid #f5576c' 
          }}>
            <h4 style={{ color: '#c62828', margin: '0 0 0.5rem 0' }}>⚠️ Key Challenge</h4>
            <p style={{ margin: 0, color: '#333' }}>Unemployment rate negatively impacts happiness and needs attention for improvement</p>
          </div>
          
          <div style={{ 
            padding: '1rem', 
            background: '#e3f2fd', 
            borderRadius: '8px', 
            borderLeft: '4px solid #2196f3' 
          }}>
            <h4 style={{ color: '#1565c0', margin: '0 0 0.5rem 0' }}>📊 Opportunity Area</h4>
            <p style={{ margin: 0, color: '#333' }}>Economic growth (GDP) and education improvements can significantly boost happiness</p>
          </div>
        </div>
      </div>
      </div> {/* End of scrollable container */}
    </div>
  )
}

export default IndiaDashboard
