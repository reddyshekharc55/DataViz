import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
)

// Common chart colors
export const CHART_COLORS = {
  primary: 'rgba(102, 126, 234, 0.8)',
  primaryBorder: 'rgba(102, 126, 234, 1)',
  secondary: 'rgba(245, 87, 108, 0.8)',
  secondaryBorder: 'rgba(245, 87, 108, 1)',
  success: 'rgba(67, 233, 123, 0.8)',
  successBorder: 'rgba(67, 233, 123, 1)',
  warning: 'rgba(255, 193, 7, 0.8)',
  warningBorder: 'rgba(255, 193, 7, 1)',
  info: 'rgba(79, 172, 254, 0.8)',
  infoBorder: 'rgba(79, 172, 254, 1)',
  gradient: [
    'rgba(102, 126, 234, 0.8)',
    'rgba(245, 87, 108, 0.8)',
    'rgba(67, 233, 123, 0.8)',
    'rgba(255, 193, 7, 0.8)',
    'rgba(79, 172, 254, 0.8)',
    'rgba(156, 39, 176, 0.8)',
    'rgba(255, 87, 34, 0.8)',
    'rgba(0, 188, 212, 0.8)'
  ]
}

// Line chart configuration for trends
export const getLineChartConfig = (title, datasets, labels) => ({
  type: 'line',
  data: {
    labels,
    datasets
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
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
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
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
        display: true,
        title: {
          display: true,
          text: 'Value'
        }
      }
    }
  }
})

// Bar chart configuration
export const getBarChartConfig = (title, datasets, labels) => ({
  type: 'bar',
  data: {
    labels,
    datasets
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
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
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Countries'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Score'
        },
        beginAtZero: true
      }
    }
  }
})

// Scatter plot configuration for correlation
export const getScatterChartConfig = (title, xLabel, yLabel) => ({
  type: 'scatter',
  data: {
    datasets: []
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.parsed.x}, ${context.parsed.y}`
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: xLabel
        }
      },
      y: {
        title: {
          display: true,
          text: yLabel
        }
      }
    }
  }
})

// Doughnut chart configuration
export const getDoughnutChartConfig = (title, data, labels) => ({
  type: 'doughnut',
  data: {
    labels,
    datasets: [{
      data,
      backgroundColor: CHART_COLORS.gradient,
      borderWidth: 2,
      borderColor: '#fff'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${percentage}%`
          }
        }
      }
    }
  }
})

// Create trend dataset for line charts
export const createTrendDataset = (label, data, color = CHART_COLORS.primary, borderColor = CHART_COLORS.primaryBorder) => ({
  label,
  data,
  borderColor: borderColor,
  backgroundColor: color,
  borderWidth: 2,
  fill: false,
  tension: 0.1,
  pointRadius: 4,
  pointHoverRadius: 6
})

// Create bar dataset
export const createBarDataset = (label, data, backgroundColor = CHART_COLORS.gradient) => ({
  label,
  data,
  backgroundColor,
  borderColor: backgroundColor.map(color => color.replace('0.8', '1')),
  borderWidth: 1
})

// Create scatter dataset
export const createScatterDataset = (label, data, color = CHART_COLORS.primary) => ({
  label,
  data,
  backgroundColor: color,
  borderColor: color.replace('0.8', '1'),
  pointRadius: 6,
  pointHoverRadius: 8
})

// Format number with appropriate decimal places
export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return 'N/A'
  return Number(num).toFixed(decimals)
}

// Generate color palette for multiple datasets
export const generateColorPalette = (count) => {
  const colors = []
  for (let i = 0; i < count; i++) {
    const colorIndex = i % CHART_COLORS.gradient.length
    colors.push(CHART_COLORS.gradient[colorIndex])
  }
  return colors
}
