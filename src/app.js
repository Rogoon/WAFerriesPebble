/**
 * Pebble WS Ferries
 */
var DEBUG = true;

var UI = require('ui');
var ajax = require('ajax');

// Global UI ///////////////////////////////
var Vector2 = require('vector2');
var splashWindow = new UI.Window();

// Loads the splash screen to be displayed while fetching data
function displaySplashScreen(message){
  
  splashWindow.each(function(element) {
    splashWindow.remove(element);
  });
  
  // Text element to inform user
  var text = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    text: message,
    font:'GOTHIC_28_BOLD',
    color:'black',
    textOverflow:'wrap',
    textAlign:'center',
    textColor:'#FFFFFF',
    backgroundColor:'#1976D2'
  });

  // Add to splashWindow and show
  splashWindow.add(text);
  splashWindow.show();
}

function displayRoutesMenu(data){
  // Construct Menu to show to user

  // Add data & style to menu
  var routesMenu = new UI.Menu({
    
    backgroundColor: '#1976D2',
    highlightBackgroundColor: '#2196F3',
    textColor: '#FFFFFF',
    highlightTextColor: '#FFFFFF',
    sections: [{
      title: 'Routes',
      items: data
    }]
  });
  
  // Add an action for SELECT
  routesMenu.on('select', function(e) {
    loadSailingsData(data[e.itemIndex]);
  });
  
  // Show the Menu, hide the splash
  routesMenu.show();
  splashWindow.hide(); 
}

function displaySailingsMenu(data){
  // Construct Menu to show to user

  // Add data & style to menu
  var routesMenu = new UI.Menu({
    
    backgroundColor: '#1976D2',
    highlightBackgroundColor: '#2196F3',
    textColor: '#FFFFFF',
    highlightTextColor: '#FFFFFF',
    sections: [{
      title: 'Sailings',
      items: data
    }]
  });
  
  // Add an action for SELECT
  routesMenu.on('select', function(e) {
    // TODO
  });
  
  // Show the Menu, hide the splash
  routesMenu.show();
  splashWindow.hide(); 
}

// Main ////////////////////////////

// Construct URL
var today = getToday();
var API_KEY = 'INSERT_API_KEY';


loadRoutesData();

// AJAX functions ///////////////////
// Display splash screen, load ajax, calls menu builder

function loadRoutesData(){

  displaySplashScreen('Downloading ferry data...');
  
  var routesURL = 'http://www.wsdot.wa.gov/ferries/api/schedule/rest/routes/' + today + '?apiaccesscode=' + API_KEY;
  // Make the request for route data
  ajax(
    {
      url: routesURL,
      type: 'json'
    },
    function(data) {
      // Success!
      var menuItems = parseRoutes(data);
    
      if (DEBUG){
        console.log('Successfully fetched ferry data!');
        // Check the items are extracted OK
        for(var i = 0; i < menuItems.length; i++) {
          console.log(menuItems[i].title + ' | ' + menuItems[i].id);
        }
      }
    
      displayRoutesMenu(menuItems);
    
    },
    function(error) {
      // Failure!
      console.log('Failed fetching ferry data: ' + error);
    }
  );
}
  
function loadSailingsData(route){
  if (DEBUG){
    console.log(route.id);
  }
  displaySplashScreen("loading data...");
  
  var sailingsURL = "";
  
  //make ajax for sailings
  // Make the request for route data
  ajax(
    {
      url: sailingsURL,
      type: 'json'
    },
    function(data) {
      // Success!
      var menuItems = parseRoutes(data);
    
      if (DEBUG){
        console.log('Successfully fetched ferry data!');
        // Check the items are extracted OK
        for(var i = 0; i < menuItems.length; i++) {
          console.log(menuItems[i].title + ' | ' + menuItems[i].id);
        }
      }
    
      displaySailingsMenu(menuItems);
    
    },
    function(error) {
      // Failure!
      console.log('Failed fetching ferry data: ' + error);
    }
  );
  
}


// Util Functions //////////////////

// Returns a list of route names
function parseRoutes(data){
  
  var items = [];
  for(var i in data) {
    
    // Get Route ID
    var id = data[i].RouteID;
    
    // Get abbrev route name
    var abbrev_name = data[i].RouteAbbrev;
    abbrev_name = abbrev_name.toUpperCase();

    // Get full route name
    var full_name = data[i].Description;
    
    // TODO: check ServiceDisruptions field 

    // Add to menu items array
    items.push({
      title:abbrev_name,
      subtitle:full_name,
      id:id
    });
  }
  return items;
}

// returns current date in YYYY-MM-DD format.
function getToday(){
  today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;
  return today;
}
