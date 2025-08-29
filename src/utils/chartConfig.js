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
          size: window.innerWidth <= 768 ? 14 : 16,
          weight: 'bold'
        }
      },
      legend: {
        position: window.innerWidth <= 480 ? 'bottom' : 'top',
        labels: {
          boxWidth: window.innerWidth <= 480 ? 10 : 12,
          fontSize: window.innerWidth <= 480 ? 10 : 12,
          padding: window.innerWidth <= 480 ? 10 : 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        titleFont: {
          size: window.innerWidth <= 480 ? 10 : 12
        },
        bodyFont: {
          size: window.innerWidth <= 480 ? 9 : 11
        }
      },
      datalabels: {
        display: false
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
          text: 'Year',
          font: {
            size: window.innerWidth <= 480 ? 10 : 12
          }
        },
        ticks: {
          font: {
            size: window.innerWidth <= 480 ? 9 : 11
          },
          maxRotation: window.innerWidth <= 480 ? 45 : 0
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Value',
          font: {
            size: window.innerWidth <= 480 ? 10 : 12
          }
        },
        ticks: {
          font: {
            size: window.innerWidth <= 480 ? 9 : 11
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
  borderWidth: window.innerWidth <= 480 ? 1 : 2,
  fill: false,
  tension: 0.1,
  pointRadius: window.innerWidth <= 480 ? 2 : 4,
  pointHoverRadius: window.innerWidth <= 480 ? 4 : 6
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
          size: window.innerWidth <= 768 ? 14 : 16,
          weight: 'bold'
        }
      },
      legend: {
        position: window.innerWidth <= 480 ? 'bottom' : 'top',
        labels: {
          boxWidth: window.innerWidth <= 480 ? 10 : 12,
          fontSize: window.innerWidth <= 480 ? 10 : 12,
          padding: window.innerWidth <= 480 ? 10 : 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        titleFont: {
          size: window.innerWidth <= 480 ? 10 : 12
        },
        bodyFont: {
          size: window.innerWidth <= 480 ? 9 : 11
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Countries',
          font: {
            size: window.innerWidth <= 480 ? 10 : 12
          }
        },
        ticks: {
          font: {
            size: window.innerWidth <= 480 ? 9 : 11
          },
          maxRotation: window.innerWidth <= 480 ? 45 : 0
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Score',
          font: {
            size: window.innerWidth <= 480 ? 10 : 12
          }
        },
        ticks: {
          font: {
            size: window.innerWidth <= 480 ? 9 : 11
          }
        },
        beginAtZero: true
      }
    }
  }
})

// Create bar dataset
export const createBarDataset = (label, data, backgroundColor = CHART_COLORS.gradient) => ({
  label,
  data,
  backgroundColor,
  borderColor: backgroundColor.map(color => color.replace('0.8', '1')),
  borderWidth: 1
})

// Generate color palette for multiple items
export const generateColorPalette = (count) => {
  const colors = [...CHART_COLORS.gradient]
  const palette = []
  
  for (let i = 0; i < count; i++) {
    palette.push(colors[i % colors.length])
  }
  
  return palette
}

// Get doughnut chart configuration
export const getDoughnutChartConfig = (title, data, labels) => ({
  data: {
    labels,
    datasets: [{
      data,
      backgroundColor: generateColorPalette(data.length),
      borderColor: generateColorPalette(data.length).map(color => color.replace('0.8', '1')),
      borderWidth: window.innerWidth <= 480 ? 1 : 2
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
          size: window.innerWidth <= 768 ? 14 : 16,
          weight: 'bold'
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          padding: window.innerWidth <= 480 ? 10 : 20,
          usePointStyle: true,
          boxWidth: window.innerWidth <= 480 ? 10 : 12,
          fontSize: window.innerWidth <= 480 ? 10 : 12
        }
      }
    }
  }
})
