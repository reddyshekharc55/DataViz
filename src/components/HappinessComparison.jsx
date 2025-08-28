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
import { getWorldBankData, getCountriesFromCSV, getHappinessDataFromCSV, getMultiCountryCorrelationData, calculateCorrelation, getAvailableCorrelationYears, getAvailableTimeSeriesYears, getValidCorrelationYears, INDICATORS } from '../services/apiService'
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
  const [availableCorrelationYears, setAvailableCorrelationYears] = useState([])
  const [availableTimeSeriesYears, setAvailableTimeSeriesYears] = useState([])
  const [countries, setCountries] = useState([])
  const [chartData, setChartData] = useState(null)
  const [correlationData, setCorrelationData] = useState(null)
  const [correlation, setCorrelation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countrySearchTerm, setCountrySearchTerm] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const chartRef = useRef(null)

  // Filter countries based on search term
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
  )

  // Load countries and available correlation years on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load countries
        const countriesData = await getCountriesFromCSV()
        setCountries(countriesData)
      } catch (err) {
        console.error('Error loading data:', err)
        // Set fallback countries that are known to be in the CSV
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
    loadData()
  }, [])

  // Update available years when country changes (time series) or countries change (correlation)
  useEffect(() => {
    const updateAvailableYears = async () => {
      if (analysisMode === 'time-series' && selectedCountry && selectedIndicator && countries.length > 0) {
        try {
          const availableYears = await getAvailableTimeSeriesYears(selectedCountry, selectedIndicator)
          setAvailableTimeSeriesYears(availableYears)
          
          // Reset start and end year to available range
          if (availableYears.length > 0) {
            const minYear = Math.min(...availableYears)
            const maxYear = Math.max(...availableYears)
            setStartYear(minYear.toString())
            setEndYear(maxYear.toString())
          }
        } catch (err) {
          console.error('Error getting available years for country and indicator:', err)
          // Fallback to a reasonable range
          setAvailableTimeSeriesYears([2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023])
        }
      } else if (analysisMode === 'correlation' && selectedCountries.length > 0 && selectedIndicator) {
        try {
          const availableYears = await getValidCorrelationYears(selectedCountries, selectedIndicator)
          setAvailableCorrelationYears(availableYears)
          
          // Update correlation year if current one is not available
          if (availableYears.length > 0 && !availableYears.includes(correlationYear)) {
            setCorrelationYear(availableYears[0])
          }
        } catch (err) {
          console.error('Error getting available years for countries and indicator:', err)
          // Fallback to hardcoded years
          setAvailableCorrelationYears([2022, 2021, 2020, 2019, 2018])
        }
      }
    }
    
    updateAvailableYears()
  }, [selectedCountry, selectedCountries, selectedIndicator, analysisMode, countries])

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
      
      // Fetch happiness data from CSV
      const happinessData = await getHappinessDataFromCSV(selectedCountry, parseInt(startYear), parseInt(endYear))

      // Check if we have both types of data
      if ((!indicatorData || indicatorData.length === 0) && (!happinessData || happinessData.length === 0)) {
        setError(`No data available for ${countryName} in the selected time period.`)
        setChartData(null)
        setLoading(false)
        return
      }

      if (!indicatorData || indicatorData.length === 0) {
        setError(`${INDICATORS.find(i => i.value === selectedIndicator)?.label} data not available for ${countryName}.`)
        setChartData(null)
        setLoading(false)
        return
      }

      if (!happinessData || happinessData.length === 0) {
        setError(`Happiness data not available for ${countryName} in the selected time period.`)
        setChartData(null)
        setLoading(false)
        return
      }

      // Align data by year - find common years
      const indicatorYears = indicatorData.map(item => item.year)
      const happinessYears = happinessData.map(item => item.year)
      const commonYears = indicatorYears.filter(year => happinessYears.includes(year)).sort()

      if (commonYears.length === 0) {
        setError(`No overlapping data found for ${countryName} between ${startYear} and ${endYear}.`)
        setChartData(null)
        setLoading(false)
        return
      }

      // Filter data to common years
      const filteredIndicatorData = indicatorData.filter(item => commonYears.includes(item.year))
      const filteredHappinessData = happinessData.filter(item => commonYears.includes(item.year))

      const indicatorValues = filteredIndicatorData.map(item => item.value)
      const happinessValues = filteredHappinessData.map(item => item.score)

      // Create dual-axis chart configuration
      const chartConfig = {
        type: 'line',
        data: {
          labels: commonYears,
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
            },
            datalabels: {
              display: false
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
      
      if (completeData.length < 3) {
        setError(`Insufficient data available for correlation analysis. Only ${completeData.length} countries have complete data for ${correlationYear}.`)
        setCorrelationData(null)
        setCorrelation(null)
        setLoading(false)
        return
      }
      
      // Calculate correlation
      const xValues = completeData.map(item => item[selectedIndicator])
      const yValues = completeData.map(item => item.happiness)
      const corr = calculateCorrelation(xValues, yValues)
      setCorrelation(corr)
      
      // Create scatter plot
      const scatterData = {
        datasets: [{
          label: 'Countries',
          data: completeData.map(item => ({
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
          },
          datalabels: {
            display: false
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
        .custom-checkbox {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          width: 16px;
          height: 16px;
          border: 2px solid #4a5568;
          border-radius: 3px;
          background-color: #ffffff;
          cursor: pointer;
          position: relative;
          margin: 0;
          transition: all 0.2s ease;
        }
        .custom-checkbox:checked {
          background-color: #3182ce;
          border-color: #3182ce;
        }
        .custom-checkbox:checked::after {
          content: '✓';
          position: absolute;
          top: -2px;
          left: 1px;
          font-size: 12px;
          color: #ffffff;
          font-weight: bold;
          line-height: 1;
        }
        .custom-checkbox:hover {
          border-color: #3182ce;
          box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
        }
      `}</style>
      
      <h2 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1.4rem', color: '#2d3748' }}>
        😊 {analysisMode === 'time-series' ? 'Time Series: Indicator vs Happiness Trends' : 'Multi-Country Correlation Analysis'}
      </h2>
      <p style={{ margin: 0, marginBottom: '0.5rem', color: '#4a5568', fontSize: '0.85rem' }}>
        {analysisMode === 'time-series' 
          ? 'Compare key indicators (GDP per capita, life expectancy, unemployment, emissions, education) with happiness scores over time'
          : 'Analyze correlations between economic, social & environmental indicators and happiness across multiple countries'
        }
      </p>

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

      {/* Selected Countries Display for Correlation Mode */}
      {analysisMode === 'correlation' && (
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '0.5rem 0.75rem',
          margin: '0 0 0.5rem 0'
        }}>
          <div style={{ 
            fontSize: '0.8rem', 
            fontWeight: 'bold', 
            color: '#4a5568', 
            marginBottom: selectedCountries.length > 0 ? '0.4rem' : '0'
          }}>
            Selected Countries ({selectedCountries.length}):
            {availableCorrelationYears.length > 0 && (
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 'normal', 
                color: '#718096',
                marginLeft: '0.5rem'
              }}>
                • {availableCorrelationYears.length} valid year{availableCorrelationYears.length !== 1 ? 's' : ''} available
              </span>
            )}
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.4rem',
            maxHeight: selectedCountries.length > 8 ? '60px' : 'auto',
            overflow: selectedCountries.length > 8 ? 'auto' : 'visible'
          }}>
            {selectedCountries.map(countryCode => {
              const country = countries.find(c => c.code === countryCode)
              return (
                <span
                  key={countryCode}
                  style={{
                    backgroundColor: '#3182ce',
                    color: '#ffffff',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  {country?.name || countryCode}
                  <button
                    onClick={() => {
                      setSelectedCountries(selectedCountries.filter(code => code !== countryCode))
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer',
                      padding: '0',
                      fontSize: '0.9rem',
                      lineHeight: '1',
                      opacity: 0.8
                    }}
                    title={`Remove ${country?.name || countryCode}`}
                  >
                    ×
                  </button>
                </span>
              )
            })}
            {selectedCountries.length === 0 && (
              <span style={{ 
                color: '#a0aec0', 
                fontStyle: 'italic',
                fontSize: '0.75rem' 
              }}>
                No countries selected. Use the searchable dropdown below to select multiple countries for correlation analysis.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Current Selection Display for Time Series Mode */}
      {analysisMode === 'time-series' && (
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '4px',
          padding: '0.5rem 0.75rem',
          margin: '0 0 0.75rem 0',
          fontSize: '0.8rem',
          color: '#0369a1'
        }}>
          <strong>Analyzing:</strong> {countries.find(c => c.code === selectedCountry)?.name || selectedCountry} | 
          <strong> Indicator:</strong> {INDICATORS.find(i => i.value === selectedIndicator)?.label || selectedIndicator}
          {availableTimeSeriesYears.length > 0 && (
            <span style={{ marginLeft: '0.5rem' }}>
              | <strong>Available Years:</strong> {availableTimeSeriesYears.length} ({Math.min(...availableTimeSeriesYears)}-{Math.max(...availableTimeSeriesYears)})
            </span>
          )}
        </div>
      )}

      {/* Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '0.75rem',
        margin: '0 0 0.5rem 0',
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
                  onChange={(e) => {
                    const newStartYear = e.target.value;
                    setStartYear(newStartYear);
                    // If end year is less than start year, update it
                    if (parseInt(endYear) < parseInt(newStartYear)) {
                      setEndYear(newStartYear);
                    }
                  }}
                  disabled={loading}
                >
                  {availableTimeSeriesYears.map(year => (
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
                  {availableTimeSeriesYears
                    .filter(year => year >= parseInt(startYear))
                    .map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            // Correlation analysis controls
            <>
              <div className="form-group" style={{ minWidth: 200, flex: 1, position: 'relative' }}>
                <label>Select Countries:</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder={`${selectedCountries.length} countries selected - click to change`}
                    value={countrySearchTerm}
                    onChange={(e) => setCountrySearchTerm(e.target.value)}
                    onFocus={() => setShowCountryDropdown(true)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 1.2rem 0.5rem 0.7rem',
                      border: showCountryDropdown ? '1.5px solid #3182ce' : '1.5px solid #b3b3b3',
                      borderRadius: '0.7rem',
                      fontSize: '1.08rem',
                      backgroundColor: '#f8fafc',
                      color: '#222',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border 0.2s, box-shadow 0.2s',
                      boxShadow: showCountryDropdown ? '0 0 0 2px #90cdf4' : '0 1px 4px 0 rgba(60,60,60,0.04)'
                    }}
                  />
                  
                  {/* Dropdown with checkboxes */}
                  {showCountryDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                      {/* Select All / Clear All buttons */}
                      <div style={{
                        padding: '0.5rem',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        gap: '0.5rem'
                      }}>
                        <button
                          onClick={() => {
                            const allCodes = countries.map(c => c.code)
                            setSelectedCountries(allCodes)
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.7rem',
                            background: '#e2e8f0',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => setSelectedCountries([])}
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.7rem',
                            background: '#fed7d7',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          Clear All
                        </button>
                      </div>
                      
                      {filteredCountries.map(country => (
                        <div
                          key={country.code}
                          style={{
                            padding: '0.5rem',
                            borderBottom: '1px solid #f7fafc',
                            cursor: 'pointer',
                            backgroundColor: selectedCountries.includes(country.code) ? '#ebf8ff' : '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                          onClick={() => {
                            if (selectedCountries.includes(country.code)) {
                              setSelectedCountries(selectedCountries.filter(code => code !== country.code))
                            } else {
                              setSelectedCountries([...selectedCountries, country.code])
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            className="custom-checkbox"
                            checked={selectedCountries.includes(country.code)}
                            onChange={() => {}} // Handled by parent onClick
                          />
                          <span style={{ fontSize: '0.8rem', color: '#2d3748' }}>
                            {country.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group" style={{ minWidth: 100, flex: 1 }}>
                <label>Year:</label>
                <select
                  value={correlationYear}
                  onChange={(e) => setCorrelationYear(parseInt(e.target.value))}
                  disabled={loading}
                >
                  {availableCorrelationYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </>
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

      {/* Close dropdown when clicking outside */}
      {showCountryDropdown && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowCountryDropdown(false)}
        />
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
        <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', color: '#2d3748' }}>
          {analysisMode === 'time-series' ? 'Dual-Axis Time Series Visualization' : 'Correlation Scatter Plot Analysis'}
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
            <p>📊 Select parameters to {analysisMode === 'time-series' ? 'compare indicator trends with happiness over time' : 'analyze cross-country correlations'}</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              {analysisMode === 'time-series' 
                ? 'Interactive dual-axis chart with smart year filtering - indicator trends on left axis, happiness scores on right'
                : 'Enhanced country selection with searchable dropdown, checkboxes, and real-time correlation calculation'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HappinessComparison
