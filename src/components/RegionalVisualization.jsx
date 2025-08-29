import React, { useState, useRef, useEffect } from 'react'
import { Bar, Scatter } from 'react-chartjs-2'
import { getRegionalComparisonData, CSV_INDICATORS } from '../services/apiService'
import { getAllRegions } from '../utils/regionMapping'

const RegionalVisualization = () => {
  // State management
  const [selectedRegion, setSelectedRegion] = useState('Europe & Central Asia')
  const [selectedIndicator, setSelectedIndicator] = useState('Log GDP per capita')
  const [selectedYear, setSelectedYear] = useState(2023)
  const [countryData, setCountryData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availableYears, setAvailableYears] = useState([])

  // Chart refs for export functionality
  const barChartRef = useRef(null)
  const scatterChartRef = useRef(null)

  // Available regions from region mapping
  const regions = getAllRegions()

  // Available indicators from CSV data
  const indicators = CSV_INDICATORS

  // Function to get available years for selected region and indicator
  const getAvailableYears = async () => {
    if (!selectedRegion || !selectedIndicator) return

    try {
      // Check all possible years (2005-2023) based on actual CSV data range
      const possibleYears = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005]
      
      // Check all years in parallel for better performance
      const yearChecks = possibleYears.map(async (year) => {
        try {
          const data = await getRegionalComparisonData(selectedRegion, selectedIndicator, year)
          return data && data.length > 0 ? year : null
        } catch (error) {
          console.warn(`Error checking year ${year}:`, error)
          return null
        }
      })

      const results = await Promise.all(yearChecks)
      const yearsWithData = results.filter(year => year !== null)

      setAvailableYears(yearsWithData)
      
      // If current selected year is not available, select the first available year
      if (yearsWithData.length > 0 && !yearsWithData.includes(selectedYear)) {
        setSelectedYear(yearsWithData[0])
      }
    } catch (error) {
      console.error('Error checking available years:', error)
      // Fallback to recent years if check fails
      setAvailableYears([2023, 2022, 2021, 2020, 2019, 2018])
    }
  }

  // Update available years when region or indicator changes
  useEffect(() => {
    getAvailableYears()
  }, [selectedRegion, selectedIndicator])

  // Auto-load data when parameters change
  useEffect(() => {
    if (selectedRegion && selectedIndicator && selectedYear && availableYears.includes(selectedYear)) {
      loadCountryData()
    }
  }, [selectedRegion, selectedIndicator, selectedYear, availableYears])

  // Load data on component mount with default parameters
  useEffect(() => {
    // Initialize available years for default region and indicator
    getAvailableYears()
  }, []) // Empty dependency array means this runs once on mount

  // Load country data for selected region and indicator
  const loadCountryData = async () => {
    console.log('Loading data for:', { selectedRegion, selectedIndicator, selectedYear })
    setLoading(true)
    setError('')

    try {
      // Get regional comparison data using CSV indicators
      const comparisonData = await getRegionalComparisonData(
        selectedRegion, 
        selectedIndicator, 
        selectedYear
      )

      console.log('Received data:', comparisonData)
      
      // Since we pre-check data availability, this should always have data
      setCountryData(comparisonData)
    } catch (err) {
      console.error('Error loading country data:', err)
      setError('Failed to load country data. Please try again.')
      setCountryData([])
    } finally {
      setLoading(false)
    }
  }

  // Export chart functionality
  const exportChart = (chartRef, filename) => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image()
      const link = document.createElement('a')
      link.download = filename
      link.href = url
      link.click()
    }
  }

  // Prepare bar chart data
  const getBarChartData = () => {
    if (!countryData.length) return null

    return {
      data: {
        labels: countryData.map(country => country.countryName),
        datasets: [
          {
            label: 'Happiness Score',
            data: countryData.map(country => country.happiness),
            backgroundColor: '#0097a7',
            borderColor: '#00838f',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: `Happiness Scores - ${selectedRegion}`,
            font: { size: 14, weight: 'bold' }
          },
          tooltip: {
            enabled: true,
            displayColors: false,
            callbacks: {
              title: function(context) {
                return context[0].label
              },
              label: function(context) {
                return `Happiness Score: ${context.parsed.y.toFixed(2)}`
              }
            }
          },
          datalabels: {
            display: false // Hide data labels on bars
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            title: {
              display: true,
              text: 'Happiness Score'
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    }
  }

  // Prepare scatter chart data
  const getScatterChartData = () => {
    if (!countryData.length) return null

    return {
      data: {
        datasets: [
          {
            label: 'Countries',
            data: countryData.map(country => ({
              x: country.indicator,
              y: country.happiness,
              country: country.countryName
            })),
            backgroundColor: 'rgba(0, 151, 167, 0.7)',
            borderColor: '#0097a7',
            borderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: '#ff6b6b',
            pointHoverBorderColor: '#e53e3e',
            pointHoverBorderWidth: 2,
            showLine: false,
            pointStyle: 'circle'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          point: {
            radius: 5,
            hoverRadius: 8
          }
        },
        interaction: {
          intersect: false,
          mode: 'point'
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: `${getIndicatorLabel(selectedIndicator)} vs Happiness - ${selectedRegion}`,
            font: { size: 14, weight: 'bold' }
          },
          tooltip: {
            enabled: true,
            displayColors: false,
            filter: function(tooltipItem) {
              return true; // Only show on hover
            },
            callbacks: {
              title: function(context) {
                return context[0].raw.country
              },
              label: function(context) {
                return [
                  `${getIndicatorLabel(selectedIndicator)}: ${context.raw.x.toFixed(2)}`,
                  `Happiness Score: ${context.raw.y.toFixed(2)}`
                ]
              }
            }
          },
          datalabels: {
            display: false // Explicitly disable data labels
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: getIndicatorLabel(selectedIndicator)
            }
          },
          y: {
            title: {
              display: true,
              text: 'Happiness Score'
            },
            max: 10
          }
        }
      }
    }
  }

  // Get top performing countries
  const getTopCountries = () => {
    return countryData.slice(0, 5)
  }

  // Get indicator label from value
  const getIndicatorLabel = (indicatorValue) => {
    const indicator = indicators.find(ind => ind.value === indicatorValue)
    return indicator ? indicator.label : indicatorValue
  }

  const barChartData = getBarChartData()
  const scatterChartData = getScatterChartData()

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
        
        /* Mobile responsive styles */
        @media (max-width: 768px) {
          .form-group {
            min-width: 120px;
          }
          .form-group select {
            font-size: 0.95rem;
            padding: 0.4rem 1rem 0.4rem 0.6rem;
          }
          .form-group label {
            font-size: 0.9rem;
          }
          .export-btn {
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
            margin-top: 0.4rem;
          }
        }
        
        @media (max-width: 480px) {
          .form-group {
            min-width: 100%;
          }
          .form-group select {
            font-size: 0.9rem;
            padding: 0.4rem 0.8rem 0.4rem 0.5rem;
          }
          .form-group label {
            font-size: 0.85rem;
          }
          .export-btn {
            padding: 0.35rem 0.7rem;
            font-size: 0.85rem;
            width: 100%;
            margin-top: 0.3rem;
          }
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
        📊 Regional Country Comparison {loading && <span style={{ fontSize: '1rem', color: '#3182ce' }}>⏳</span>}
      </h2>
      <p style={{ margin: 0, marginBottom: '1rem', color: '#4a5568', fontSize: '0.85rem' }}>
        Compare countries within a region using happiness report indicators to see which are outperforming others
      </p>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        alignItems: 'flex-end'
      }}>
        {/* Region Selection */}
        <div className="form-group" style={{ minWidth: 180, flex: 1 }}>
          <label>🌎 Select Region</label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            {regions.map(region => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Indicator Selection */}
        <div className="form-group" style={{ minWidth: 180, flex: 1 }}>
          <label>📊 Select Indicator</label>
          <select
            value={selectedIndicator}
            onChange={(e) => setSelectedIndicator(e.target.value)}
          >
            {indicators.map(indicator => (
              <option key={indicator.value} value={indicator.value}>
                {indicator.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selection */}
        <div className="form-group" style={{ minWidth: 120, flex: 1 }}>
          <label>📅 Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            disabled={availableYears.length === 0}
          >
            {availableYears.length > 0 ? (
              availableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
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
      {countryData.length > 0 && (
        <div className="chart-container" style={{ 
          flex: 1, 
          overflow: 'auto', 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 0 
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>Comparison Analysis</h3>
          
          {/* Charts Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1rem',
            minHeight: '350px',
            marginBottom: '1rem'
          }}>
            {/* Bar Chart Container */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748', fontSize: '1rem' }}>
                📊 Happiness Rankings
              </h4>
              <div style={{ flex: 1, minHeight: 0 }}>
                {barChartData && (
                  <Bar 
                    ref={barChartRef}
                    {...barChartData} 
                  />
                )}
              </div>
              <button
                className="export-btn"
                onClick={() => exportChart(barChartRef, `${selectedRegion}-Happiness-Rankings-${selectedYear}.png`)}
              >
                📸 Export Chart
              </button>
            </div>

            {/* Scatter Chart Container */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748', fontSize: '1rem' }}>
                📈 Indicator Correlation
              </h4>
              <div style={{ flex: 1, minHeight: 0 }}>
                {scatterChartData && (
                  <Scatter 
                    ref={scatterChartRef}
                    {...scatterChartData} 
                  />
                )}
              </div>
              <button
                className="export-btn"
                onClick={() => exportChart(scatterChartRef, `${selectedRegion}-${getIndicatorLabel(selectedIndicator)}-Correlation-${selectedYear}.png`)}
              >
                📸 Export Chart
              </button>
            </div>
          </div>

          {/* Top Countries Table */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <h4 style={{ margin: '0 0 0.75rem 0', color: '#2d3748', fontSize: '1rem' }}>
              🏆 Top Performing Countries in {selectedRegion}
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: '0.9rem',
                tableLayout: 'fixed' // Fixed table layout prevents column shifting
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ 
                      padding: '0.5rem', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #e2e8f0', 
                      color: '#2d3748', 
                      fontWeight: '600',
                      width: '80px' // Fixed width for rank column
                    }}>
                      🏅 Rank
                    </th>
                    <th style={{ 
                      padding: '0.5rem', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #e2e8f0', 
                      color: '#2d3748', 
                      fontWeight: '600',
                      width: '40%' // Fixed percentage for country column
                    }}>
                      🌍 Country
                    </th>
                    <th style={{ 
                      padding: '0.5rem', 
                      textAlign: 'center', 
                      borderBottom: '1px solid #e2e8f0', 
                      color: '#2d3748', 
                      fontWeight: '600',
                      width: '100px' // Fixed width for happiness column
                    }}>
                      😊 Happiness
                    </th>
                    <th style={{ 
                      padding: '0.5rem', 
                      textAlign: 'center', 
                      borderBottom: '1px solid #e2e8f0', 
                      color: '#2d3748', 
                      fontWeight: '600',
                      width: 'auto', // Remaining space for indicator column
                      minWidth: '120px' // Minimum width to prevent text wrapping
                    }}>
                      📊 {getIndicatorLabel(selectedIndicator)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getTopCountries().map((country, index) => (
                    <tr key={country.countryName} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ 
                        padding: '0.5rem', 
                        color: '#4a5568',
                        width: '80px' // Fixed width matching header
                      }}>
                        <span style={{
                          background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#e2e8f0',
                          color: index < 3 ? '#2d3748' : '#4a5568',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '3px',
                          fontWeight: '600',
                          fontSize: '0.8rem'
                        }}>
                          #{index + 1}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '0.5rem', 
                        fontWeight: '600', 
                        color: '#2d3748',
                        width: '40%', // Fixed percentage matching header
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        <span title={country.countryName}>{country.countryName}</span>
                      </td>
                      <td style={{ 
                        padding: '0.5rem', 
                        textAlign: 'center', 
                        color: '#4a5568',
                        width: '100px' // Fixed width matching header
                      }}>
                        {country.happiness.toFixed(2)}
                      </td>
                      <td style={{ 
                        padding: '0.5rem', 
                        textAlign: 'center', 
                        color: '#4a5568',
                        width: 'auto', // Remaining space matching header
                        minWidth: '120px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        <span title={`${getIndicatorLabel(selectedIndicator)}: ${country.indicator.toFixed(2)}`}>
                          {country.indicator.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!countryData.length && !loading && !error && (!selectedRegion || !selectedIndicator || !selectedYear) && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#718096', 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
          <h3 style={{ color: '#2d3748', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
            Select Parameters to Begin Analysis
          </h3>
          <p style={{ color: '#4a5568', margin: 0, maxWidth: '400px' }}>
            Choose a region, happiness indicator, and year to compare countries and identify top performers
          </p>
        </div>
      )}
    </div>
  )
}

export default RegionalVisualization
