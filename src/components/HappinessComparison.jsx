import React, { useState, useEffect, useRef } from 'react'
import { Line, Scatter } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { getWorldBankData, getCountries, getHappinessDataRange, getMultiCountryCorrelationData, calculateCorrelation, INDICATORS } from '../services/apiService'
import { CHART_COLORS } from '../utils/chartConfig'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const HappinessComparison = () => {
  const [selectedCountry, setSelectedCountry] = useState('IND') // Default to India
  const [selectedCountries, setSelectedCountries] = useState(['IND', 'USA', 'DEU', 'JPN', 'GBR']) // For multi-country analysis
  const [selectedIndicator, setSelectedIndicator] = useState('NY.GDP.PCAP.CD') // Default to GDP
  const [analysisMode, setAnalysisMode] = useState('time-series') // 'time-series' or 'correlation'
  const [startYear, setStartYear] = useState('2015')
  const [endYear, setEndYear] = useState('2023')
  const [correlationYear, setCorrelationYear] = useState(2022)
  const [countries, setCountries] = useState([])
  const [chartData, setChartData] = useState(null)
  const [correlationData, setCorrelationData] = useState(null)
  const [correlation, setCorrelation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const chartRef = useRef(null)

  // Generate minimal dummy data when API data is not available
  const generateDummyIndicatorData = (startYear, endYear, indicatorType) => {
    const years = []
    const data = []
    
    for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
      years.push(year)
      
      // Generate realistic dummy values based on indicator type
      let baseValue
      if (indicatorType === 'NY.GDP.PCAP.CD') {
        baseValue = 15000 + Math.random() * 25000 // GDP: 15k-40k range
      } else if (indicatorType.includes('SL.UEM')) {
        baseValue = 3 + Math.random() * 8 // Unemployment: 3-11% range
      } else if (indicatorType.includes('SI.POV')) {
        baseValue = 1 + Math.random() * 15 // Poverty: 1-16% range
      } else if (indicatorType === 'SP.DYN.LE00.IN') {
        baseValue = 65 + Math.random() * 15 // Life expectancy: 65-80 range
      } else {
        baseValue = 50 + Math.random() * 50 // Default: 50-100 range
      }
      
      // Add some variation year over year
      const variation = (Math.random() - 0.5) * 0.1 * baseValue
      data.push({ year, value: Math.max(0, baseValue + variation) })
    }
    
    return data
  }

  const generateDummyHappinessData = (startYear, endYear) => {
    const data = []
    const baseScore = 5.5 + Math.random() * 2 // Base happiness between 5.5-7.5
    
    for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
      const variation = (Math.random() - 0.5) * 0.8 // Small yearly variations
      const score = Math.max(1, Math.min(10, baseScore + variation))
      data.push({ year, score: parseFloat(score.toFixed(2)) })
    }
    
    return data
  }

  const generateDummyCorrelationData = (countries, indicatorType) => {
    return countries.map(countryCode => {
      const baseHappiness = 4 + Math.random() * 4 // Happiness 4-8 range
      
      let indicatorValue
      if (indicatorType === 'NY.GDP.PCAP.CD') {
        indicatorValue = 10000 + Math.random() * 40000
      } else if (indicatorType.includes('SL.UEM')) {
        indicatorValue = 2 + Math.random() * 12
      } else if (indicatorType.includes('SI.POV')) {
        indicatorValue = 0.5 + Math.random() * 20
      } else {
        indicatorValue = 20 + Math.random() * 80
      }
      
      return {
        countryCode,
        year: correlationYear,
        happiness: parseFloat(baseHappiness.toFixed(2)),
        [indicatorType]: parseFloat(indicatorValue.toFixed(2))
      }
    })
  }

  // Load countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await getCountries()
        setCountries(countriesData)
      } catch (err) {
        console.error('Error loading countries:', err)
        // Set fallback countries
        setCountries([
          { code: 'IND', name: 'India' },
          { code: 'USA', name: 'United States' },
          { code: 'CAN', name: 'Canada' },
          { code: 'GBR', name: 'United Kingdom' },
          { code: 'DEU', name: 'Germany' },
          { code: 'FRA', name: 'France' },
          { code: 'JPN', name: 'Japan' },
          { code: 'CHN', name: 'China' },
          { code: 'BRA', name: 'Brazil' },
          { code: 'AUS', name: 'Australia' }
        ])
      }
    }
    loadCountries()
  }, [])

  // Fetch and combine data based on analysis mode
  useEffect(() => {
    if (analysisMode === 'time-series') {
      fetchTimeSeriesData()
    } else if (analysisMode === 'correlation') {
      fetchCorrelationData()
    }
  }, [selectedCountry, selectedIndicator, analysisMode, startYear, endYear, selectedCountries, correlationYear, countries])

  const fetchTimeSeriesData = async () => {
    if (countries.length === 0) return
    
    setLoading(true)
    setError('')
    
    try {
      const countryName = countries.find(country => country.code === selectedCountry)?.name || selectedCountry
      
      // Fetch indicator data (GDP, unemployment, poverty, etc.)
      const indicatorData = await getWorldBankData(selectedCountry, selectedIndicator, parseInt(startYear), parseInt(endYear))
      
      // Fetch happiness data using the service
      const happinessData = await getHappinessDataRange(selectedCountry, parseInt(startYear), parseInt(endYear))

      // Use fallback dummy data if API data is not available
      let finalIndicatorData = indicatorData
      let finalHappinessData = happinessData
      let isUsingDummyData = false

      if (!indicatorData || indicatorData.length === 0) {
        finalIndicatorData = generateDummyIndicatorData(startYear, endYear, selectedIndicator)
        isUsingDummyData = true
      }

      if (!happinessData || happinessData.length === 0) {
        finalHappinessData = generateDummyHappinessData(startYear, endYear)
        isUsingDummyData = true
      }

      if (isUsingDummyData) {
        setError(`⚠️ Using sample data for demonstration purposes. ${!indicatorData || indicatorData.length === 0 ? INDICATORS.find(i => i.value === selectedIndicator)?.label + ' data' : ''} ${(!indicatorData || indicatorData.length === 0) && (!happinessData || happinessData.length === 0) ? ' and ' : ''} ${!happinessData || happinessData.length === 0 ? 'happiness data' : ''} not available for ${countryName}.`)
      } else {
        setError('')
      }

      // Align data by year
      const years = finalIndicatorData.map(item => item.year)
      const indicatorValues = finalIndicatorData.map(item => item.value)
      const happinessValues = finalHappinessData
        .filter(item => years.includes(item.year))
        .sort((a, b) => a.year - b.year)
        .map(item => item.score)

      // Create dual-axis chart configuration
      const chartConfig = {
        type: 'line',
        data: {
          labels: years,
          datasets: [
            {
              label: INDICATORS.find(i => i.value === selectedIndicator)?.label || 'Indicator',
              data: indicatorValues,
              borderColor: CHART_COLORS.primaryBorder,
              backgroundColor: CHART_COLORS.primary,
              borderWidth: 3,
              fill: false,
              tension: 0.1,
              pointRadius: 5,
              pointHoverRadius: 7,
              yAxisID: 'y'
            },
            {
              label: 'Happiness Score',
              data: happinessValues,
              borderColor: CHART_COLORS.secondaryBorder,
              backgroundColor: CHART_COLORS.secondary,
              borderWidth: 3,
              fill: false,
              tension: 0.1,
              pointRadius: 5,
              pointHoverRadius: 7,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            title: {
              display: true,
              text: `${INDICATORS.find(i => i.value === selectedIndicator)?.label} vs Happiness - ${countryName} (${startYear}-${endYear})`,
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.datasetIndex === 0) {
                    // Format based on indicator type
                    if (selectedIndicator === 'NY.GDP.PCAP.CD') {
                      label += '$' + context.parsed.y.toLocaleString();
                    } else if (selectedIndicator.includes('SL.UEM') || selectedIndicator.includes('SI.POV')) {
                      label += context.parsed.y.toFixed(2) + '%';
                    } else {
                      label += context.parsed.y.toLocaleString();
                    }
                  } else {
                    // Happiness score formatting
                    label += context.parsed.y.toFixed(2);
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Year'
              }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: INDICATORS.find(i => i.value === selectedIndicator)?.label || 'Indicator'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Happiness Score'
              },
              min: 0,
              max: 10,
              grid: {
                drawOnChartArea: false,
              },
            }
          }
        }
      }

      setChartData(chartConfig)
      setError('')
    } catch (err) {
      console.error('Error fetching time series data:', err)
      setError('Failed to load data. Please try again.')
      setChartData(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchCorrelationData = async () => {
    if (countries.length === 0 || selectedCountries.length === 0) return
    
    setLoading(true)
    setError('')
    
    try {
      const result = await getMultiCountryCorrelationData(
        selectedCountries, 
        [selectedIndicator], 
        correlationYear
      )
      
      // Filter out countries without complete data
      const completeData = result.filter(item => 
        item.happiness !== undefined && 
        item[selectedIndicator] !== undefined
      )
      
      // Use dummy data if insufficient real data
      let finalData = completeData
      let isUsingDummyData = false

      if (completeData.length < 3) {
        finalData = generateDummyCorrelationData(selectedCountries, selectedIndicator)
        isUsingDummyData = true
        setError(`⚠️ Using sample data for demonstration purposes. Insufficient real data available for correlation analysis (${completeData.length} countries with complete data).`)
      } else {
        setError('')
      }
      
      // Calculate correlation
      const xValues = finalData.map(item => item[selectedIndicator])
      const yValues = finalData.map(item => item.happiness)
      const corr = calculateCorrelation(xValues, yValues)
      setCorrelation(corr)
      
      // Create scatter plot
      const scatterData = {
        datasets: [{
          label: 'Countries',
          data: finalData.map(item => ({
            x: item[selectedIndicator],
            y: item.happiness,
            countryCode: item.countryCode
          })),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          pointRadius: 8,
          pointHoverRadius: 10
        }]
      }
      
      const scatterOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `${INDICATORS.find(i => i.value === selectedIndicator)?.label} vs Happiness (${correlationYear}) - Correlation: ${corr.toFixed(3)}`,
            font: { size: 16, weight: 'bold' },
            color: '#2d3748'
          },
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                const point = context.raw
                const countryName = countries.find(c => c.code === point.countryCode)?.name || point.countryCode
                return [
                  `Country: ${countryName}`,
                  `${INDICATORS.find(i => i.value === selectedIndicator)?.label}: ${point.x.toFixed(2)}`,
                  `Happiness Score: ${point.y.toFixed(2)}`
                ]
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: INDICATORS.find(i => i.value === selectedIndicator)?.label,
              font: { size: 14, weight: 'bold' },
              color: '#4a5568'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Happiness Score',
              font: { size: 14, weight: 'bold' },
              color: '#4a5568'
            },
            min: 0,
            max: 10
          }
        }
      }
      
      setCorrelationData({ data: scatterData, options: scatterOptions })
      setError('')
    } catch (err) {
      console.error('Error fetching correlation data:', err)
      setError('Failed to load correlation data. Please try again.')
      setCorrelationData(null)
      setCorrelation(null)
    } finally {
      setLoading(false)
    }
  }

  // Export chart as image
  const exportChart = () => {
    if (chartRef.current) {
      const chart = chartRef.current
      const url = chart.toBase64Image()
      const filename = analysisMode === 'time-series' 
        ? `${selectedIndicator.toLowerCase()}-happiness-comparison-${selectedCountry}-${startYear}-${endYear}.png`
        : `${selectedIndicator.toLowerCase()}-happiness-correlation-${correlationYear}.png`
      const link = document.createElement('a')
      link.download = filename
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getCorrelationInterpretation = (corr) => {
    if (!corr) return { text: 'N/A', color: '#718096' };
    const abs = Math.abs(corr);
    if (abs >= 0.7) return { text: 'Strong', color: corr > 0 ? '#38a169' : '#e53e3e' };
    if (abs >= 0.4) return { text: 'Moderate', color: corr > 0 ? '#68d391' : '#fc8181' };
    return { text: 'Weak', color: '#a0aec0' };
  };

  const correlationInfo = correlation ? getCorrelationInterpretation(correlation) : { text: 'N/A', color: '#718096' };

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
        }
        .export-btn:hover {
          background: #00838f;
        }
        .export-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
      
      <h2 style={{ margin: 0, marginBottom: '0.3rem', fontSize: '1.5rem', color: '#2d3748' }}>
        📈 {analysisMode === 'time-series' ? 'Happiness Indicator Analysis' : 'Multi-Country Correlation Analysis'}
      </h2>
      <p style={{ margin: 0, marginBottom: '0.5rem', color: '#4a5568', fontSize: '0.9rem' }}>
        {analysisMode === 'time-series' 
          ? 'Compare various indicators (GDP, poverty, unemployment) with happiness scores over time'
          : 'Analyze correlations between poverty/unemployment indicators and happiness across countries'
        }
      </p>
      <div style={{
        marginBottom: '1rem',
        padding: '0.5rem',
        backgroundColor: '#e7f3ff',
        borderRadius: 6,
        border: '1px solid #b3d9ff',
        fontSize: '0.8rem',
        color: '#0066cc'
      }}>
        <strong>📊 Data Availability:</strong> Happiness data is available for 35+ countries including India, USA, Germany, Japan, Canada, Australia, etc. 
        {analysisMode === 'correlation' && ' Correlation analysis requires at least 3 countries with complete data.'}
      </div>

      {/* Analysis Mode Toggle */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Analysis Mode:</span>
          <button
            onClick={() => setAnalysisMode('time-series')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: 4,
              border: '1px solid #cbd5e0',
              backgroundColor: analysisMode === 'time-series' ? '#3182ce' : '#ffffff',
              color: analysisMode === 'time-series' ? '#ffffff' : '#4a5568',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Time Series
          </button>
          <button
            onClick={() => setAnalysisMode('correlation')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: 4,
              border: '1px solid #cbd5e0',
              backgroundColor: analysisMode === 'correlation' ? '#3182ce' : '#ffffff',
              color: analysisMode === 'correlation' ? '#ffffff' : '#4a5568',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Correlation
          </button>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '1rem',
        margin: '0 0 1rem 0',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          
          {/* Indicator Selection */}
          <div className="form-group" style={{ minWidth: 200, flex: 1 }}>
            <label>Select Indicator:</label>
            <select
              value={selectedIndicator}
              onChange={(e) => setSelectedIndicator(e.target.value)}
              disabled={loading}
            >
              {INDICATORS.map(indicator => (
                <option key={indicator.value} value={indicator.value}>
                  {indicator.label}
                </option>
              ))}
            </select>
          </div>

          {analysisMode === 'time-series' ? (
            // Time series controls
            <>
              <div className="form-group" style={{ minWidth: 140, flex: 1 }}>
                <label>Select Country:</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  disabled={loading}
                >
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group" style={{ minWidth: 100, flex: 1 }}>
                <label>Start Year:</label>
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  disabled={loading}
                >
                  {Array.from({ length: 14 }, (_, i) => 2010 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group" style={{ minWidth: 100, flex: 1 }}>
                <label>End Year:</label>
                <select
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  disabled={loading}
                >
                  {Array.from({ length: 14 }, (_, i) => 2010 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            // Correlation analysis controls
            <div className="form-group" style={{ minWidth: 100, flex: 1 }}>
              <label>Year:</label>
              <select
                value={correlationYear}
                onChange={(e) => setCorrelationYear(parseInt(e.target.value))}
                disabled={loading}
              >
                {[2022, 2021, 2020, 2019, 2018].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <button 
          className="export-btn"
          onClick={exportChart}
          disabled={!(chartData || correlationData) || loading}
        >
          📸 Export Chart
        </button>
      </div>

      {/* Country Selection for Correlation Mode */}
      {analysisMode === 'correlation' && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
            Select Countries for Analysis ({selectedCountries.length} selected):
          </label>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.5rem',
            maxHeight: '120px',
            overflowY: 'auto',
            padding: '0.5rem',
            border: '1px solid #e2e8f0',
            borderRadius: 4,
            backgroundColor: '#f7fafc'
          }}>
            {countries.map(country => (
              <button
                key={country.code}
                onClick={() => {
                  setSelectedCountries(prev => 
                    prev.includes(country.code)
                      ? prev.filter(c => c !== country.code)
                      : [...prev, country.code]
                  );
                }}
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: 4,
                  border: '1px solid #cbd5e0',
                  backgroundColor: selectedCountries.includes(country.code) ? '#3182ce' : '#ffffff',
                  color: selectedCountries.includes(country.code) ? '#ffffff' : '#4a5568',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {country.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Correlation Stats for Correlation Mode */}
      {analysisMode === 'correlation' && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          padding: '0.8rem',
          backgroundColor: '#f7fafc',
          borderRadius: 6,
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2d3748' }}>
              {selectedCountries.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#718096' }}>Countries</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: correlationInfo.color }}>
              {correlation ? correlation.toFixed(3) : 'N/A'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#718096' }}>Correlation</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: correlationInfo.color }}>
              {correlationInfo.text}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#718096' }}>Strength</div>
          </div>
        </div>
      )}

      {error && (
        <div style={{ 
          color: error.includes('⚠️') ? '#d69e2e' : 'red', 
          backgroundColor: error.includes('⚠️') ? '#fef5e7' : '#fed7d7',
          border: error.includes('⚠️') ? '1px solid #d69e2e' : '1px solid #fc8181',
          borderRadius: '6px',
          padding: '0.8rem',
          marginBottom: '1rem', 
          fontSize: '0.9rem',
          lineHeight: 1.4
        }}>
          {error}
        </div>
      )}

      {/* Chart Area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#2d3748' }}>
          {analysisMode === 'time-series' ? 'Time Series Analysis' : 'Correlation Analysis'}
        </h3>
        {loading ? (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#4a5568'
          }}>
            Loading {analysisMode === 'time-series' ? 'time series' : 'correlation'} data...
          </div>
        ) : (analysisMode === 'time-series' ? chartData : correlationData) ? (
          <div style={{ height: '100%', flex: 1, minHeight: 0 }}>
            {analysisMode === 'time-series' ? (
              <Line ref={chartRef} {...chartData} />
            ) : (
              <Scatter ref={chartRef} {...correlationData} />
            )}
          </div>
        ) : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#718096',
            textAlign: 'center'
          }}>
            <p>📊 Select parameters to {analysisMode === 'time-series' ? 'compare indicators and happiness over time' : 'analyze correlations across countries'}</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              {analysisMode === 'time-series' 
                ? 'Dual-axis chart will show indicator trends on the left axis and happiness scores on the right axis'
                : 'Scatter plot will show correlation between selected indicator and happiness scores'
              }
            </p>
          </div>
        )}
      </div>

      {/* Analysis Panel */}
      {(chartData || correlationData) && !loading && (
        <div style={{
          marginTop: '1rem',
          padding: '0.8rem',
          backgroundColor: '#f8fafc',
          borderRadius: 6,
          border: '1px solid #e2e8f0',
          flexShrink: 0
        }}>
          <h4 style={{ margin: '0 0 0.3rem 0', color: '#2d3748', fontSize: '0.9rem' }}>
            💡 Analysis Insights
          </h4>
          <p style={{ margin: '0 0 0.5rem 0', color: '#4a5568', fontSize: '0.8rem', lineHeight: 1.4 }}>
            {analysisMode === 'time-series' 
              ? `This dual-axis chart compares ${INDICATORS.find(i => i.value === selectedIndicator)?.label} with citizen well-being (World Happiness Report scores). Look for correlations, divergences, or interesting patterns between the two metrics.`
              : `This scatter plot shows the correlation between ${INDICATORS.find(i => i.value === selectedIndicator)?.label} and happiness scores across ${selectedCountries.length} countries. ${correlation ? `Correlation coefficient: ${correlation.toFixed(3)} (${correlationInfo.text.toLowerCase()})` : ''}`
            }
          </p>
          <div style={{ 
            fontSize: '0.7rem', 
            color: '#718096',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '0.5rem',
            marginTop: '0.5rem'
          }}>
            <strong>Data Sources:</strong> {INDICATORS.find(i => i.value === selectedIndicator)?.label} - World Bank API | Happiness - World Happiness Report 2023
            {error && error.includes('⚠️') && (
              <span style={{ color: '#d69e2e', fontWeight: 'bold' }}> | ⚠️ Sample data used for demonstration</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default HappinessComparison
