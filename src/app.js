/**
 * Pebble WS Ferries
 */
var DEBUG = true;

var UI = require('ui');
var ajax = require('ajax');

// UI ///////////////////////////////
var Vector2 = require('vector2');
var splashWindow = new UI.Window();

// Loads the splash screen to be displayed while fetching data
function displaySplashScreen(){

  // Text element to inform user
  var text = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    text:'Downloading ferry data...',
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
  var resultsMenu = new UI.Menu({
    
    backgroundColor: '#1976D2',
    highlightBackgroundColor: '#2196F3',
    textColor: '#FFFFFF',
    highlightTextColor: '#FFFFFF',
    sections: [{
      title: 'Routes',
      items: data
    }]
  });
  
  // Show the Menu, hide the splash
  resultsMenu.show();
  splashWindow.hide(); 
}

// Main Logic ////////////////////////////

// Construct URL
var today = getToday();
var API_KEY = 'INSERT_API_KEY_HERE';
var URL = 'http://www.wsdot.wa.gov/ferries/api/schedule/rest/routes/' + today + '?apiaccesscode=' + API_KEY;

displaySplashScreen();

// Make the request
ajax(
  {
    url: URL,
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
