// Initialize Mapbox map
mapboxgl.accessToken = 'pk.eyJ1IjoibWFydmluZ3JvYmxlcyIsImEiOiJjbG9kNnR6dXYwM3hqMnJvMTRjemlrdHRzIn0.D56d1cVekPdrkbRDLcu1XA';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [0, 0],
  zoom: 5
});

console.log("Map initialized.");

// Initialize Chart
let ctx = document.getElementById('myChart').getContext('2d');
let myChart;

// Function to initialize the chart
function initializeChart() {
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020'],
      datasets: [],
    },
    options: {
      responsive: true,
      //maintainAspectRatio: false,
      scales: {
        x: {
          type: 'category', // Define the type of scale
          labels: ['1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020'], // Define the labels for the x-axis
          ticks: {
            autoSkip: true,
            maxTicksLimit: 18 // Prevent labels from being skipped
          }
        },
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: false // This will remove the legend
        },
        tooltip: {
          enabled: true, // This will enable the tooltip
          callbacks: {
            title: function(tooltipItem) {
              return `Year: ${tooltipItem[0].label}`;
            },
            label: function(tooltipItem) {
              return `PM 2.5: ${tooltipItem.formattedValue}`;
            }
          }
        }
      }
    }
  });
}


// Function to update the chart
function updateChart(data, cityName) {
  // Update city name and insights in the chart header
  if (cityName) {
    document.getElementById('city-name').textContent = `PM 2.5 for ${cityName}`;
    document.getElementById('insights').textContent = `This map visualizes PM 2.5 air pollution levels in urban areas from 1998 to 2020.`;
  } else {
    document.getElementById('city-name').textContent = 'Average PM 2.5 for All Urban Areas';
    document.getElementById('insights').textContent = 'This map visualizes PM 2.5 air pollution levels in urban areas from 1998 to 2020.';
  }

  // Update the chart data
  const values = Object.values(data);
  const min = Math.floor(Math.min(...values) / 5) * 5;
  const max = Math.ceil(Math.max(...values) / 5) * 5;
  const stepSize = (max - min) / 10;

  console.log('min:', min, 'max:', max, 'stepSize:', stepSize);

  myChart.data.labels = Object.keys(data);
  myChart.data.datasets = [{
    data: values,
    borderColor: '#FFA726', // Updated line color
    backgroundColor: '#FF7043', // Updated point color
    borderWidth: 1
  }];
  myChart.options.scales.y.min = min;
  myChart.options.scales.y.max = max;
  myChart.options.scales.y.ticks.stepSize = stepSize;
  myChart.update();

}



// Listen for zoom events and log the current zoom level
map.on('zoom', function() {
  var zoomLevel = map.getZoom();
  console.log('Current Zoom Level:', zoomLevel);
});

let parsedData; // Define parsedData outside the map.on('load') callback

// Function to handle chart updates
function handleChartUpdate(cityName) {
  console.log("City clicked:", cityName);

  // Search for the city data in the parsed CSV data
  let cityData = parsedData.data.find(row => row.Agglomeration_Name === cityName);

  if (cityData) {
    // Extract PM 2.5 data for the selected city and remove the 'X' prefix from the years
    let cityPMData = [];
    for (let year = 1998; year <= 2020; year++) {
      let yearKey = `X${year}`;
      cityPMData.push(parseFloat(cityData[yearKey]) || 0);
    }
    console.log("Data for chart:", cityPMData);

    // Prepare the labels for the chart
    const chartLabels = cityPMData.map((_, index) => (1998 + index).toString());

    // Update the chart with city-specific data
    updateChart(cityPMData, cityName, chartLabels);
  } else {
    console.log("No data found for city:", cityName);
  }
}



map.on('load', function () {
  console.log("Map loaded.");

  // Initialize chart with empty data
  initializeChart();

  // Fetch and parse CSV data first to ensure it's available for both centroids and polygons
  fetch('data/UrbAglo_AQdata.csv')
    .then(response => response.text())
    .then(csvData => {
      console.log("CSV data fetched.");
      parsedData = Papa.parse(csvData, { header: true });
      console.log("CSV data parsed:", parsedData.data);

      // Calculate average PM 2.5 for all years and all urban areas
      let averages = calculateAverages(parsedData.data);

      // Initialize the chart with average data
      updateChart(Object.values(averages));

      // Fetch GeoJSON data for centroids and add to map
      fetch('data/centroids2.geojson')
        .then(response => response.json())
        .then(centroidData => {
          console.log("Centroid GeoJSON data fetched.");

          // Add GeoJSON source for centroids
          map.addSource('urban-centroids', {
            'type': 'geojson',
            'data': centroidData,
            'maxzoom': 23
          });

          // Add point layer for urban centroids
          map.addLayer({
            'id': 'urban-centroids-point',
            'type': 'circle',
            'source': 'urban-centroids',
            'layout': { },
            'paint': {
              'circle-radius': 5,
              'circle-color': '#FF7043' // Updated circle color
            },
            'minzoom': 0,
            'maxzoom': 10
          });

          // Event to update the chart when a centroid is clicked
          map.on('click', 'urban-centroids-point', function(e) {
            let cityName = e.features[0].properties.agglosName;
            handleChartUpdate(cityName);
          });
        })
        .catch(error => console.error('Error loading centroid GeoJSON data:', error));

      // Fetch GeoJSON data for polygons and add to map
      //fetch('data/AFRICAPOLIS2020.geojson')
      fetch('https://marvingrobles.com/data/AFRICAPOLIS2020.geojson')
        .then(response => response.json())
        .then(data => {
          console.log("Polygon GeoJSON data fetched.");

          // Add GeoJSON source for polygons
          map.addSource('urban-areas', {
            'type': 'geojson',
            'data': data
          });

          // Add polygon layer for urban areas
          map.addLayer({
            'id': 'urban-areas-polygon',
            'type': 'fill',
            'source': 'urban-areas',
            'layout': {},
            'paint': {
              'fill-color': '#4CAF50', // Updated fill color
              'fill-opacity': 0.8,
              'fill-outline-color': '#81C784' // Updated stroke color
            },
            'minzoom': 8,
            'maxzoom': 22
          });

          // Event to update the chart when a polygon is clicked
          map.on('click', 'urban-areas-polygon', function(e) {
            let cityName = e.features[0].properties.agglosName;
            handleChartUpdate(cityName);
          });
        })
        .catch(error => console.error('Error loading polygon GeoJSON data:', error));
    })
    .catch(error => console.error('Error loading CSV data:', error));
});

map.on('click', 'urban-centroids-point', function(e) {
  if (e.features.length > 0) {
    let cityName = e.features[0].properties.agglosName;
    if (cityName) {
      handleChartUpdate(cityName);
    } else {
      console.error('City name not found in the clicked feature:', e.features[0]);
    }
  } else {
    console.error('No features found in the click event:', e);
  }
});


// Function to calculate averages
function calculateAverages(data) {
  let averages = {};
  data.forEach(row => {
    for (let year = 1998; year <= 2020; year++) {
      if (!averages[year]) averages[year] = [];
      averages[year].push(parseFloat(row[`X${year}`]) || 0);
    }
  });

  for (let year in averages) {
    let sum = averages[year].reduce((a, b) => a + b, 0);
    averages[year] = sum / averages[year].length;
  }
  return averages;
}




map.on('contextmenu', function() {
console.log("Right click event triggered");

// Calculate average PM 2.5 for all years and all urban areas
let averages = {};
parsedData.data.forEach(row => {
  for (let year = 1998; year <= 2020; year++) {
    if (!averages[year]) averages[year] = [];
    averages[year].push(parseFloat(row[`X${year}`]) || 0);
  }
});

for (let year in averages) {
  let sum = averages[year].reduce((a, b) => a + b, 0);
  averages[year] = sum / averages[year].length;
}

// Update the chart with average data
updateChart(Object.values(averages));
});


document.getElementById('reset-btn').addEventListener('click', function() {
  // Reset map to initial center and zoom level
  map.flyTo({
    center: [0, 0],
    zoom: 5
  });

  // Reset chart to show average of all urban areas
  // Calculate average PM 2.5 for all years and all urban areas
  let averages = {};
  parsedData.data.forEach(row => {
    for (let year = 1998; year <= 2020; year++) {
      if (!averages[year]) averages[year] = [];
      averages[year].push(parseFloat(row[`X${year}`]) || 0);
    }
  });

  for (let year in averages) {
    let sum = averages[year].reduce((a, b) => a + b, 0);
    averages[year] = sum / averages[year].length;
  }

  // Update the chart with average data
  updateChart(Object.values(averages));
});

