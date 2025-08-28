import React, { useState, useEffect } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { getRegionalData } from '../services/apiService'
import { getBarChartConfig, getDoughnutChartConfig, createBarDataset, CHART_COLORS, generateColorPalette } from '../utils/chartConfig'

const RegionalVisualization = () => {
  const [selectedYear, setSelectedYear] = useState('2023')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [regionalData, setRegionalData] = useState({})
  const [barChartData, setBarChartData] = useState(null)
  const [doughnutChartData, setDoughnutChartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'western_europe', label: 'Western Europe' },
    { value: 'north_america', label: 'North America' },
    { value: 'australia_new_zealand', label: 'Australia and New Zealand' },
    { value: 'middle_east_north_africa', label: 'Middle East and North Africa' },
    { value: 'latin_america_caribbean', label: 'Latin America and Caribbean' },
    { value: 'central_eastern_europe', label: 'Central and Eastern Europe' },
    { value: 'east_asia', label: 'East Asia' },
    { value: 'southeast_asia', label: 'Southeast Asia' },
    { value: 'south_asia', label: 'South Asia' },
    { value: 'sub_saharan_africa', label: 'Sub-Saharan Africa' }
  ]

  // Load regional data on component mount
  useEffect(() => {
    const loadRegionalData = async () => {
      try {
        const data = await getRegionalData(selectedYear)
        setRegionalData(data)
        createCharts(data)
      } catch (err) {
        console.error('Error loading regional data:', err)
        setError('Failed to load regional data')
      }
    }
    loadRegionalData()
  }, [selectedYear])

  const createCharts = (data) => {
    const regionNames = Object.keys(data)
    const averageScores = regionNames.map(region => data[region].averageScore)
    const countryCounts = regionNames.map(region => data[region].countries)

    // Create bar chart for average happiness scores
    const barDataset = createBarDataset(
      'Average Happiness Score',
      averageScores,
      generateColorPalette(regionNames.length)
    )

    const barConfig = getBarChartConfig(
      `Regional Happiness Scores (${selectedYear})`,
      [barDataset],
      regionNames.map(name => name.replace(/_/g, ' '))
    )

    // Create doughnut chart for country distribution
    const doughnutConfig = getDoughnutChartConfig(
      'Countries per Region',
      countryCounts,
      regionNames.map(name => name.replace(/_/g, ' '))
    )

    setBarChartData(barConfig)
    setDoughnutChartData(doughnutConfig)
  }

  const handleVisualize = async () => {
    setLoading(true)
    setError('')
    
    try {
      const data = await getRegionalData(selectedYear)
      setRegionalData(data)
      
      if (selectedRegion === 'all') {
        createCharts(data)
      } else {
        // Filter data for selected region
        const filteredData = {}
        if (data[selectedRegion]) {
          filteredData[selectedRegion] = data[selectedRegion]
          createCharts(filteredData)
        } else {
          // fallback: try matching with spaces (for legacy data)
          const regionKeyWithSpaces = selectedRegion.replace(/_/g, ' ');
          if (data[regionKeyWithSpaces]) {
            filteredData[regionKeyWithSpaces] = data[regionKeyWithSpaces];
            createCharts(filteredData);
          } else {
            setError('Selected region data not found.');
          }
        }
      }
    } catch (err) {
      console.error('Error visualizing data:', err)
      setError('Failed to visualize data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Get top performing regions
  const getTopRegions = () => {
    const regions = Object.entries(regionalData)
      .sort(([,a], [,b]) => b.averageScore - a.averageScore)
      .slice(0, 3)
    
    return regions
  }

  return (
    <div className="card">
      <h2>🗺️ Regional Visualization</h2>
      <p>Visualize happiness distribution across regions of the world</p>
      
      <div className="responsive-form-grid" style={{ margin: '2rem 0' }}>
        <div className="form-group">
          <label>Select Year:</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {Array.from({ length: 14 }, (_, i) => 2010 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        
      </div>

      <button 
        onClick={handleVisualize}
        className="responsive-button"
        style={{ background: 'linear-gradient(45deg, #4facfe, #00f2fe)' }}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Generate Regional View'}
      </button>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className="responsive-chart-grid" style={{ margin: '2rem 0' }}>
        <div className="chart-container">
          <h3>Regional Happiness Scores</h3>
          {loading ? (
            <div className="loading">Loading regional data...</div>
          ) : barChartData ? (
            <div style={{ height: '300px' }}>
              <Bar {...barChartData} />
            </div>
          ) : (
            <div className="viz-container" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              🌍 Regional Happiness Chart
            </div>
          )}
        </div>

        <div className="chart-container">
          <h3>Country Distribution</h3>
          {loading ? (
            <div className="loading">Loading distribution data...</div>
          ) : doughnutChartData ? (
            <div style={{ height: '300px' }}>
              <Doughnut {...doughnutChartData} />
            </div>
          ) : (
            <div className="viz-container" style={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            }}>
              📈 Country Distribution
            </div>
          )}
        </div>
      </div>

      <div className="chart-container">
        <h3>Regional Statistics</h3>
        {Object.keys(regionalData).length > 0 ? (
          <div className="responsive-grid" style={{ margin: '1rem 0' }}>
            {getTopRegions().map(([regionName, data], index) => (
              <div key={regionName} style={{ 
                textAlign: 'center', 
                padding: '1rem', 
                background: index === 0 ? '#e8f5e8' : index === 1 ? '#fff3e0' : '#e3f2fd', 
                borderRadius: '8px',
                borderLeft: `4px solid ${index === 0 ? '#43e97b' : index === 1 ? '#ff9800' : '#2196f3'}`
              }}>
                <h4 style={{ 
                  color: index === 0 ? '#2d5a2d' : index === 1 ? '#e65100' : '#1565c0', 
                  margin: '0 0 0.5rem 0' 
                }}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {regionName.replace(/_/g, ' ')}
                </h4>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
                  Avg: {data.averageScore}/10
                </p>
                <p style={{ margin: 0, color: '#666' }}>
                  {data.countries} countries
                </p>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                  Top: {data.topCountry}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="responsive-grid" style={{ margin: '1rem 0' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#667eea', margin: '0 0 0.5rem 0' }}>Happiest Region</h4>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Western Europe</p>
              <p style={{ margin: 0, color: '#666' }}>Avg: 7.2/10</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#667eea', margin: '0 0 0.5rem 0' }}>Most Improved</h4>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Central & Eastern Europe</p>
              <p style={{ margin: 0, color: '#666' }}>+0.8 since 2010</p>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#667eea', margin: '0 0 0.5rem 0' }}>Largest Spread</h4>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Sub-Saharan Africa</p>
              <p style={{ margin: 0, color: '#666' }}>Range: 3.2-6.1</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RegionalVisualization
