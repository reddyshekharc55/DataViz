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

// World Bank Indicators
    export const INDICATORS = [
        { value: 'NY.GDP.PCAP.CD', label: 'GDP per Capita' },
        { value: 'SP.DYN.LE00.IN', label: 'Life Expectancy' },
        { value: 'SE.PRM.NENR', label: 'Education Index' },
        { value: 'SL.UEM.TOTL.ZS', label: 'Unemployment Rate' },
        // { value: 'EN.ATM.CO2E.PC', label: 'CO2 Emissions per Capita' }
        { value: 'EN.GHG.ALL.LU.MT.CE.AR5', label: 'Total greenhouse gas emissions' },
        { value: 'SE.PRM.ENRR', label: 'School enrollment, primary' },
        // { value: 'SE.ADT.LITR.ZS', label: 'Literacy rate, adult total' },
    ]

// API Service Functions


// Get happiness data - Try real API first, fallback to mock data
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







