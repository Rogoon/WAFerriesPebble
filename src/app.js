/**
 * WA Ferries App
 *
 * Author: Rogoon
 */
var DEBUG = true;

var UI = require('ui');
var ajax = require('ajax');
var uitls = require('timeUtils');
var jsonParse = require('jsonParseUtils');

// Global UI 
var Vector2 = require('vector2');
var splashWindow = new UI.Window();

/** 
 * Loads the splash screen to be displayed while fetching data.
 * @param message to be displayed on screen.
 * @param background color of screen.
 *
 */
function displaySplashScreen(message, bg_color){
  
  splashWindow.each(function(element) {
    splashWindow.remove(element);
  });
  
  // Text element to inform user
  var text = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    text: message,
    font:'GOTHIC_28_BOLD',
    color:'#FFFFFF',
    textOverflow:'wrap',
    textAlign:'center',
    textColor:'#FFFFFF',
    backgroundColor: bg_color
  });
  
  // Add to splashWindow and show
  splashWindow.add(text);
  splashWindow.show();
}

/**
 * Builds a menu item with routes data
 * @param data for menu
 */
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

/**
 * Builds a menu item with sailings data
 * @param data for menu
 */
function displaySailingsMenu(data){
  // Construct Menu to show to user

  // Add data & style to menu
  var sailingsMenu = new UI.Menu({
    
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
  sailingsMenu.on('select', function(e) {
    loadTimesData(data[e.itemIndex]);
  });
  
  // Show the Menu, hide the splash
  sailingsMenu.show();
  splashWindow.hide(); 
}

/**
 * Builds a menu item with times data
 * @param data for menu
 */
function displayTimesMenu(data){
  // Construct Menu to show to user

  // Add data & style to menu
  var timesMenu = new UI.Menu({
    
    backgroundColor: '#1976D2',
    highlightBackgroundColor: '#2196F3',
    textColor: '#FFFFFF',
    highlightTextColor: '#FFFFFF',
    sections: [{
      title: 'Times',
      items: data
    }]
  });
  
  // Add an action for SELECT
  timesMenu.on('select', function(e) {
    // TODO: Push to timeline
  });
  
  // Show the Menu, hide the splash
  timesMenu.show();
  splashWindow.hide(); 
}

// Main
var today = uitls.getToday();
var API_KEY = 'INSERT_API_KEY_HERE';
var success_bg = '#1976D2';
var fail_bg = '#b30000';

// Gets this all going
loadRoutesData();

/**
 * Ajax call for route data.
 */
function loadRoutesData(){

  displaySplashScreen('Downloading Routes Data...', success_bg);
  
  var routesURL = 'http://www.wsdot.wa.gov/ferries/api/schedule/rest/routes/' + today + '?apiaccesscode=' + API_KEY;
  // Make the request for route data
  ajax(
    {
      url: routesURL,
      type: 'json'
    },
    function(data) {
      // Success!
      var menuItems = jsonParse.parseRoutes(data);
    
      if (DEBUG){
        console.log('Successfully fetched routes data!');
        // Check the items are extracted OK
        for(var i = 0; i < menuItems.length; i++) {
          console.log(menuItems[i].title + ' | ' + menuItems[i].id);
        }
      }
    
      displayRoutesMenu(menuItems);
    
    },
    function(error) {
      // Failure!
      displaySplashScreen('Failed to load data.', fail_bg);
      console.log('Failed fetching routes data: ' + error);
    }
  );
}
  
/**
 * Ajax call for sailings data.
 * @param data for selected route from routes menu.
 */
function loadSailingsData(route){
  if (DEBUG){
    console.log(route.id);
  }
  displaySplashScreen("Downloading Sailings Data...", success_bg);
  
  var sailingsURL = 'http://www.wsdot.wa.gov/ferries/api/schedule/rest//terminalsandmatesbyroute/' +  today + '/' + route.id + '?apiaccesscode=' + API_KEY;
  
  ajax(
    {
      url: sailingsURL,
      type: 'json'
    },
    function(data) {
      // Success!
      var menuItems = jsonParse.parseSailings(data, route);
    
      if (DEBUG){
        console.log('Successfully fetched sailing data!');
        // Check the items are extracted OK
        for(var i = 0; i < menuItems.length; i++) {
          console.log(menuItems[i].title);
        }
      }
      displaySailingsMenu(menuItems);
    },
    function(error) {
      // Failure!
      displaySplashScreen('Failed to load data.', fail_bg);
      console.log('Failed fetching sailing data: ' + error);
    }
  );
}

/**
 * Ajax call for times data.
 * @param data for selected sailing from sailings menu.
 */
function loadTimesData(sailing){
  if (DEBUG){
    console.log("");
  }
  displaySplashScreen("Downloading Times Data...", success_bg);
  
  var timesURL = 'http://www.wsdot.wa.gov/ferries/api/schedule/rest/schedule/' + today + '/' + sailing.route_id  + '?apiaccesscode=' + API_KEY;

  ajax(
    {
      url: timesURL,
      type: 'json'
    },
    function(data) {
      // Success!
      var menuItems = jsonParse.parseTimes(data, sailing);
    
      if (DEBUG){
        console.log('Successfully fetched times data!');
        // Check the items are extracted OK
        for(var i = 0; i < menuItems.length; i++) {
          console.log(menuItems[i].title);
        }
      }
      displayTimesMenu(menuItems);
    },
    function(error) {
      // Failure!
      displaySplashScreen('Failed to load data.', fail_bg);
      console.log('Failed fetching times data: ' + error);
    }
  );
}