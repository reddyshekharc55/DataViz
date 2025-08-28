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
import indiaMap from '../assets/india_map.png'

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
      overflow: 'auto'
    }}>
      <style>{`
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .form-group label {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.2rem;
        }
        .form-group select {
          padding: 0.5rem 1.2rem 0.5rem 0.7rem;
          border: 1.5px solid #b3b3b3;
          border-radius: 0.7rem;
          background: #f8fafc;
          font-size: 1.08rem;
          color: #222;
          transition: border 0.2s, box-shadow 0.2s;
          outline: none;
          box-shadow: 0 1px 4px 0 rgba(60,60,60,0.04);
        }
        .form-group select:focus {
          border: 1.5px solid #3182ce;
          box-shadow: 0 0 0 2px #90cdf4;
        }
        .form-group select:disabled {
          background: #e2e8f0;
          color: #888;
        }
        .export-btn {
          padding: 0.5rem 1rem;
          background: #0097a7;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
          margin-top: 0.5rem;
        }
        .export-btn:hover {
          background: #00838f;
        }
        .export-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .chart-container > div:first-of-type {
            grid-template-columns: 1fr !important;
          }
        }
        
        /* Ensure proper scrolling on all screen sizes */
        .chart-container {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f7fafc;
        }
        
        .chart-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .chart-container::-webkit-scrollbar-track {
          background: #f7fafc;
          border-radius: 4px;
        }
        
        .chart-container::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
        }
        
        .chart-container::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
      
      <h2 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1.4rem', color: '#2d3748' }}>
        <img src={indiaMap} alt="India Map" style={{ width: 24, height: 24, objectFit: 'contain', verticalAlign: 'middle', marginRight: '0.5rem', filter: 'drop-shadow(0 2px 4px #1976d233)' }} />
        India Happiness Dashboard {loading && <span style={{ fontSize: '1rem', color: '#3182ce' }}>⏳</span>}
      </h2>
      <p style={{ margin: 0, marginBottom: '1rem', color: '#4a5568', fontSize: '0.85rem' }}>
        View indicators that most strongly correlate (positively or negatively) with the happiness index
      </p>
      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        alignItems: 'flex-end'
      }}>
        {/* Timeframe Selection */}
        <div className="form-group" style={{ minWidth: 180, flex: 1 }}>
          <label>⏱️ Timeframe</label>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            disabled={loading}
          >
            {timeframes.map(timeframe => (
              <option key={timeframe.value} value={timeframe.value}>{timeframe.label}</option>
            ))}
          </select>
        </div>

        {/* Start Year Selection */}
        <div className="form-group" style={{ minWidth: 120, flex: 1 }}>
          <label>📅 Start Year</label>
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

        {/* End Year Selection */}
        <div className="form-group" style={{ minWidth: 120, flex: 1 }}>
          <label>📅 End Year</label>
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
      </div>

      {/* Error Display */}
      {error && (
        <div className="error" style={{ 
          color: '#e53e3e', 
          marginBottom: '1rem', 
          backgroundColor: '#fed7d7', 
          padding: '0.5rem', 
          borderRadius: '4px', 
          border: '1px solid #feb2b2' 
        }}>
          {error}
        </div>
      )}

      {/* Charts Section */}
      {indiaStats && indiaStats.happinessSeries && indiaStats.happinessSeries.length > 0 && (
        <div className="chart-container" style={{ 
          flex: 1, 
          overflow: 'auto', 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 0 
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>Happiness Analysis</h3>
          
          {/* Charts Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1rem',
            minHeight: '350px',
            marginBottom: '1rem'
          }}>
            {/* Happiness Trend Chart */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <h4 style={{ margin: 0, color: '#2d3748', fontSize: '1rem' }}>
                  📈 India Happiness Trend
                </h4>
                <button
                  className="export-btn"
                  onClick={() => exportChart(happinessTrendRef, `India-Happiness-Trend-${startYear}-${endYear}.png`)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    margin: 0
                  }}
                >
                  📸 Export
                </button>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <Line
                  ref={happinessTrendRef}
                  data={{
                    labels: indiaStats.happinessSeries.map(d => d.year),
                    datasets: [
                      {
                        label: 'Happiness Score',
                        data: indiaStats.happinessSeries.map(d => d.value),
                        borderColor: function(ctx) {
                          return '#0097a7';
                        },
                        backgroundColor: 'rgba(0,151,167,0.15)',
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#0097a7',
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        tension: 0.3,
                        fill: true,
                        datalabels: {
                          display: true,
                          align: 'top',
                          font: { size: 18 },
                          formatter: (value, context) => {
                            const emojis = getHappinessEmojis(indiaStats.happinessSeries);
                            return emojis[context.dataIndex] || '';
                          }
                        },
                        segment: {
                          borderColor: ctx => {
                            const i = ctx.p0DataIndex;
                            const data = ctx.chart.data.datasets[0].data;
                            if (i === undefined || i === null || i === data.length - 1) return '#0097a7';
                            if (data[i+1] > data[i]) return '#43e97b';
                            if (data[i+1] < data[i]) return '#f5576c';
                            return '#0097a7';
                          }
                        }
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
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
                        title: { display: true, text: 'Year', font: { size: 12, family: 'inherit', weight: 600 } },
                        ticks: { color: '#2d3748', font: { size: 11, family: 'inherit' } },
                        grid: { color: 'rgba(0, 0, 0, 0.1)' }
                      },
                      y: {
                        title: { display: true, text: 'Happiness Score', font: { size: 12, family: 'inherit', weight: 600 } },
                        min: 0, max: 10,
                        ticks: { color: '#2d3748', font: { size: 11, family: 'inherit' } },
                        grid: { color: 'rgba(0, 0, 0, 0.1)' }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Development Indicators Chart */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <h4 style={{ margin: 0, color: '#2d3748', fontSize: '1rem' }}>
                  📊 Development Indicators
                </h4>
                <button
                  className="export-btn"
                  onClick={() => exportChart(indicatorsLineRef, `India-Development-Indicators-${startYear}-${endYear}.png`)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    margin: 0
                  }}
                >
                  📸 Export
                </button>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
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
                    responsive: true,
                    maintainAspectRatio: false,
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
            </div>
          </div>

          {/* Correlation Chart and Analysis Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {/* Correlation Chart */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <h4 style={{ margin: 0, color: '#2d3748', fontSize: '1rem' }}>
                  📊 Correlation with Happiness Index
                </h4>
                <button
                  className="export-btn"
                  onClick={() => exportChart(correlationBarRef, `India-Correlation-Chart-${startYear}-${endYear}.png`)}
                  disabled={!correlationData || correlationData.length === 0}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    margin: 0
                  }}
                >
                  📸 Export
                </button>
              </div>
              <div style={{ flex: 1, minHeight: 0, height: '300px' }}>
                {correlationData && correlationData.length > 0 ? (
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
                      responsive: true,
                      maintainAspectRatio: false,
                      ...getBarChartConfig(
                        'Indicators Correlation with Happiness Index (India)',
                        [createBarDataset(
                          'Correlation Strength',
                          correlationData.map(item => Math.abs(item.correlation)),
                          correlationData.map(item => item.trend === 'positive' ? CHART_COLORS.success : CHART_COLORS.secondary)
                        )],
                        correlationData.map(item => item.indicator)
                      ).options,
                      scales: {
                        y: {
                          title: { display: true, text: 'Correlation Strength (|r|)' },
                          max: 1
                        }
                      },
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
                ) : (
                  <p style={{ color: '#e53e3e', textAlign: 'center', fontSize: '0.9rem', margin: '2rem 0' }}>No correlation data available</p>
                )}
              </div>
            </div>

            {/* Correlation Analysis Details */}
            {correlationData && correlationData.length > 0 && (
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#2d3748', fontSize: '1rem' }}>
                  📋 Detailed Correlation Analysis
                </h4>
                <div style={{ 
                  flex: 1,
                  overflowY: 'auto',
                  display: 'grid', 
                  gap: '0.5rem',
                  maxHeight: '300px'
                }}>
                  {correlationData.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                      borderLeft: `3px solid ${item.trend === 'positive' ? '#43e97b' : '#f5576c'}`
                    }}>
                      <div style={{ flex: 1 }}>
                        <h5 style={{ margin: '0 0 0.25rem 0', color: '#333', fontSize: '0.9rem' }}>{item.indicator}</h5>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.8rem' }}>{item.description}</p>
                      </div>
                      <div style={{ textAlign: 'center', minWidth: '80px' }}>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          color: item.trend === 'positive' ? '#43e97b' : '#f5576c'
                        }}>
                          {item.correlation > 0 ? '+' : ''}{item.correlation.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                          {item.trend === 'positive' ? '↗️' : '↘️'} {Math.abs(item.correlation) > 0.7 ? 'Strong' : 'Moderate'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Key Insights */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <h4 style={{ margin: '0 0 0.75rem 0', color: '#2d3748', fontSize: '1rem' }}>
              💡 Key Insights for India
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem'
            }}>
              <div style={{ 
                padding: '0.75rem', 
                background: '#e8f5e8', 
                borderRadius: '6px', 
                borderLeft: '3px solid #43e97b' 
              }}>
                <h5 style={{ color: '#2d5a2d', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>💪 Strongest Positive Driver</h5>
                <p style={{ margin: 0, color: '#333', fontSize: '0.8rem' }}>
                  {correlationData && correlationData.length > 0 
                    ? `${correlationData.find(item => item.trend === 'positive')?.indicator || 'Social Support'} shows positive correlation with happiness`
                    : 'Social Support shows positive correlation with happiness'
                  }
                </p>
              </div>
              
              <div style={{ 
                padding: '0.75rem', 
                background: '#ffebee', 
                borderRadius: '6px', 
                borderLeft: '3px solid #f5576c' 
              }}>
                <h5 style={{ color: '#c62828', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>⚠️ Key Challenge</h5>
                <p style={{ margin: 0, color: '#333', fontSize: '0.8rem' }}>
                  {correlationData && correlationData.length > 0 
                    ? `${correlationData.find(item => item.trend === 'negative')?.indicator || 'Unemployment'} negatively impacts happiness and needs attention`
                    : 'Unemployment negatively impacts happiness and needs attention'
                  }
                </p>
              </div>
              
              <div style={{ 
                padding: '0.75rem', 
                background: '#e3f2fd', 
                borderRadius: '6px', 
                borderLeft: '3px solid #2196f3' 
              }}>
                <h5 style={{ color: '#1565c0', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>📊 Opportunity Area</h5>
                <p style={{ margin: 0, color: '#333', fontSize: '0.8rem' }}>
                  Economic growth (GDP) and education improvements can significantly boost happiness
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IndiaDashboard
