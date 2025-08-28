# 🌍 DataBoard: Global Happiness & Development Indicators Dashboard

DataBoard is a comprehensive, interactive web application for exploring and analyzing global development indicators and happiness scores across countries and regions. Built with **React 19** and **Vite**, it provides a modern, responsive interface for data-driven insights into world happiness trends and socio-economic factors.

## ✨ Features

### 🔄 **Multi-Modal Analysis Dashboard**
- **Overview Dashboard:** Landing page with quick access to all analysis tools and key insights
- **Country Explorer:** Deep dive into any country's happiness trends and development indicators
- **Happiness Comparison:** Advanced dual-mode analysis tool with time series and correlation capabilities
- **Regional Analysis:** Aggregate happiness analysis by world regions with trend visualization
- **Regional Comparison:** Interactive regional happiness comparison with bar and doughnut charts
- **India Dashboard:** Specialized comprehensive analysis focused on India's happiness and development metrics

### 📊 **Advanced Visualization Capabilities**
- **Dual-Axis Time Series:** Compare happiness scores with economic/social indicators over time
- **Multi-Country Correlation Analysis:** Scatter plots with correlation coefficients for multiple countries
- **Regional Aggregation:** Bar charts and doughnut charts for regional happiness distribution
- **Interactive Line Charts:** Dynamic country and indicator exploration with year filtering
- **Export Functionality:** Download all visualizations as high-quality PNG images

### 🎯 **Smart Data Integration**
- **Real-time API Integration:** Live data from World Bank API for 50+ development indicators
- **Local CSV Processing:** World Happiness Report 2024 data (2005-2023 coverage)
- **Intelligent Data Validation:** Automatic year intersection between multiple data sources
- **Missing Data Handling:** Smart exclusion of incomplete data points for accurate analysis

### 🎨 **Modern UI/UX Design**
- **Consistent Theme:** Professional teal color scheme (#0097a7) with accessible contrast
- **Responsive Layout:** Optimized for desktop, tablet, and mobile viewing
- **Enhanced Form Controls:** Searchable dropdowns, checkboxes, and intuitive navigation
- **Loading States:** Professional loading indicators and error handling
- **Smooth Transitions:** Polished animations and state changes

## 🏗️ Component Architecture

### **Core Components**
- **`Dashboard`** - Landing page with overview and navigation
- **`CountryExplorer`** - Single country analysis with indicator selection
- **`HappinessComparison`** - Dual-mode analysis (time series & correlation)
- **`RegionalAnalysis`** - Regional happiness trends and aggregation
- **`RegionalVisualization`** - Interactive regional comparison charts
- **`IndianDashboard`** - Comprehensive India-specific analysis dashboard

### **Supporting Components**
- **`BitsLogo`** - Branded logo component
- **Navigation System** - Integrated tab-based navigation
- **Chart Configurations** - Reusable Chart.js configurations in `utils/chartConfig.js`

## 📡 Data Sources & APIs

### **Primary Data Sources**
- **World Bank Open Data API:** 50+ indicators including GDP, poverty, unemployment, education, health
- **World Happiness Report 2024:** Annual happiness scores, rankings, and contributing factors
- **Country Codes Integration:** ISO country code mapping for data consistency

### **Data Processing**
- **API Service (`apiService.js`):** Centralized data fetching with caching and error handling
- **CSV Processing:** Local happiness data parsing with Papa Parse
- **Data Validation:** Automatic filtering for data availability and quality
- **Regional Aggregation:** Calculated regional averages and statistics

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn package manager

### **Installation**
```bash
# Clone the repository
git clone https://github.com/reddyshekharc55/DataViz.git
cd DataViz

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# Navigate to http://localhost:5173/
```

### **Build for Production**
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🎮 Usage Guide

### **Navigation**
- Use the top navigation bar to switch between different analysis modes
- Each component provides specialized functionality for different analysis needs

### **Analysis Workflows**
1. **Country Exploration:** Select a country and indicator to view historical trends
2. **Happiness Analysis:** Switch between time series and correlation modes for comprehensive analysis
3. **Regional Insights:** Explore happiness patterns across world regions
4. **India Focus:** Access specialized dashboard for India-specific analysis
5. **Data Export:** Use export buttons to save visualizations for reports

### **Interactive Features**
- **Dynamic Filtering:** Year range selection with automatic data validation
- **Multi-Selection:** Choose multiple countries for correlation analysis
- **Real-time Updates:** Charts update dynamically based on user selections
- **Responsive Design:** Optimal viewing experience across all devices

## 🛠️ Tech Stack

### **Frontend Framework**
- **React 19** - Latest React with concurrent features
- **Vite 7** - Fast build tool and development server
- **ES6+ JavaScript** - Modern JavaScript features

### **Data Visualization**
- **Chart.js 4.5** - Powerful charting library
- **react-chartjs-2 5.3** - React wrapper for Chart.js
- **chartjs-plugin-datalabels 2.2** - Enhanced chart labeling

### **Data Processing**
- **Axios 1.11** - HTTP client for API requests
- **Papa Parse 5.5** - CSV parsing library

### **Development Tools**
- **ESLint 9** - Code linting and formatting
- **Vite Plugin React** - Hot module replacement
- **Modern CSS** - Flexbox, CSS Grid, custom properties

## 🚀 Deployment

### **GitHub Pages (Automatic)**
- **Live Site:** [https://reddyshekharc55.github.io/DataViz/](https://reddyshekharc55.github.io/DataViz/)
- **Auto-deployment** on push to `main`, `master`, or `dev` branches
- **Manual deployment** available via GitHub Actions

### **Deployment Workflow**
```yaml
# Automatic deployment via GitHub Actions
# Triggers on: push to main/master/dev branches
# Manual trigger: GitHub Actions tab → "Deploy to GitHub Pages"
```

## 📊 Key Indicators Available

### **Economic Indicators**
- GDP per capita, GDP growth rate
- Unemployment rate, Inflation rate
- Poverty headcount ratio, Income inequality (Gini coefficient)

### **Social Indicators**
- Life expectancy, Infant mortality rate
- Education metrics (literacy, school enrollment)
- Access to clean water and sanitation

### **Development Indices**
- Human Development Index components
- Social support and freedom measures
- Corruption perception levels

## 🔧 Configuration

### **Environment Setup**
- **Vite Config:** Optimized for GitHub Pages deployment with proper base path
- **Chart Config:** Centralized Chart.js configurations with consistent theming
- **API Config:** Centralized API endpoints and caching strategies

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.
