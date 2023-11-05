**Interactive Web Map**
**Introduction**
This web map provides an interactive visualization of PM 2.5 air pollution trends across urban areas in Africa from 1998 to 2020. Understanding these trends is crucial for environmental analysis and policy-making. The map allows users to explore air quality data at a granular level, offering insights into the temporal dynamics of pollution within specific urban areas.

**Features**
Interactive map with zoom-dependent visualization: polygons for detailed views and centroids for broader overviews.
Dynamic line chart reflecting PM 2.5 trends over time.
Reset functionality to return the visualization to its initial state.
Technologies Used
Mapbox GL JS
Chart.js
PapaParse
Installation
To set up the project environment, follow these steps:

bash
Copy code
# Clone the repository
git clone https://github.com/Marving14/dev.git

# Navigate to the project directory
cd dev

# Open the index.html file in a web browser
# If using VSCode, you can use the Live Server extension to serve the file
# Otherwise, simply open the file in your preferred browser
Configuration
Ensure you have a valid Mapbox access token to use Mapbox GL JS. Set the token in the mapboxgl.accessToken variable within the main.js file.

Usage
Open the index.html file in a web browser.
Interact with the map by clicking on urban areas to view specific PM 2.5 data.
Use the reset button or right-click to reset the map and chart.
Use the console to monitor zoom levels and data interactions for debugging purposes.
For a live demo, visit Interactive Web Map Demo.

Contribution
Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change. Please ensure to update tests as appropriate.

Acknowledgments
Data provided by AFRICAPOLIS and UrbAglo_AQdata.
Map visualization powered by Mapbox GL JS.
Charting functionality by Chart.js.
CSV parsing by PapaParse.
License
This project is licensed under the MIT License - see the LICENSE file for details.

Contact
For questions or feedback, please reach out to [Your Name] at [Your Email].