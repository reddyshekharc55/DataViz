import React, { useState, useEffect, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import { getWorldBankData, getCountries, getHappinessDataRange } from '../services/apiService'
import { CHART_COLORS } from '../utils/chartConfig'

const HappinessComparison = () => {
  const [selectedCountry, setSelectedCountry] = useState('IND') // Default to India
  const [startYear, setStartYear] = useState('2015')
  const [endYear, setEndYear] = useState('2023')
  const [countries, setCountries] = useState([])
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const chartRef = useRef(null)

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

  // Fetch and combine GDP and happiness data
  useEffect(() => {
    const fetchComparisonData = async () => {
      setLoading(true)
      setError('')
      
      try {
        const countryName = countries.find(country => country.code === selectedCountry)?.name || selectedCountry
        
        // Fetch GDP data
        const gdpData = await getWorldBankData(selectedCountry, 'NY.GDP.PCAP.CD', parseInt(startYear), parseInt(endYear))
        
        // Fetch happiness data using the service
        const happinessData = await getHappinessDataRange(selectedCountry, parseInt(startYear), parseInt(endYear))

        if (!gdpData || gdpData.length === 0) {
          setError('No GDP data available for the selected parameters')
          setChartData(null)
          setLoading(false)
          return
        }

        if (!happinessData || happinessData.length === 0) {
          setError(`No happiness data available for ${countryName}. This country is not included in the World Happiness Report dataset. Please try a different country like India, USA, Germany, Japan, or other major countries.`)
          setChartData(null)
          setLoading(false)
          return
        }

        // Align data by year
        const years = gdpData.map(item => item.year)
        const gdpValues = gdpData.map(item => item.value)
        const happinessValues = happinessData
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
                label: 'GDP per Capita (USD)',
                data: gdpValues,
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
                text: `GDP vs Happiness Comparison - ${countryName} (${startYear}-${endYear})`,
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
                      // GDP formatting
                      label += '$' + context.parsed.y.toLocaleString();
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
                  text: 'GDP per Capita (USD)',
                  color: CHART_COLORS.primaryBorder
                },
                ticks: {
                  callback: function(value) {
                    return '$' + value.toLocaleString();
                  },
                  color: CHART_COLORS.primaryBorder
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Happiness Score (1-10)',
                  color: CHART_COLORS.secondaryBorder
                },
                ticks: {
                  color: CHART_COLORS.secondaryBorder,
                  min: 0,
                  max: 10
                },
                grid: {
                  drawOnChartArea: false,
                },
              }
            }
          }
        }

        setChartData(chartConfig)
      } catch (err) {
        console.error('Error fetching comparison data:', err)
        setError('Failed to fetch data. Please try again.')
        setChartData(null)
      } finally {
        setLoading(false)
      }
    }

    if (countries.length > 0) {
      fetchComparisonData()
    }
  }, [selectedCountry, startYear, endYear, countries])

  // Export chart as image
  const exportChart = () => {
    if (chartRef.current) {
      const chart = chartRef.current
      const url = chart.toBase64Image()
      const link = document.createElement('a')
      link.download = `gdp-happiness-comparison-${selectedCountry}-${startYear}-${endYear}.png`
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
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
      
      <h2 style={{ margin: 0, marginBottom: '0.3rem', fontSize: '1.5rem', color: '#2d3748' }}>📈 GDP vs Happiness Comparison</h2>
      <p style={{ margin: 0, marginBottom: '0.5rem', color: '#4a5568', fontSize: '0.9rem' }}>
        Compare GDP per capita (World Bank API) and happiness scores (World Happiness Report data) over time
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
        If data is not available for your selected country, please choose a different one.
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
        </div>
        
        <button 
          className="export-btn"
          onClick={exportChart}
          disabled={!chartData || loading}
        >
          📸 Export Chart
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Chart Area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Dual-Axis Comparison</h3>
        {loading ? (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#666'
          }}>
            Loading comparison data...
          </div>
        ) : chartData ? (
          <div style={{ height: '100%', flex: 1, minHeight: 0 }}>
            <Line ref={chartRef} {...chartData} />
          </div>
        ) : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#666',
            textAlign: 'center'
          }}>
            <p>📊 Select parameters to compare GDP and happiness data</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Dual-axis chart will show GDP trends on the left axis and happiness scores on the right axis
            </p>
          </div>
        )}
      </div>

      {/* Analysis Panel */}
      {chartData && !loading && (
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
            This dual-axis chart compares economic prosperity (GDP from World Bank) with citizen well-being (World Happiness Report scores). 
            The happiness data is based on actual World Happiness Report 2023 rankings with realistic projections for other years.
            Look for correlations, divergences, or interesting patterns between the two metrics.
          </p>
          <div style={{ 
            fontSize: '0.7rem', 
            color: '#718096',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '0.5rem',
            marginTop: '0.5rem'
          }}>
            <strong>Data Sources:</strong> GDP - World Bank API | Happiness - World Happiness Report 2023
          </div>
        </div>
      )}
    </div>
  )
}

export default HappinessComparison
