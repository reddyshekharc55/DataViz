import React, { useState, useEffect, useRef } from "react";
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { getRegionalHappinessData, getRegionalHappinessTrend, getAvailableRegionalYears } from '../services/apiService'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
)

// Official World Bank regions with enhanced visual data
const WORLD_BANK_REGIONS = [
  {
    name: "East Asia & Pacific",
    description: "Countries spanning from East Asia to Pacific islands",
    countries: 37,
    emoji: "🌏",
    color: "#ff6b6b",
    lightColor: "#ffe0e0"
  },
  {
    name: "Europe & Central Asia", 
    description: "European nations and Central Asian republics",
    countries: 58,
    emoji: "🏰",
    color: "#4ecdc4",
    lightColor: "#e0f7f5"
  },
  {
    name: "Latin America & Caribbean",
    description: "South American countries and Caribbean nations", 
    countries: 42,
    emoji: "🌺",
    color: "#45b7d1",
    lightColor: "#e0f4fd"
  },
  {
    name: "Middle East & North Africa",
    description: "Countries spanning Middle East and North Africa",
    countries: 21,
    emoji: "🏜️",
    color: "#f9ca24",
    lightColor: "#fef9e0"
  },
  {
    name: "North America",
    description: "United States, Canada, and Mexico",
    countries: 3,
    emoji: "🍁",
    color: "#6c5ce7",
    lightColor: "#f0edff"
  },
  {
    name: "South Asia",
    description: "Indian subcontinent and surrounding nations",
    countries: 8,
    emoji: "🕌",
    color: "#fd79a8",
    lightColor: "#fde8f0"
  },
  {
    name: "Sub-Saharan Africa",
    description: "African countries south of the Sahara desert",
    countries: 48,
    emoji: "🦁",
    color: "#00b894",
    lightColor: "#e0f5f1"
  }
];

export default function RegionalAnalysis({ onRegionSelect }) {
  const [viewMode, setViewMode] = useState('happiness-aggregated'); // 'happiness-aggregated', 'happiness-trend'
  const [selectedYear, setSelectedYear] = useState(2022);
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2023);
  const [selectedRegionsForTrend, setSelectedRegionsForTrend] = useState(['South Asia', 'Europe & Central Asia', 'North America']);
  const [regionalHappinessData, setRegionalHappinessData] = useState([]);
  const [trendData, setTrendData] = useState({});
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chartRef = useRef(null);

  // Export chart function (Chart.js v2/v3/v4)
  const exportChart = (filename) => {
    let chart = null;
    if (chartRef.current) {
      chart = chartRef.current.chart || chartRef.current;
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
        alert('Export failed. Please try again.');
      }
    } else {
      alert('Chart instance not found. Export is not supported in this environment or Chart.js version.');
    }
  };

  // Load available years on component mount
  useEffect(() => {
    const loadAvailableYears = async () => {
      try {
        const years = await getAvailableRegionalYears()
        setAvailableYears(years)
        if (years.length > 0 && !years.includes(selectedYear)) {
          setSelectedYear(years[0])
        }
      } catch (error) {
        console.error('Error loading available years:', error)
        setError('Failed to load available years')
      }
    }
    loadAvailableYears()
  }, [])

  // Load regional aggregated data
  useEffect(() => {
    if (viewMode === 'happiness-aggregated') {
      loadRegionalHappinessData()
    }
  }, [selectedYear, viewMode])

  // Load trend data for selected regions
  useEffect(() => {
    if (viewMode === 'happiness-trend') {
      loadTrendData()
    }
  }, [selectedRegionsForTrend, startYear, endYear, viewMode])

  const loadRegionalHappinessData = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getRegionalHappinessData(selectedYear)
      setRegionalHappinessData(data)
    } catch (error) {
      console.error('Error loading regional happiness data:', error)
      setError('Failed to load regional happiness data')
    } finally {
      setLoading(false)
    }
  }

  const loadTrendData = async () => {
    setLoading(true)
    setError('')
    try {
      const trends = {}
      for (const region of selectedRegionsForTrend) {
        const data = await getRegionalHappinessTrend(region, startYear, endYear)
        trends[region] = data
      }
      setTrendData(trends)
    } catch (error) {
      console.error('Error loading trend data:', error)
      setError('Failed to load regional trend data')
    } finally {
      setLoading(false)
    }
  }

  const handleRegionToggleForTrend = (regionName) => {
    setSelectedRegionsForTrend(prev => {
      if (prev.includes(regionName)) {
        return prev.filter(r => r !== regionName)
      } else {
        return [...prev, regionName]
      }
    })
  }

  // Prepare chart data for aggregated happiness view
  const getAggregatedChartData = () => {
    if (!regionalHappinessData.length) return null

    return {
      labels: regionalHappinessData.map(d => [
        d.region,
        `(${d.totalCountries} countries)`
      ]),
      datasets: [
        {
          label: 'Average Happiness Score',
          data: regionalHappinessData.map(d => d.averageHappiness),
          backgroundColor: regionalHappinessData.map(d => d.lightColor),
          borderColor: regionalHappinessData.map(d => d.color),
          borderWidth: 2,
          borderRadius: 4
        }
      ]
    }
  }

  // Prepare chart data for trend view
  const getTrendChartData = () => {
    if (!Object.keys(trendData).length) return null

    // Get all years across all regions
    const allYears = new Set()
    Object.values(trendData).forEach(regionData => {
      regionData.forEach(point => allYears.add(point.year))
    })
    const sortedYears = Array.from(allYears).sort()

    const datasets = selectedRegionsForTrend.map((region, index) => {
      const regionInfo = WORLD_BANK_REGIONS.find(r => r.name === region)
      const data = sortedYears.map(year => {
        const yearData = trendData[region]?.find(d => d.year === year)
        return yearData ? yearData.averageHappiness : null
      })

      return {
        label: region,
        data: data,
        borderColor: regionInfo?.color || `hsl(${index * 60}, 70%, 50%)`,
        backgroundColor: regionInfo?.lightColor || `hsl(${index * 60}, 70%, 90%)`,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.1,
        spanGaps: true
      }
    })

    return {
      labels: sortedYears,
      datasets: datasets
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 11,
            weight: '600'
          },
          padding: 10
        }
      },
      title: {
        display: true,
        text: viewMode === 'happiness-aggregated' 
          ? `Regional Happiness Scores (${selectedYear})`
          : `Regional Happiness Trends (${startYear}-${endYear})`,
        font: {
          size: 14,
          weight: 'bold'
        },
        padding: 15
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          afterBody: (context) => {
            if (viewMode === 'happiness-aggregated') {
              const dataIndex = context[0].dataIndex
              const region = regionalHappinessData[dataIndex]
              return [
                `Countries: ${region.totalCountries}`,
                `Range: ${region.minHappiness.toFixed(2)} - ${region.maxHappiness.toFixed(2)}`
              ]
            }
            return []
          }
        }
      },
      datalabels: {
        display: viewMode === 'happiness-aggregated',
        anchor: 'end',
        align: 'top',
        color: '#2d3748',
        font: {
          weight: 'bold',
          size: 11
        },
        formatter: (value) => {
          return value ? value.toFixed(2) : ''
        },
        offset: 4
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: viewMode === 'happiness-aggregated' ? 3 : undefined,
        max: viewMode === 'happiness-aggregated' ? 8 : undefined,
        title: {
          display: true,
          text: 'Happiness Score',
          font: {
            size: 12,
            weight: '600'
          }
        },
        ticks: {
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        title: {
          display: true,
          text: viewMode === 'happiness-aggregated' ? 'Region' : 'Year',
          font: {
            size: 12,
            weight: '600'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 9
          },
          maxRotation: 0,
          minRotation: 0
        }
      }
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
      padding: '0.75rem',
      overflow: 'auto',
      background: '#ffffff',
      color: '#333'
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
      <h2 style={{ 
        margin: '0 0 0.25rem 0', 
        fontSize: '1.4rem',
        fontWeight: 700,
        color: '#2d3748'
      }}>
        🌍 Global Happiness Distribution by Region
      </h2>
      <p style={{ 
        margin: '0 0 0.5rem 0', 
        fontSize: '0.85rem',
        color: '#4a5568'
      }}>
        Visualize how happiness is distributed across different regions of the world
      </p>

      {/* View Mode Toggle */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>View Mode:</span>
          <button
            onClick={() => setViewMode('happiness-aggregated')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: 4,
              border: '1px solid #cbd5e0',
              backgroundColor: viewMode === 'happiness-aggregated' ? '#3182ce' : '#ffffff',
              color: viewMode === 'happiness-aggregated' ? '#ffffff' : '#4a5568',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            📊 Aggregated Happiness
          </button>
          <button
            onClick={() => setViewMode('happiness-trend')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: 4,
              border: '1px solid #cbd5e0',
              backgroundColor: viewMode === 'happiness-trend' ? '#3182ce' : '#ffffff',
              color: viewMode === 'happiness-trend' ? '#ffffff' : '#4a5568',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            📈 Happiness Trends
          </button>
        </div>
      </div>

      {/* Conditional Content Based on View Mode */}

      {/* Happiness Aggregated View */}
      {viewMode === 'happiness-aggregated' && (
        <>
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
              
              <div className="form-group" style={{ minWidth: 130, flex: 1 }}>
                <label>Select Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  disabled={loading}
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              background: '#fed7d7',
              color: '#c53030',
              padding: '0.5rem',
              borderRadius: '5px',
              marginBottom: '0.5rem',
              fontSize: '0.85rem'
            }}>
              {error}
            </div>
          )}

          {/* Chart Container */}
          <div style={{
            flex: 1,
            minHeight: 0,
            position: 'relative',
            background: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            padding: '0.5rem'
          }}>
            {loading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                fontSize: '1.1rem',
                color: '#4a5568'
              }}>
                Loading regional happiness data...
              </div>
            ) : (
              getAggregatedChartData() && (
                <Bar 
                  ref={chartRef}
                  data={getAggregatedChartData()}
                  options={chartOptions}
                />
              )
            )}
          </div>
          
          {/* Export Button for Aggregated View */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '0.5rem',
            marginBottom: '0.25rem'
          }}>
            <button
              className="export-btn"
              onClick={() => exportChart(`Regional-Happiness-Aggregated-${selectedYear}.png`)}
              disabled={loading || !getAggregatedChartData()}
              style={{
                padding: '0.4rem 0.8rem',
                background: loading || !getAggregatedChartData() ? '#ccc' : '#0097a7',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading || !getAggregatedChartData() ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '0.8rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading && getAggregatedChartData()) {
                  e.target.style.background = '#00838f';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && getAggregatedChartData()) {
                  e.target.style.background = '#0097a7';
                }
              }}
            >
              📸 Export Regional Happiness Chart
            </button>
          </div>
        </>
      )}

      {/* Happiness Trend View */}
      {viewMode === 'happiness-trend' && (
        <>
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
              
              <div className="form-group" style={{ minWidth: 130, flex: 1 }}>
                <label>Start Year:</label>
                <select
                  value={startYear}
                  onChange={(e) => {
                    const newStartYear = parseInt(e.target.value);
                    setStartYear(newStartYear);
                    // If end year is less than start year, update it
                    if (endYear < newStartYear) {
                      setEndYear(newStartYear);
                    }
                  }}
                  disabled={loading}
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group" style={{ minWidth: 130, flex: 1 }}>
                <label>End Year:</label>
                <select
                  value={endYear}
                  onChange={(e) => setEndYear(parseInt(e.target.value))}
                  disabled={loading}
                >
                  {availableYears
                    .filter(year => year >= startYear)
                    .map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Region Selection */}
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            background: '#f8fafc',
            borderRadius: '0.7rem',
            border: '1px solid #e2e8f0'
          }}>
            <label style={{ 
              fontWeight: '600', 
              color: '#2d3748', 
              marginBottom: '0.5rem', 
              display: 'block',
              fontSize: '0.9rem'
            }}>
              Select Regions:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {WORLD_BANK_REGIONS.map(region => (
                <button
                  key={region.name}
                  onClick={() => handleRegionToggleForTrend(region.name)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: 4,
                    border: '1px solid #cbd5e0',
                    backgroundColor: selectedRegionsForTrend.includes(region.name) ? '#3182ce' : '#ffffff',
                    color: selectedRegionsForTrend.includes(region.name) ? '#ffffff' : '#4a5568',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {region.emoji} {region.name}
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              background: '#fed7d7',
              color: '#c53030',
              padding: '0.5rem',
              borderRadius: '5px',
              marginBottom: '0.5rem',
              fontSize: '0.85rem'
            }}>
              {error}
            </div>
          )}

          {/* Chart Container */}
          <div style={{
            flex: 1,
            minHeight: 0,
            position: 'relative',
            background: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            padding: '0.5rem'
          }}>
            {loading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                fontSize: '1rem',
                color: '#4a5568'
              }}>
                Loading regional trend data...
              </div>
            ) : (
              getTrendChartData() && (
                <Line 
                  ref={chartRef}
                  data={getTrendChartData()}
                  options={chartOptions}
                />
              )
            )}
          </div>
          
          {/* Export Button for Trend View */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '0.5rem',
            marginBottom: '0.25rem'
          }}>
            <button
              className="export-btn"
              onClick={() => exportChart(`Regional-Happiness-Trends-${startYear}-${endYear}.png`)}
              disabled={loading || !getTrendChartData()}
              style={{
                padding: '0.4rem 0.8rem',
                background: loading || !getTrendChartData() ? '#ccc' : '#0097a7',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading || !getTrendChartData() ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '0.8rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading && getTrendChartData()) {
                  e.target.style.background = '#00838f';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && getTrendChartData()) {
                  e.target.style.background = '#0097a7';
                }
              }}
            >
              📸 Export Regional Happiness Trends Chart
            </button>
          </div>
        </>
      )}
    </div>
  );
}
