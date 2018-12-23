// Map layers
var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });
// Light map tiles
var light = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

var baseMaps = {
  Light: light,
  Satellite: satellite,
}
// Fmarker radius based on magnitude
function markerSize(magn){
  // return magn*5*10**4;
  return magn*5;
}

// Function to define the color of the circles
function colorScale(d) {
  return d > 6 ? '#800026' :
         d > 5  ? '#BD0026' :
         d > 4  ? '#E31A1C' :
         d > 3  ? '#FFCC33' :
         d > 2   ? '#FED976' :
         d > 1   ? '#ffff00' :
                    '#bfff00';
}


var EURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
var earthquakeMarkers = [];
var plateMarkers = [];
var legendGroup = [];

d3.json(EURL, function(error, response){  
  if (error) throw error;

  response.features.forEach(f =>{
    // popup date and title
    var d = new Date(f.properties.time);
    var earthquakeDate = d.getMonth()+"-"+d.getDate()+"-"+d.getFullYear()+", "+d.getHours()+"h"+d.getMinutes()+" (GMT)";

    // earthquake marker
    earthquakeMarkers.push(
      L.circleMarker( [f.geometry.coordinates[1], f.geometry.coordinates[0]], {
        stroke: true,
        weight: 1,
        fillOpacity: 0.75,
        color: "gray",
        fillColor: colorScale(+f.properties.mag), // "#FFFF33",
        radius: markerSize(+f.properties.mag),
      }
      ).bindPopup("<p>"+f.properties.place+"</p>\
                  <p>"+earthquakeDate+"</p>\
                  <p>Magn. "+f.properties.mag+"</p>")
    );

  });
  var earthquakeLayer = L.layerGroup(earthquakeMarkers)
// URL for tectonic plates
  PlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
  d3.json(PlatesURL, function(error, response){  
    if (error) throw error;
    // looping through
    response.features.forEach(p =>{
      plateMarkers.push(
        L.geoJson(response, {
          style:{
            color:"blue",
            weigth:1,
            fill: false,
          }
        })
      )
    });
    var plateLayer = L.layerGroup(plateMarkers)
    // Legend
    var legend = L.control({position: 'bottomleft'});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5, 6],
            labels = [];
        // legend for densities
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colorScale(grades[i] + 0.5) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
  // Building the layers and maps
    var overlayMaps = {
      "Tectonic plates": plateLayer,
      "Earthquakes": earthquakeLayer,      
    }
    // Map object
    var myMap = L.map("map-id", {
      center: [30, -80],
      zoom: 3,
      layers: [light, plateLayer, earthquakeLayer]
    });
    // Layers
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap)
    // Legend
    legend.addTo(myMap);
  });
});