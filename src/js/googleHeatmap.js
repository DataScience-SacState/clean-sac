$(document).ready(function() {

  //initMap() -> fetchListandCreateHeatMap -> heatmap
  initMap();
  console.log("map created")

  $("#slideupBtn").on("click", function() {
    $("#filters").toggleClass("open");
  });

  $("#togglebtn").on("click", function() {
    $("#dropdown").toggleClass("open");
  });

  // Initialize Filters
  $("#filtersList").html(createFilterListItems(state.filters));


  var $filter, filterIndex, tmpState, updatedFilters;

  $("#filtersList").on("click", "li", function() {
    //tmpState = _.cloneDeep(state);
    $filter = $(this);
    filterIndex = _.findIndex( state.filters, [ 'name', $filter.text() ] );

    //Flip clicked filter
    console.log($filter + filterIndex)
    state.filters[filterIndex].checked = !state.filters[filterIndex].checked;
    state.filterStatus = true;

    //state = tmpState
    renderFilters();
    updateHeatmap();
    logCurrentState();

  });
  //createFilterEventListeners(filters);

  

});

// --- App State --- 

var state = {};
state.filters = [
    "Graffiti",
    "Trees",
    "Illegal Dumping",
    "Pavement",
    "Traffic Sign Complaints",
    "Sweeper Request",
    "Stray Animals",
    "Abandoned Vehicles"
  ];
state.filters = state.filters.map(function(filter) {
    return {
      "name": filter,
      "checked": false
    }
  });
state.filterStatus = false;
state.loaded = false;
logCurrentState();

// --- Functions ---

var map, heatmap, reportsJson, googleMVCArray;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: {lat: 38.5, lng: -121.4},
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: true,
    zoomControl: true,
    zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP
    },
    mapTypeControl: false,
  });

  fetchListandCreateHeatMap(map);  
}

function fetchListandCreateHeatMap(map) {

  // Display heat map is "loading..."
  if (!state.loaded) {
    $(".title").html('Loading <i class="fa fa-refresh fa-spin"></i>')
  }

  var url = "http://159.203.247.240:3000/reports.json"
  console.log(url)
  //var url = "data.json"

  console.log("STARTING FETCH")
  fetch(url)
    .then(function(res) {
      return res.json()
    })
    .then(function(json) {
      console.log("creating heatmap")
      reportsJson = json;
      console.log(json)

      var googlePoints = processDataToGoogleArray(reportsJson);
      heatmap = new google.maps.visualization.HeatmapLayer({
        data: googlePoints,
        map: map,
        radius: 20
      });
      state.loaded = true;
      $(".title").text("Heat Map")

      console.log("heatmap loaded to map")
      
    })
}

function processDataToGoogleArray(data) {

  // Has a filter been flipped? 

  var toggledFilters = getToggledFilters();
  console.log(toggledFilters)

  if (!toggledFilters.length) {

    state.filterStatus = false;

    var processedData = data.map(function(point) {
      return new google.maps.LatLng(point.latitude, point.longitude);
    });

  }else{

    state.filterStatus = true;

    var processedData = data.filter(function(data) {
      return _.includes(toggledFilters, data.type)
    })
    .map(function(point) {
      return new google.maps.LatLng(point.latitude, point.longitude);
    });

  }

  return googleMVCArray = new google.maps.MVCArray(processedData);
}

function getToggledFilters() {
  return state.filters.filter(function(filter) {
    return filter.checked
  })
  .map(function(filter){
    return filter.name;
  });
}

function createFilterListItems() {

  var filterHTML = state.filters.map(function(filter) {
    return `<li class="${filter.checked? "filter checked" : "filter"}" id="${_.lowerCase(filter.name)}Filter">${filter.name}</li>`
  })
  .join('')

  return filterHTML;
}

function renderFilters() {
  $("#filtersList").html(createFilterListItems());  
}

function updateHeatmap() {
  googleMVCArray.clear();
  //reportsJson

  var toggledFilters = getToggledFilters();
  console.log(toggledFilters)

  if (!toggledFilters.length) {

    state.filterStatus = false;

    reportsJson.map(function(point) {
      googleMVCArray.push( new google.maps.LatLng(point.latitude, point.longitude) );
    });

  }else{

    state.filterStatus = true;

    reportsJson.filter(function(data) {
      return _.includes(toggledFilters, data.type)
    })
    .map(function(point) {
      googleMVCArray.push( new google.maps.LatLng(point.latitude, point.longitude) );
    });

  }
  console.log("heatmap updated")
}

function logCurrentState() {
  console.log("--- Current State: ---")
  console.log(state);
}

function heatmapLoaded() {
  if (state.loaded) {
    return true;
  } else {
    return false;
  }
}