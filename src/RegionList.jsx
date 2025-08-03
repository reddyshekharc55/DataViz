import React, { useState } from "react";

// Official World Bank regions
const WORLD_BANK_REGIONS = [
  "East Asia & Pacific",
  "Europe & Central Asia",
  "Latin America & Caribbean",
  "Middle East & North Africa",
  "North America",
  "South Asia",
  "Sub-Saharan Africa"
];

export default function RegionList({ onRegionSelect }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (region) => {
    setSelected(region);
    if (onRegionSelect) onRegionSelect(region);
  };

  return (
    <div>
      <h2 style={{ color: '#005662', textAlign: 'center', fontWeight: 600, marginBottom: '1.2rem' }}>World Bank Regions</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {WORLD_BANK_REGIONS.map((region) => (
          <li
            key={region}
            onClick={() => handleSelect(region)}
            style={{
              cursor: "pointer",
              padding: "0.75rem 1rem",
              margin: "0.5rem 0",
              borderRadius: 6,
              background: selected === region ? "#b2ebf2" : "#f9f9f9",
              color: selected === region ? '#00363a' : '#222',
              border: selected === region ? "2px solid #0097a7" : "1px solid #bbb",
              fontWeight: selected === region ? 600 : 400,
              fontSize: '1.08rem',
              transition: "all 0.2s"
            }}
          >
            {region}
          </li>
        ))}
      </ul>
    </div>
  );
}
