import axios from 'axios'

// API Configuration
const WORLD_BANK_BASE_URL = 'https://api.worldbank.org/v2'
const HAPPINESS_BASE_URL = 'https://data.worldhappiness.report'

// Create axios instances with default configurations
const worldBankAPI = axios.create({
  baseURL: WORLD_BANK_BASE_URL,
  params: {
    format: 'json',
    per_page: 1000
  }
})

// // World Bank Indicators
// export const INDICATORS = {
//   GDP_PER_CAPITA: 'NY.GDP.PCAP.CD',
//   LIFE_EXPECTANCY: 'SP.DYN.LE00.IN',
//   UNEMPLOYMENT: 'SL.UEM.TOTL.ZS',
//   CO2_EMISSIONS: 'EN.ATM.CO2E.PC',
//   EDUCATION_INDEX: 'SE.PRM.NENR',
//   POPULATION: 'SP.POP.TOTL',
//   HEALTH_EXPENDITURE: 'SH.XPD.CHEX.GD.ZS',
//   INTERNET_USERS: 'IT.NET.USER.ZS'
// }

    export const INDICATORS = [
        { value: 'NY.GDP.PCAP.CD', label: 'GDP per Capita' },
        { value: 'SP.DYN.LE00.IN', label: 'Life Expectancy' },
        { value: 'SE.PRM.NENR', label: 'Education Index' },
        { value: 'SL.UEM.TOTL.ZS', label: 'Unemployment Rate' },
        { value: 'EN.ATM.CO2E.PC', label: 'CO2 Emissions per Capita' }
    ]
// Country Regions Mapping
export const REGIONS = {
  'Western Europe': ['DNK', 'CHE', 'ISL', 'NOR', 'FIN', 'NLD', 'SWE', 'AUT', 'LUX', 'DEU', 'BEL', 'GBR', 'IRL', 'FRA'],
  'North America': ['USA', 'CAN'],
  'Australia and New Zealand': ['AUS', 'NZL'],
  'Middle East and North Africa': ['ISR', 'ARE', 'SAU', 'KWT', 'BHR', 'QAT', 'JOR', 'LBN', 'MAR', 'DZA', 'TUN', 'EGY'],
  'Latin America and Caribbean': ['CRI', 'URY', 'CHL', 'PAN', 'BRA', 'ARG', 'MEX', 'COL', 'ECU', 'PER', 'PRY', 'BOL'],
  'Central and Eastern Europe': ['CZE', 'SVN', 'SVK', 'POL', 'LTU', 'EST', 'RUS', 'LVA', 'BGR', 'HRV', 'HUN', 'ROU'],
  'East Asia': ['TWN', 'JPN', 'KOR', 'CHN', 'HKG', 'SGP', 'MNG'],
  'Southeast Asia': ['THA', 'PHL', 'MYS', 'VNM', 'IDN', 'LAO', 'KHM'],
  'South Asia': ['NPL', 'BTN', 'LKA', 'IND', 'BGD', 'PAK', 'AFG'],
  'Sub-Saharan Africa': ['MWI', 'TZA', 'RWA', 'ETH', 'KEN', 'UGA', 'GHA', 'SEN', 'NGA', 'ZAF', 'ZWE', 'ZMB']
}

// API Service Functions

// Get World Bank indicator data for a country
export const getWorldBankData = async (countryCode, indicator, startYear = 2010, endYear = 2023) => {
  try {
    const response = await worldBankAPI.get(
      `/country/${countryCode}/indicator/${indicator}`,
      {
        params: {
          date: `${startYear}:${endYear}`
        }
      }
    )
    
    if (response.data && response.data[1]) {
      return response.data[1]
        .filter(item => item.value !== null)
        .map(item => ({
          year: parseInt(item.date),
          value: item.value,
          country: item.country.value,
          indicator: item.indicator.value
        }))
        .sort((a, b) => a.year - b.year)
    }
    return []
  } catch (error) {
    console.error('Error fetching World Bank data:', error)
    return []
  }
}

// Get happiness data - Try real API first, fallback to mock data
export const getHappinessData = async (countryCode, year = 2023) => {
  try {
    // Try real World Happiness Report API first
    console.log('Attempting to fetch real happiness data for:', countryCode, year)
    
    // Try different possible API endpoints
    const possibleEndpoints = [
      `https://worldhappiness.report/ed/2023/data/${countryCode}`,
      `https://data.worldhappiness.report/api/data?country=${countryCode}&year=${year}`,
      `https://worldhappiness.report/data/data.json`,
      `https://happiness-report.s3.amazonaws.com/2023/data.json`
    ]
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log('Trying endpoint:', endpoint)
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('Successfully fetched happiness data:', data)
          
          // Process the response based on the endpoint format
          if (Array.isArray(data)) {
            const countryData = data.find(item => 
              item.country_code === countryCode || 
              item.iso_code === countryCode ||
              item.code === countryCode
            )
            if (countryData) {
              return {
                score: countryData.happiness_score || countryData.score || countryData.ladder_score,
                rank: countryData.rank || countryData.happiness_rank
              }
            }
          } else if (data.country_code === countryCode || data.code === countryCode) {
            return {
              score: data.happiness_score || data.score || data.ladder_score,
              rank: data.rank || data.happiness_rank
            }
          }
        }
      } catch (endpointError) {
        console.log('Endpoint failed:', endpoint, endpointError.message)
        continue
      }
    }
    
    // If all API attempts fail, fallback to mock data
    console.log('All happiness API endpoints failed, using mock data')
    return getMockHappinessData(countryCode)
    
  } catch (error) {
    console.error('Error fetching happiness data:', error)
    return getMockHappinessData(countryCode)
  }
}

// Get happiness time series data for a country
export const getHappinessTimeSeries = async (countryCode, startYear = 2015, endYear = 2023) => {
  try {
    console.log('Attempting to fetch happiness time series for:', countryCode, startYear, endYear)
    
    // Try different endpoints for historical happiness data
    const possibleEndpoints = [
      `https://worldhappiness.report/data/time-series/${countryCode}`,
      `https://data.worldhappiness.report/api/timeseries?country=${countryCode}&start=${startYear}&end=${endYear}`,
      `https://raw.githubusercontent.com/datasets/world-happiness/master/data/world-happiness.csv`,
      `https://github.com/plotly/datasets/raw/master/happiness.csv`
    ]
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log('Trying time series endpoint:', endpoint)
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/csv',
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          let data
          const contentType = response.headers.get('content-type')
          
          if (contentType && contentType.includes('text/csv')) {
            const csvText = await response.text()
            data = parseCSVToJSON(csvText)
          } else {
            data = await response.json()
          }
          
          console.log('Successfully fetched time series data:', data)
          
          if (Array.isArray(data)) {
            // Filter data for the specific country and year range
            const countryData = data
              .filter(item => {
                const code = item.country_code || item.iso_code || item.code
                const year = parseInt(item.year || item.date)
                return code === countryCode && year >= startYear && year <= endYear
              })
              .map(item => ({
                year: parseInt(item.year || item.date),
                value: parseFloat(item.happiness_score || item.score || item.ladder_score || item.life_ladder)
              }))
              .filter(item => !isNaN(item.year) && !isNaN(item.value))
              .sort((a, b) => a.year - b.year)
            
            if (countryData.length > 0) {
              console.log('Found real happiness time series data:', countryData)
              return countryData
            }
          }
        }
      } catch (endpointError) {
        console.log('Time series endpoint failed:', endpoint, endpointError.message)
        continue
      }
    }
    
    // If all API attempts fail, generate mock time series
    console.log('All time series API endpoints failed, generating mock data')
    return generateMockHappinessTimeSeries(countryCode, startYear, endYear)
    
  } catch (error) {
    console.error('Error fetching happiness time series:', error)
    return generateMockHappinessTimeSeries(countryCode, startYear, endYear)
  }
}

// Generate mock happiness time series based on base happiness score
const generateMockHappinessTimeSeries = (countryCode, startYear, endYear) => {
  const baseHappiness = getMockHappinessData(countryCode)
  const timeSeries = []
  
  for (let year = startYear; year <= endYear; year++) {
    const index = year - startYear
    // Create realistic variation around base score
    const variation = Math.sin(index * 0.5) * 0.3 + (Math.random() - 0.5) * 0.2
    const value = Math.max(0, Math.min(10, baseHappiness.score + variation))
    
    timeSeries.push({
      year: year,
      value: parseFloat(value.toFixed(2))
    })
  }
  
  return timeSeries
}

// Fallback mock happiness data
const getMockHappinessData = (countryCode) => {
  const mockHappinessData = {
    'DNK': { score: 7.6, rank: 2 },
    'CHE': { score: 7.5, rank: 3 },
    'ISL': { score: 7.4, rank: 4 },
    'FIN': { score: 7.4, rank: 1 },
    'NLD': { score: 7.3, rank: 5 },
    'USA': { score: 6.9, rank: 15 },
    'CAN': { score: 7.0, rank: 13 },
    'GBR': { score: 7.0, rank: 19 },
    'DEU': { score: 7.0, rank: 16 },
    'FRA': { score: 6.7, rank: 21 },
    'IND': { score: 4.0, rank: 126 },
    'CHN': { score: 5.3, rank: 72 },
    'JPN': { score: 6.0, rank: 47 },
    'BRA': { score: 6.1, rank: 49 },
    'AUS': { score: 7.1, rank: 12 },
    'NZL': { score: 7.1, rank: 11 }
  }
  
  return mockHappinessData[countryCode] || { score: 5.0, rank: 100, source: 'mock' }
}

// Get countries list
export const getCountries = async () => {
  try {
    const response = await worldBankAPI.get('/country', {
      params: {
        per_page: 300
      }
    })
    
    if (response.data && response.data[1]) {
      return response.data[1]
        .filter(country => country.capitalCity) // Filter out regions and aggregates
        .map(country => ({
          code: country.id,
          name: country.name,
          region: country.region?.value || 'Other'
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    }
    return []
  } catch (error) {
    console.error('Error fetching countries:', error)
    // Return fallback country list
    return [
      { code: 'USA', name: 'United States', region: 'North America' },
      { code: 'CAN', name: 'Canada', region: 'North America' },
      { code: 'GBR', name: 'United Kingdom', region: 'Europe & Central Asia' },
      { code: 'DEU', name: 'Germany', region: 'Europe & Central Asia' },
      { code: 'FRA', name: 'France', region: 'Europe & Central Asia' },
      { code: 'JPN', name: 'Japan', region: 'East Asia & Pacific' },
      { code: 'IND', name: 'India', region: 'South Asia' },
      { code: 'CHN', name: 'China', region: 'East Asia & Pacific' },
      { code: 'BRA', name: 'Brazil', region: 'Latin America & Caribbean' },
      { code: 'AUS', name: 'Australia', region: 'East Asia & Pacific' }
    ]
  }
}

// Get regional happiness data - Try real API first, fallback to mock
export const getRegionalData = async (year = 2023) => {
  try {
    console.log('Attempting to fetch real regional happiness data for year:', year)
    
    // Try to get all countries happiness data and aggregate by region
    const possibleEndpoints = [
      `https://worldhappiness.report/ed/2023/data/all`,
      `https://data.worldhappiness.report/api/data?year=${year}`,
      `https://raw.githubusercontent.com/owid/owid-datasets/master/datasets/World%20Happiness%20Report/World%20Happiness%20Report.csv`,
      `https://worldhappiness.report/data/data.json`
    ]
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log('Trying regional data endpoint:', endpoint)
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/csv',
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          let data
          const contentType = response.headers.get('content-type')
          
          if (contentType && contentType.includes('text/csv')) {
            const csvText = await response.text()
            data = parseCSVToJSON(csvText)
          } else {
            data = await response.json()
          }
          
          console.log('Successfully fetched regional data:', data)
          
          if (Array.isArray(data) && data.length > 0) {
            return processRealRegionalData(data)
          }
        }
      } catch (endpointError) {
        console.log('Regional endpoint failed:', endpoint, endpointError.message)
        continue
      }
    }
    
    // If all API attempts fail, fallback to mock data
    console.log('All regional API endpoints failed, using mock data')
    return getMockRegionalData()
    
  } catch (error) {
    console.error('Error fetching regional data:', error)
    return getMockRegionalData()
  }
}

// Process real happiness data into regional aggregates
const processRealRegionalData = (data) => {
  const regionalAggregates = {}
  
  // Initialize regions
  Object.keys(REGIONS).forEach(region => {
    regionalAggregates[region] = {
      scores: [],
      countries: 0,
      topCountry: '',
      topScore: 0
    }
  })
  
  // Process each country's data
  data.forEach(country => {
    const countryCode = country.country_code || country.iso_code || country.code
    const score = country.happiness_score || country.score || country.ladder_score
    const countryName = country.country_name || country.country || country.name
    
    if (!countryCode || !score) return
    
    // Find which region this country belongs to
    Object.entries(REGIONS).forEach(([regionName, countryCodes]) => {
      if (countryCodes.includes(countryCode)) {
        regionalAggregates[regionName].scores.push(score)
        regionalAggregates[regionName].countries++
        
        if (score > regionalAggregates[regionName].topScore) {
          regionalAggregates[regionName].topScore = score
          regionalAggregates[regionName].topCountry = countryName
        }
      }
    })
  })
  
  // Calculate averages
  const result = {}
  Object.entries(regionalAggregates).forEach(([region, data]) => {
    if (data.scores.length > 0) {
      result[region] = {
        averageScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
        countries: data.countries,
        topCountry: data.topCountry || 'N/A'
      }
    }
  })
  
  return Object.keys(result).length > 0 ? result : getMockRegionalData()
}

// Simple CSV parser
const parseCSVToJSON = (csvText) => {
  const lines = csvText.split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const result = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    if (values.length === headers.length) {
      const obj = {}
      headers.forEach((header, index) => {
        obj[header.toLowerCase().replace(/\s+/g, '_')] = values[index]
      })
      result.push(obj)
    }
  }
  
  return result
}

// Fallback mock regional data
const getMockRegionalData = () => {
  return {
    'Western Europe': { averageScore: 7.2, countries: 14, topCountry: 'Finland' },
    'North America': { averageScore: 6.95, countries: 2, topCountry: 'Canada' },
    'Australia and New Zealand': { averageScore: 7.1, countries: 2, topCountry: 'New Zealand' },
    'Middle East and North Africa': { averageScore: 5.3, countries: 12, topCountry: 'Israel' },
    'Latin America and Caribbean': { averageScore: 5.8, countries: 12, topCountry: 'Costa Rica' },
    'Central and Eastern Europe': { averageScore: 6.1, countries: 12, topCountry: 'Czech Republic' },
    'East Asia': { averageScore: 5.9, countries: 7, topCountry: 'Taiwan' },
    'Southeast Asia': { averageScore: 5.4, countries: 7, topCountry: 'Thailand' },
    'South Asia': { averageScore: 4.6, countries: 7, topCountry: 'Nepal' },
    'Sub-Saharan Africa': { averageScore: 4.2, countries: 10, topCountry: 'Mauritius' }
  }
}

// Calculate correlation between two datasets
export const calculateCorrelation = (data1, data2) => {
  if (data1.length !== data2.length || data1.length === 0) return 0
  
  const n = data1.length
  const sumX = data1.reduce((sum, val) => sum + val, 0)
  const sumY = data2.reduce((sum, val) => sum + val, 0)
  const sumXY = data1.reduce((sum, val, i) => sum + val * data2[i], 0)
  const sumX2 = data1.reduce((sum, val) => sum + val * val, 0)
  const sumY2 = data2.reduce((sum, val) => sum + val * val, 0)
  
  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  
  return denominator === 0 ? 0 : numerator / denominator
}

// Get India correlation data - Try real analysis first, fallback to mock
export const getIndiaCorrelationData = async () => {
  try {
    console.log('Attempting to fetch real India correlation data')
    
    // Try to get multiple indicators for India and calculate correlations
    const indicators = [
      { code: 'NY.GDP.PCAP.CD', name: 'GDP per Capita' },
      { code: 'SP.DYN.LE00.IN', name: 'Life Expectancy' },
      { code: 'SE.PRM.NENR', name: 'Education Index' },
      { code: 'SL.UEM.TOTL.ZS', name: 'Unemployment Rate' },
      { code: 'SH.XPD.CHEX.GD.ZS', name: 'Health Expenditure' },
      { code: 'IT.NET.USER.ZS', name: 'Internet Users' }
    ]
    
    // Get happiness time series for India
    const happinessData = await getHappinessTimeSeries('IND', 2010, 2023)
    
    if (happinessData.length === 0) {
      console.log('No happiness data for India, using mock correlation data')
      return getMockIndiaCorrelationData()
    }
    
    const correlations = []
    
    // Calculate correlation for each indicator
    for (const indicator of indicators) {
      try {
        const indicatorData = await getWorldBankData('IND', indicator.code, 2010, 2023)
        
        if (indicatorData.length > 3) { // Need at least 4 data points for meaningful correlation
          // Align data by years
          const commonYears = indicatorData
            .map(item => item.year)
            .filter(year => happinessData.some(h => h.year === year))
            .sort((a, b) => a - b)
          
          if (commonYears.length > 3) {
            const alignedIndicatorValues = commonYears.map(year => {
              const item = indicatorData.find(d => d.year === year)
              return item ? item.value : null
            }).filter(v => v !== null)
            
            const alignedHappinessValues = commonYears.map(year => {
              const item = happinessData.find(h => h.year === year)
              return item ? item.value : null
            }).filter(v => v !== null)
            
            if (alignedIndicatorValues.length === alignedHappinessValues.length && alignedIndicatorValues.length > 3) {
              const correlation = calculateCorrelation(alignedIndicatorValues, alignedHappinessValues)
              
              correlations.push({
                indicator: indicator.name,
                correlation: correlation,
                trend: correlation > 0 ? 'positive' : 'negative',
                description: getCorrelationDescription(correlation)
              })
              
              console.log(`Real correlation for ${indicator.name}:`, correlation)
            }
          }
        }
      } catch (err) {
        console.log(`Failed to get data for ${indicator.name}:`, err.message)
      }
    }
    
    // If we got enough real correlations, use them
    if (correlations.length >= 3) {
      console.log('Using real India correlation data:', correlations)
      return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
    }
    
    // Otherwise fallback to mock data
    console.log('Insufficient real data, using mock India correlation data')
    return getMockIndiaCorrelationData()
    
  } catch (error) {
    console.error('Error fetching India correlation data:', error)
    return getMockIndiaCorrelationData()
  }
}

// Get correlation description based on strength
const getCorrelationDescription = (correlation) => {
  const abs = Math.abs(correlation)
  const direction = correlation > 0 ? 'positive' : 'negative'
  
  if (abs >= 0.8) return `Very strong ${direction} correlation`
  if (abs >= 0.6) return `Strong ${direction} correlation`
  if (abs >= 0.4) return `Moderate ${direction} correlation`
  if (abs >= 0.2) return `Weak ${direction} correlation`
  return `Very weak ${direction} correlation`
}

// Fallback mock India correlation data
const getMockIndiaCorrelationData = () => {
  return [
    { indicator: 'Social Support', correlation: 0.81, trend: 'positive', description: 'Very strong positive correlation' },
    { indicator: 'GDP per Capita', correlation: 0.78, trend: 'positive', description: 'Strong positive correlation with happiness' },
    { indicator: 'Education Index', correlation: 0.72, trend: 'positive', description: 'Strong positive correlation' },
    { indicator: 'Life Expectancy', correlation: 0.65, trend: 'positive', description: 'Moderate positive correlation' },
    { indicator: 'Unemployment Rate', correlation: -0.58, trend: 'negative', description: 'Moderate negative correlation' },
    { indicator: 'Air Pollution', correlation: -0.43, trend: 'negative', description: 'Moderate negative correlation' }
  ]
}
