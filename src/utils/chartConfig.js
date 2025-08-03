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