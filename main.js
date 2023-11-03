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
      scales: {
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

map.on('load', function () {
  console.log("Map loaded.");

  // Initialize chart with empty data
  initializeChart();

  // Fetch GeoJSON data and add to map
  fetch('data/AFRICAPOLIS2020.geojson')
    .then(response => response.json())
    .then(data => {
      console.log("GeoJSON data fetched.");

      // Add GeoJSON source
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

      // Add point layer for urban areas
      map.addLayer({
        'id': 'urban-areas-point',
        'type': 'circle',
        'source': 'urban-areas',
        'layout': {},
        'paint': {
          'circle-radius': 5,
          'circle-color': '#FF7043' // Updated circle color
        },
        'minzoom': 0,
        'maxzoom': 10
      });

            
      // Event to update the chart when an urban area is clicked
      map.on('click', 'urban-areas-polygon', function(e) {
        console.log("Click event triggered");

        let cityName = e.features[0].properties.agglosName;
        console.log("Clicked on city:", cityName);

        // Search for the city data in the parsed CSV data
        let cityData = parsedData.data.find(row => row.Agglomeration_Name === cityName);

        if (cityData) {
          // Extract PM 2.5 data for the selected city
          let cityPMData = {};
          for (let year = 1998; year <= 2020; year++) {
            cityPMData[year] = parseFloat(cityData[`X${year}`]) || 0;
          }
          console.log("Data for chart:", cityPMData);

          // Update the chart with city-specific data
          updateChart(cityPMData, cityName);
        } else {
          console.log("No data found for city:", cityName);
        }
      });

    })
    .catch(error => console.error('Error loading GeoJSON data:', error));

  // Fetch and parse CSV data
  fetch('data/UrbAglo_AQdata.csv')
    .then(response => response.text())
    .then(csvData => {
      console.log("CSV data fetched.");
      parsedData = Papa.parse(csvData, { header: true });
      console.log("CSV data parsed:", parsedData.data);

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

      // Initialize the chart with average data
      updateChart(Object.values(averages));
 
      // Event to update the chart when an urban area is clicked
      map.on('click', 'urban-areas-polygon', function(e) {
        //console.log("Click event triggered");  // Verify that the click event is firing
        
        let cityName = e.features[0].properties.agglosName;
        console.log("Clicked on city:", cityName);  // Verify the city name
        
        // Search for the city data in the parsed CSV data
        // Note: 'Agglomeration_Name' should match the column name in your CSV
        let cityData = parsedData.data.find(row => row.Agglomeration_Name === cityName);
        
        if (cityData) {
          let cityValues = [];
          for (let year = 1998; year <= 2020; year++) {
            cityValues.push(parseFloat(cityData[`X${year}`]) || 0);
          }
          console.log("Data for chart:", cityValues);  // Verify the data
          updateChart(cityValues);
        } else {
          console.log("No data found for city:", cityName);  // Verify if no data was found
        }
      });


      

    })
    .catch(error => console.error('Error loading CSV data:', error));
});


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

