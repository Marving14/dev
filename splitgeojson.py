
# http://marvingrobles.com/data/AFRICAPOLIS2020.geojson

import geojson

# Load the original GeoJSON file
with open('original.geojson', 'r') as file:
    data = geojson.load(file)

# Define empty GeoJSON structures for the zones
zones = {
    'north': {'type': 'FeatureCollection', 'features': []},
    'south': {'type': 'FeatureCollection', 'features': []},
    'east': {'type': 'FeatureCollection', 'features': []},
    'west': {'type': 'FeatureCollection', 'features': []},
    'central': {'type': 'FeatureCollection', 'features': []}
}

# Function to determine the zone of a feature (you need to implement this)
def get_zone(feature):
    # Implement your logic to determine the zone based on the feature properties or geometry
    # For example:
    # if feature['properties']['zone'] == 'North':
    #     return 'north'
    # ...
    # This is a placeholder, replace with your actual logic
    pass

# Split features into zones
for feature in data['features']:
    zone = get_zone(feature)
    if zone in zones:
        zones[zone]['features'].append(feature)

# Save the split GeoJSON files
for zone_name, zone_data in zones.items():
    with open(f'{zone_name}.geojson', 'w') as file:
        geojson.dump(zone_data, file)

print("GeoJSON files have been split into zones.")
