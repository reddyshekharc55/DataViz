import React, { useState, useEffect, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import { getWorldBankData, getCountries, INDICATORS } from '../services/apiService'
import { getLineChartConfig, createTrendDataset, CHART_COLORS } from '../utils/chartConfig'

const CountryExplorer = () => {
  const [selectedCountry, setSelectedCountry] = useState('USA')
  const chartRef = useRef(null)
  // Export chart as PNG image (robust for all react-chartjs-2 versions)
  const exportChart = () => {
    let chart = null;
    if (chartRef.current) {
      // Try v4+ (chartRef.current.chart) and v2/v3 (chartRef.current)
      chart = chartRef.current.chart || chartRef.current;
    }
    if (chart && chart.toBase64Image) {
      try {
        const url = chart.toBase64Image();
        const filename = `${selectedCountry}-${selectedIndicator}-trend.png`;
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
  }
  const [selectedIndicator, setSelectedIndicator] = useState('NY.GDP.PCAP.CD')
  const [startYear, setStartYear] = useState('2015')
  const [endYear, setEndYear] = useState('2023')
  const [countries, setCountries] = useState([])
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Use INDICATORS from apiService if available, else fallback
  const indicators = INDICATORS || [
    { value: 'NY.GDP.PCAP.CD', label: 'GDP per Capita' },
    { value: 'SP.DYN.LE00.IN', label: 'Life Expectancy' },
    { value: 'SE.PRM.NENR', label: 'Education Index' },
    { value: 'SL.UEM.TOTL.ZS', label: 'Unemployment Rate' },
    { value: 'EN.ATM.CO2E.PC', label: 'CO2 Emissions per Capita' }
  ]

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
          { code: 'USA', name: 'United States' },
          { code: 'CAN', name: 'Canada' },
          { code: 'GBR', name: 'United Kingdom' },
          { code: 'DEU', name: 'Germany' },
          { code: 'FRA', name: 'France' },
          { code: 'JPN', name: 'Japan' },
          { code: 'IND', name: 'India' },
          { code: 'CHN', name: 'China' },
          { code: 'BRA', name: 'Brazil' },
          { code: 'AUS', name: 'Australia' }
        ])
      }
    }
    loadCountries()
  }, [])

  // Fetch chart data automatically when any selection changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getWorldBankData(selectedCountry, selectedIndicator, parseInt(startYear), parseInt(endYear))
        if (!data || data.length === 0) {
          setError('No data available for the selected parameters')
          setChartData(null)
          setLoading(false)
          return
        }
        const years = data.map(item => item.year)
        const values = data.map(item => item.value)
        const indicatorLabel = indicators.find(ind => ind.value === selectedIndicator)?.label || 'Indicator'
        const countryName = countries.find(country => country.code === selectedCountry)?.name || selectedCountry
        const dataset = createTrendDataset(
          `${indicatorLabel} - ${countryName}`,
          values,
          CHART_COLORS.primary,
          CHART_COLORS.primaryBorder
        )
        const config = getLineChartConfig(
          `${indicatorLabel} Trends for ${countryName} (${startYear}-${endYear})`,
          [dataset],
          years
        )
        setChartData(config)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch data. Please try again.')
        setChartData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedCountry, selectedIndicator, startYear, endYear])

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
      `}</style>
      <h2 style={{ margin: 0, marginBottom: '0.5rem', color: '#2d3748', fontSize: '1.5rem' }}>🌍 Country Explorer</h2>
      <p style={{ margin: 0, marginBottom: '1.5rem', color: '#4a5568' }}>Explore indicator trends for a selected country over a chosen time period</p>

      {/* Responsive horizontal dropdowns */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '1.2rem',
        margin: '1.5rem 0 2rem 0',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
      }}>
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
        <div className="form-group" style={{ minWidth: 140, flex: 1 }}>
          <label>Select Indicator:</label>
          <select
            value={selectedIndicator}
            onChange={(e) => setSelectedIndicator(e.target.value)}
            disabled={loading}
          >
            {indicators.map(indicator => (
              <option key={indicator.value} value={indicator.value}>{indicator.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ minWidth: 100, flex: 1 }}>
          <label>Start Year:</label>
          <select
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
          >
            {Array.from({ length: 14 }, (_, i) => 2010 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ minWidth: 100, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label>End Year:</label>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <select
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
            >
              {Array.from({ length: 14 }, (_, i) => 2010 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {/* Export Button - now next to End Year */}
            <button
              className="export-btn"
              onClick={exportChart}
              disabled={!chartData || loading}
              style={{
                padding: '0.5rem 1rem',
                background: '#0097a7',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: !chartData || loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                transition: 'background 0.2s',
                opacity: !chartData || loading ? 0.6 : 1
              }}
            >
              📸 Export Chart
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error" style={{ color: '#e53e3e', marginBottom: '1rem', backgroundColor: '#fed7d7', padding: '0.5rem', borderRadius: '4px', border: '1px solid #feb2b2' }}>
          {error}
        </div>
      )}

      <div className="chart-container" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>Trend Analysis</h3>
        {loading ? (
          <div className="loading" style={{ color: '#4a5568' }}>Loading chart data...</div>
        ) : chartData ? (
          <div style={{ height: '100%', flex: 1, minHeight: 0 }}>
            <Line ref={chartRef} {...chartData} />
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#718096', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            📊 Select options to visualize data for the selected country and indicator
          </p>
        )}
      </div>
    </div>
  )
}

export default CountryExplorer