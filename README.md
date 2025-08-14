# DataViz: Global Indicators & Happiness Dashboard

DataViz is an interactive dashboard for exploring and comparing global development indicators and happiness scores across countries and regions. Built with **React** and **Vite**, it provides a modern, responsive interface for visual data analysis.

## Features

- **Dual-Axis Time Series Analysis:** Compare a country's economic or social indicator (GDP, poverty, unemployment, etc.) with its happiness score over time using a dual-axis line chart with dynamic year filtering.
- **Multi-Country Correlation Analysis:** Select multiple countries and analyze the correlation between indicators and happiness scores using scatter plots and correlation coefficients with real-time data validation.
- **Smart Data Validation:** Automatic filtering of available years based on data intersection between World Happiness Report and World Bank API sources.
- **Enhanced Country Selection:** Modern searchable dropdown with checkboxes, select all/clear all functionality, and visual country panels for correlation analysis.
- **Regional Visualization:** View and compare average happiness scores and country distributions by world region, with bar and doughnut charts.
- **India Dashboard:** Dedicated dashboard for India, showing trends, key drivers, and detailed correlation analysis for happiness and major indicators.
- **Professional UI Components:** Consistent form styling, custom checkboxes, and responsive layout optimized for chart visibility.
- **Export Charts:** Export visualizations as images for reports or presentations.
- **Light Theme & Responsive UI:** Clean, accessible design that works across devices.

## Main Components

- **HappinessComparison:** Core analysis tool featuring dual-mode operation:
  - *Time Series Mode:* Compare single country indicators with happiness over time
  - *Correlation Mode:* Multi-country correlation analysis with enhanced country selection UI
  - *Smart Year Filtering:* Automatic data validation ensuring availability across both data sources
- **CountryExplorer:** Explore trends for any country and indicator with interactive line charts.
- **RegionalVisualization:** Visualize and compare happiness scores and country counts by region.
- **IndianDashboard:** In-depth dashboard for India, including trends, correlation analysis, and key insights.
- **Dashboard:** Overview landing page.

## Data Sources

- **World Bank API:** Economic and social indicators (GDP per capita, poverty rates, unemployment, etc.) with dynamic year availability detection.
- **World Happiness Report 2024:** Country-level happiness scores and ranks (2005-2023 data coverage).
- **Intelligent Data Integration:** Automatic intersection of available years between data sources for accurate analysis.

## Getting Started

1. **Install dependencies:**
	```sh
	npm install
	```
2. **Start the development server:**
	```sh
	npm run dev
	```
3. **Open your browser:**
	Go to [http://localhost:5173/](http://localhost:5173/) to use the dashboard.

## Usage

- **Time Series Analysis:** Select a country, indicator, and year range to view trends with automatic data validation.
- **Correlation Analysis:** Switch to correlation mode, select multiple countries using the enhanced dropdown, and analyze relationships across indicators.
- **Country Selection:** Use the searchable dropdown with checkboxes for quick multi-country selection with Select All/Clear All options.
- **Regional Insights:** Use the region view for global comparisons and happiness distribution analysis.
- **India Focus:** Explore the India Dashboard for focused insights and detailed correlation studies.
- **Export & Share:** Export any chart as an image for reports or presentations.

## Tech Stack

- React 19
- Vite
- Chart.js & react-chartjs-2
- Axios
