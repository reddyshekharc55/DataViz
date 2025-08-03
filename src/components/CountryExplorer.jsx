import React, { useState, useEffect } from 'react'
import { getCountries, INDICATORS } from '../services/apiService'


const CountryExplorer = () => {

    const [selectedCountry, setSelectedCountry] = useState('USA')
    const [countries, setCountries] = useState([])
    const [selectedIndicator, setSelectedIndicator] = useState('NY.GDP.PCAP.CD')
    const [startYear, setStartYear] = useState('2015')
    const [endYear, setEndYear] = useState('2023')
    const [loading, setLoading] = useState(false)

    // Load countries on component mount
    useEffect(() => {
        const loadCountries = async () => {
            try {
                const countriesData = await getCountries()
                setCountries(countriesData)
            } catch (err) {
                console.error('Error loading countries:', err)
            }
        }
        loadCountries()
    }, [])
    return (
        <div className="card">
            <h2>🌍 Country Explorer</h2>
            <p>Explore indicator trends for a selected country over a chosen time period</p>

            <div className="responsive-form-grid" style={{ margin: '2rem 0' }}>
                <div className="form-group">
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
                <div className="form-group">
                    <label>Select Indicator:</label>
                    <select
                        value={selectedIndicator}
                        onChange={(e) => setSelectedIndicator(e.target.value)}
                        disabled={loading}
                    >
                        {INDICATORS.map(indicator => (
                            <option key={indicator.value} value={indicator.value}>{indicator.label}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
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

                <div className="form-group">
                    <label>End Year:</label>
                    <select
                        value={endYear}
                        onChange={(e) => setEndYear(e.target.value)}
                    >
                        {Array.from({ length: 14 }, (_, i) => 2010 + i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}

export default CountryExplorer
