import geopandas as gpd

# Load your GeoJSON file
gdf = gpd.read_file('data/AFRICAPOLIS2020.geojson')

# Check the current CRS
print("Current CRS:", gdf.crs)

# If the CRS is geographic (like EPSG:4326), re-project to a projected CRS
# You need to choose a suitable projected CRS for your specific geographic location
# For example, using a common world projection like EPSG:3857 (Web Mercator)
gdf_projected = gdf.to_crs('EPSG:3857')  # Replace 'EPSG:3857' with a suitable projected CRS for your data

# Calculate the centroids in the projected CRS
gdf_projected['geometry'] = gdf_projected['geometry'].centroid

# If you want to convert back to the original CRS after calculating centroids
gdf_centroids = gdf_projected.to_crs(gdf.crs)

# Save the new GeoJSON file with centroids
gdf_centroids.to_file('data/centroids2.geojson', driver='GeoJSON')

print("Centroids GeoJSON file has been created.")
