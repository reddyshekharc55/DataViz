# DataViz: Global Indicators & Happiness Dashboard

DataViz is an interactive dashboard for exploring and comparing global development indicators and happiness scores across countries and regions. Built with **React** and **Vite**, it provides a modern, responsive interface for visual data analysis.

## Features

- **Dual-Axis Time Series Analysis:** Compare a country's economic or social indicator (GDP, poverty, unemployment, etc.) with its happiness score over time using a dual-axis line chart.
- **Multi-Country Correlation Analysis:** Select multiple countries and analyze the correlation between indicators and happiness scores using scatter plots and correlation coefficients.
- **Regional Visualization:** View and compare average happiness scores and country distributions by world region, with bar and doughnut charts.
- **India Dashboard:** Dedicated dashboard for India, showing trends, key drivers, and detailed correlation analysis for happiness and major indicators.
- **Searchable Multi-Select Dropdown:** Quickly select countries for analysis with a modern, searchable dropdown UI.
- **Export Charts:** Export visualizations as images for reports or presentations.
- **Light Theme & Responsive UI:** Clean, accessible design that works across devices.

## Main Components

- **HappinessComparison:** Core analysis tool for time series and multi-country correlation of indicators and happiness.
- **CountryExplorer:** Explore trends for any country and indicator with interactive line charts.
- **RegionalVisualization:** Visualize and compare happiness scores and country counts by region.
- **IndianDashboard:** In-depth dashboard for India, including trends, correlation analysis, and key insights.
- **Dashboard:** Overview landing page.

## Data Sources

- **World Bank API:** Economic and social indicators (GDP per capita, poverty rates, unemployment, etc.).
- **World Happiness Report:** Country-level happiness scores and ranks.

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

- Select a country, indicator, and year range to view trends.
- Switch to correlation mode to analyze relationships across multiple countries.
- Use the region view for global comparisons.
- Explore the India Dashboard for focused insights.
- Export any chart as an image.

## Tech Stack

- React 19
- Vite
- Chart.js & react-chartjs-2
- Axios
