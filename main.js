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
let myChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['1998', '1999', '2000', /* ... */ '2020'],
    datasets: [{
      label: 'PM 2.5',
      data: [],  // This will be populated later
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  }
});

// Function to update the chart
function updateChart(data) {
  myChart.data.datasets[0].data = data;
  myChart.update();
}

// Listen for zoom events and log the current zoom level
map.on('zoom', function() {
  var zoomLevel = map.getZoom();
  console.log('Current Zoom Level:', zoomLevel);
});

map.on('load', function () {
  console.log("Map loaded.");

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
          'fill-color': '#088',
          'fill-opacity': 0.8
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
          'circle-color': '#f00'
        },
        'minzoom': 0,
        'maxzoom': 10
      });
    })
    .catch(error => console.error('Error loading GeoJSON data:', error));

  // Fetch and parse CSV data
  fetch('data/UrbAglo_AQdata.csv')
    .then(response => response.text())
    .then(csvData => {
      console.log("CSV data fetched.");
      const parsedData = Papa.parse(csvData, { header: true });
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
        console.log("Click event triggered");  // Verify that the click event is firing
        
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



