import React, { useState } from "react";

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

export default function RegionList({ onRegionSelect }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (region) => {
    setSelected(region.name);
    if (onRegionSelect) onRegionSelect(region.name);
  };

  return (
    <div className="card" style={{
      height: '100%',
      maxHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      boxSizing: 'border-box',
      padding: '1.5rem',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ 
          margin: 0, 
          marginBottom: '0.5rem', 
          fontSize: '2rem',
          fontWeight: 700,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🌍 World Bank Regions
        </h2>
        <p style={{ 
          margin: '0 auto', 
          fontSize: '1rem',
          opacity: 0.9,
          maxWidth: '600px'
        }}>
          Explore global regions and discover countries within each geographic area
        </p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        width: '100%',
        flex: 1,
        overflow: 'auto',
        padding: '0 0.5rem'
      }}>
        {WORLD_BANK_REGIONS.map((region) => (
          <div
            key={region.name}
            onClick={() => handleSelect(region)}
            style={{
              cursor: "pointer",
              padding: "1.5rem",
              borderRadius: 16,
              background: selected === region.name 
                ? `linear-gradient(135deg, ${region.color}, ${region.lightColor})` 
                : "rgba(255, 255, 255, 0.95)",
              color: selected === region.name ? 'white' : '#333',
              border: selected === region.name ? `3px solid ${region.color}` : "2px solid rgba(255,255,255,0.3)",
              fontWeight: selected === region.name ? 600 : 400,
              transition: "all 0.4s ease",
              boxShadow: selected === region.name 
                ? `0 8px 25px rgba(0,0,0,0.2), 0 0 0 4px ${region.lightColor}` 
                : "0 4px 15px rgba(0,0,0,0.1)",
              transform: selected === region.name ? "translateY(-5px) scale(1.02)" : "translateY(0) scale(1)",
              backdropFilter: "blur(10px)",
              height: 'fit-content',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (selected !== region.name) {
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                e.currentTarget.style.transform = "translateY(-3px) scale(1.01)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 1)";
              }
            }}
            onMouseLeave={(e) => {
              if (selected !== region.name) {
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
              }
            }}
          >
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              {region.emoji}
            </div>
            
            <h3 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '1.2rem',
              textAlign: 'center',
              color: selected === region.name ? 'white' : region.color,
              fontWeight: 700
            }}>
              {region.name}
            </h3>
            
            <p style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '0.9rem', 
              color: selected === region.name ? 'rgba(255,255,255,0.9)' : '#666',
              lineHeight: 1.4,
              textAlign: 'center'
            }}>
              {region.description}
            </p>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              backgroundColor: selected === region.name 
                ? 'rgba(255,255,255,0.2)' 
                : region.lightColor,
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 600,
              color: selected === region.name ? 'white' : region.color
            }}>
              <span>📍</span>
              <span>{region.countries} countries</span>
            </div>
            
            {selected === region.name && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                animation: 'pulse 2s infinite'
              }}>
                ✓
              </div>
            )}
          </div>
        ))}
      </div>
      
      {selected && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: 12,
          border: '2px solid rgba(255,255,255,0.3)',
          flexShrink: 0,
          backdropFilter: 'blur(10px)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.5rem',
            marginBottom: '0.5rem'
          }}>
            🎯
          </div>
          <h4 style={{ 
            margin: '0 0 0.5rem 0', 
            color: 'white', 
            fontSize: '1.1rem',
            fontWeight: 600
          }}>
            Selected Region: {selected}
          </h4>
          <p style={{ 
            margin: 0, 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '0.9rem',
            lineHeight: 1.4
          }}>
            Ready to explore countries, happiness data, and development indicators for this region.
            Use other features to dive deeper into regional analysis.
          </p>
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
