# 🌍 DataViz: Global Happiness & Development Indicators Dashboard

DataViz is a comprehensive, interactive web application for exploring and analyzing global development indicators and happiness scores across countries and regions. Built with **React 19** and **Vite 7**, it provides a modern, responsive interface for data-driven insights into world happiness trends and socio-economic factors.

## ✨ Features Overview

### 🎯 **Six Specialized Analysis Modules**
- **🏠 Dashboard:** Central hub with navigation to all analysis tools and overview
- **🌍 Country Explorer:** Deep dive into individual country happiness trends with 50+ World Bank indicators
- **😊 Happiness Comparison:** Advanced dual-mode analysis with time series and correlation capabilities
- **🗺️ Regional Analysis:** Aggregate happiness trends and insights by world regions
- **📊 Regional Comparison:** Interactive country comparison within regions with dynamic data-driven year selection
- **🇮🇳 India Dashboard:** Specialized comprehensive analysis focused on India's happiness metrics

### 📊 **Advanced Visualization Arsenal**
- **📈 Time Series Charts:** Multi-indicator trend analysis with dual-axis support
- **🔗 Correlation Analysis:** Scatter plots with statistical correlation coefficients
- **📊 Bar Charts:** Happiness rankings and country comparisons
- **🍩 Regional Distribution:** Doughnut charts for regional happiness distribution
- **📋 Data Tables:** Top performers analysis with stable, responsive layouts
- **📸 Export Functionality:** High-quality PNG export for all visualizations

### 🎯 **Smart Data Integration & Processing**
- **🌐 Real-time APIs:** Live World Bank API integration for 50+ development indicators
- **📄 CSV Processing:** World Happiness Report 2024 data covering 2005-2023 (19 years)
- **🔍 Dynamic Year Discovery:** Automatic detection of data availability across years
- **✅ Data Validation:** Intelligent filtering and quality assurance
- **⚡ Performance Optimization:** Parallel data loading and caching strategies
- **🗺️ Regional Mapping:** Comprehensive country-to-region classification system

### 🎨 **Modern UI/UX Excellence**
- **🎨 Consistent Design:** Professional teal theme (#0097a7) with accessibility compliance
- **📱 Responsive Layout:** Optimized for desktop, tablet, and mobile experiences
- **🔄 Auto-loading:** Reactive data updates without manual trigger buttons
- **📊 Hover-only Labels:** Clean chart displays with contextual information on demand
- **⏳ Smart Loading States:** Professional indicators and error handling
- **🎯 Fixed Table Layouts:** Stable column widths preventing layout shifts

## 🏗️ Detailed Component Architecture

### **🎯 Core Analysis Components**

#### **🏠 Dashboard (`Dashboard.jsx`)**
- **Purpose:** Central navigation hub and application overview
- **Features:** Card-based navigation, module descriptions, quick access
- **Navigation:** Direct routing to all analysis modules

#### **🌍 Country Explorer (`CountryExplorer.jsx`)**
- **Purpose:** Single-country deep-dive analysis
- **Data Sources:** World Bank API (50+ indicators) + Happiness CSV
- **Features:** 
  - Dual-axis time series visualization
  - Year range selection (flexible start/end years)
  - Indicator selection from comprehensive World Bank dataset
  - Chart export functionality
- **Indicators:** GDP, Life Expectancy, Education, Unemployment, CO2 Emissions, etc.

#### **😊 Happiness Comparison (`HappinessComparison.jsx`)**
- **Purpose:** Advanced multi-modal happiness analysis
- **Modes:**
  - **Time Series Mode:** Multi-country happiness trends over time
  - **Correlation Mode:** Happiness vs. development indicator scatter plots
- **Features:**
  - Multi-country selection (up to 5 countries)
  - Searchable country dropdown
  - Statistical correlation calculation
  - Dynamic year availability detection
  - Advanced filtering and validation
- **Data Integration:** Both World Bank API and Happiness CSV with intelligent intersection

#### **🗺️ Regional Analysis (`RegionalAnalysis.jsx`)**
- **Purpose:** Regional happiness aggregation and trends
- **Features:**
  - Regional happiness averages and rankings
  - Doughnut chart distribution visualization
  - Year-over-year regional trends
  - Region selection and drill-down capabilities

#### **📊 Regional Comparison (`RegionalVisualization.jsx`)**
- **Purpose:** In-depth country comparison within selected regions
- **Key Features:**
  - **Dynamic Year Discovery:** Automatically detects available years (2005-2023) for each region/indicator combination
  - **CSV-Only Data:** High-performance data loading using local happiness dataset
  - **Auto-loading:** Reactive updates when parameters change
  - **Dual Visualization:**
    - **Bar Chart:** Happiness rankings for countries in region
    - **Scatter Plot:** Correlation between selected indicator and happiness
  - **Top Performers Table:** Ranked list with stable, responsive layout
  - **Export Capabilities:** PNG export for both charts
- **CSV Indicators Available:**
  - Log GDP per capita
  - Social support
  - Healthy life expectancy at birth
  - Freedom to make life choices
  - Generosity
  - Perceptions of corruption
  - Positive affect
  - Negative affect

#### **🇮🇳 India Dashboard (`IndianDashboard.jsx`)**
- **Purpose:** Specialized India-focused comprehensive analysis
- **Features:** India-specific happiness trends, regional context, development indicators

### **🛠️ Supporting Infrastructure**

#### **📡 Data Service Layer (`apiService.js`)**
- **World Bank API Integration:** 50+ development indicators with error handling
- **CSV Processing:** Local happiness data parsing with Papa Parse
- **Regional Comparison Functions:** Optimized data aggregation for regional analysis
- **Caching Strategy:** Performance optimization for repeated queries
- **Data Validation:** Quality assurance and missing data handling

#### **🗺️ Regional Mapping (`regionMapping.js`)**
- **Country Classification:** Comprehensive mapping of 195+ countries to World Bank regions
- **Regional Functions:** `getAllRegions()`, `getCountriesInRegion()`, `getRegionForCountry()`
- **Supported Regions:**
  - East Asia & Pacific
  - Europe & Central Asia
  - Latin America & Caribbean
  - Middle East & North Africa
  - North America
  - South Asia
  - Sub-Saharan Africa

#### **🎨 Chart Configuration (`chartConfig.js`)**
- **Centralized Styling:** Consistent Chart.js configurations
- **Color Palette:** Professional gradient and thematic colors
- **Chart Types:** Line, Bar, Scatter, Doughnut configurations
- **Responsive Settings:** Mobile-optimized chart parameters

## 📊 Data Sources & Coverage

### **🌐 World Bank Open Data API**
- **Coverage:** 50+ development indicators across 200+ countries
- **Indicators Include:**
  - **Economic:** GDP per capita, GDP growth, unemployment, inflation, poverty
  - **Social:** Life expectancy, infant mortality, education metrics
  - **Environmental:** CO2 emissions, renewable energy, forest coverage
  - **Governance:** Government effectiveness, rule of law
- **Time Range:** Varies by indicator (typically 1960-2023)
- **Update Frequency:** Annual updates from World Bank

### **📄 World Happiness Report 2024**
- **Source:** Local CSV file (`world_happiness_report_2024_with_codes.csv`)
- **Coverage:** 2005-2023 (19 years of data)
- **Countries:** 150+ countries with happiness scores
- **Indicators:**
  - Life Ladder (happiness score)
  - Log GDP per capita
  - Social support
  - Healthy life expectancy at birth
  - Freedom to make life choices
  - Generosity
  - Perceptions of corruption
  - Positive affect
  - Negative affect

### **🔍 Data Quality & Processing**
- **Validation:** Automatic filtering for data completeness and quality
- **Year Intersection:** Smart detection of overlapping data availability
- **Regional Aggregation:** Calculated averages and statistics by region
- **Performance:** Parallel data loading and caching for optimal user experience

## 🚀 Getting Started

### **📋 Prerequisites**
- **Node.js:** Version 18 or higher
- **Package Manager:** npm or yarn
- **Browser:** Modern browser with ES6+ support

### **⚡ Quick Start**
```bash
# Clone the repository
git clone https://github.com/reddyshekharc55/DataViz.git
cd DataViz

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser and navigate to:
# http://localhost:5173/DataViz/
```

### **🏗️ Build & Deploy**
```bash
# Create production build
npm run build

# Preview production build locally
npm run preview

# Deploy to GitHub Pages (automatic on push to main/dev)
# Manual deployment available via GitHub Actions
```

## 🎮 User Guide & Workflows

### **🎯 Analysis Workflows**

#### **1. Country Deep-Dive Analysis**
1. Navigate to **Country Explorer**
2. Select country from dropdown
3. Choose development indicator
4. Set year range for trend analysis
5. Export chart for reporting

#### **2. Multi-Country Happiness Comparison**
1. Go to **Happiness Comparison**
2. Switch between **Time Series** and **Correlation** modes
3. Select multiple countries (up to 5)
4. Choose indicator for correlation analysis
5. View statistical correlation coefficients

#### **3. Regional Performance Analysis**
1. Open **Regional Analysis** for overview
2. Switch to **Regional Comparison** for detailed analysis
3. Select region and happiness indicator
4. Year automatically filtered based on data availability
5. Compare countries within region using dual charts
6. Review top performers in ranked table

#### **4. India-Specific Analysis**
1. Access **India Dashboard**
2. Explore India's happiness trends
3. Compare with regional context
4. Analyze development indicators

### **🎨 Interactive Features**
- **Dynamic Filtering:** Real-time updates based on selections
- **Hover Tooltips:** Detailed information on chart elements
- **Responsive Design:** Optimal viewing on all device sizes
- **Export Capabilities:** Download visualizations as PNG files
- **Loading States:** Professional indicators during data fetching
- **Error Handling:** Graceful fallbacks and user feedback

## 🛠️ Technology Stack

### **⚛️ Frontend Framework**
- **React 19:** Latest React with concurrent features and improved performance
- **Vite 7:** Lightning-fast build tool with hot module replacement
- **ES6+ JavaScript:** Modern JavaScript features and syntax

### **📊 Data Visualization**
- **Chart.js 4.5:** Powerful, flexible charting library
- **react-chartjs-2 5.3:** React wrapper with TypeScript support
- **chartjs-plugin-datalabels 2.2:** Enhanced chart labeling capabilities

### **📡 Data Processing & HTTP**
- **Axios 1.11:** Promise-based HTTP client with interceptors
- **Papa Parse 5.5:** High-performance CSV parsing library

### **🎨 Development & Code Quality**
- **ESLint 9:** Modern linting with latest rules
- **Vite Plugin React:** Hot reload and development optimization
- **Modern CSS:** Flexbox, CSS Grid, custom properties for responsive design

### **🚀 Deployment & Hosting**
- **GitHub Pages:** Automatic deployment pipeline
- **GitHub Actions:** CI/CD workflow for build and deploy
- **Vite Build:** Optimized production bundles

## 🌐 Live Deployment

### **🔗 Access the Application**
- **Live URL:** [https://reddyshekharc55.github.io/DataViz/](https://reddyshekharc55.github.io/DataViz/)
- **Deployment:** Automatic via GitHub Actions
- **Triggers:** Push to `main`, `master`, or `dev` branches
- **Manual Deploy:** Available via GitHub Actions tab

### **⚙️ Deployment Configuration**
```yaml
# Automatic deployment workflow
# File: .github/workflows/deploy.yml
# Builds and deploys to GitHub Pages on push
# Supports manual triggers via GitHub Actions UI
```

## 📈 Performance Optimizations

### **⚡ Data Loading**
- **Parallel Processing:** Concurrent API calls for faster data retrieval
- **Caching Strategy:** Intelligent caching of API responses
- **Dynamic Year Discovery:** Efficient validation of data availability
- **CSV Processing:** Optimized local data parsing

### **🎨 UI/UX Optimizations**
- **Auto-loading:** Eliminates unnecessary manual interactions
- **Stable Layouts:** Fixed table column widths prevent shifting
- **Hover-only Labels:** Clean chart displays with contextual information
- **Responsive Design:** Optimized for all screen sizes

### **🔧 Technical Optimizations**
- **Code Splitting:** Vite-optimized bundle splitting
- **Tree Shaking:** Dead code elimination
- **Modern Build:** ES6+ transpilation with Vite
- **Asset Optimization:** Compressed images and optimized assets

## 🤝 Contributing

### **🔧 Development Setup**
```bash
# Fork the repository on GitHub
# Clone your fork locally
git clone https://github.com/YOUR_USERNAME/DataViz.git
cd DataViz

# Install dependencies
npm install

# Create a new branch for your feature
git checkout -b feature/your-feature-name

# Start development server
npm run dev

# Make your changes and test thoroughly
# Commit and push your changes
git add .
git commit -m "Add your feature description"
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

### **📋 Contributing Guidelines**
- **Issues:** Feel free to submit bug reports, feature requests, or questions
- **Pull Requests:** Contributions are welcome! Please ensure:
  - Code follows existing style and patterns
  - All components are responsive and accessible
  - Charts maintain consistent theming (#0097a7)
  - New features include appropriate error handling
  - Documentation is updated as needed

### **🎯 Priority Areas for Contribution**
- **New Visualizations:** Additional chart types or analysis methods
- **Data Sources:** Integration with additional happiness or development datasets
- **Performance:** Further optimization of data loading and processing
- **Accessibility:** Enhanced screen reader support and keyboard navigation
- **Mobile Experience:** Further responsive design improvements

## 🙏 Acknowledgments

- **World Bank:** For providing comprehensive development indicators through their Open Data API
- **World Happiness Report:** For the annual happiness data and research insights
- **Chart.js Community:** For the powerful and flexible visualization library
- **React & Vite Teams:** For the modern development framework and build tools

---

**Built with ❤️ for data-driven insights into global happiness and development**
