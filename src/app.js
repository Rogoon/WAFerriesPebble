/**
 * WA Ferries App
 *
 * Author: Rogoon
 *         simnic31
 */
var DEBUG = true;

var UI = require('ui');
var ajax = require('ajax');
var uitls = require('timeUtils');
var jsonParse = require('jsonParseUtils');
var timeline = require('timeline');

// Global UI 
var Vector2 = require('vector2');
var splashWindow = new UI.Window();

// Global values
var today = uitls.getToday();
var tomorrow = uitls.getTomorrow();

/**This is a bunch of junk that didn't work
  *It was all as easy as just making a funciont WHO KNEW.
  *
  *var tomorrow = uitls.getToday().tomorrow.setDate(today.getDate() + 1);
  *var tomorrow = new Date();
  *tomorrow.setDate(tomorrow.getDate() + 1);
  */

var fail_bg = '#b30000';

var primary = '#1976D2';
var secondary = '#2196F3';
var accent = "#00b300";

// Gets this all going
loadRoutesData();

// Push a pin when the app starts
function pushpin(time) {
  // An hour ahead
  var date = new Date();
  date.setHours(date.getHours() + 1);

  // Create the pin
  var pin = {
    "id": date.getTime().toString(),
    "time": time.time.toISOString(),
    "layout": {
      "type": "genericPin",
      "title": time.route_name,
      "subtitle": "Ferry Departure",
      "tinyIcon": "system://images/NOTIFICATION_LIGHTHOUSE",
      "backgroundColor":secondary
    }
  };

  console.log('Inserting pin in the future: ' + JSON.stringify(pin));

  // Push the pin
  timeline.insertUserPin(pin, function(responseText) {
    console.log('Result: ' + responseText);
  });
}


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
 * Loads a success screen
 * @param message to be displayed on screen.
 */
function displaySuccessScreen(message){
  
  var successCard = new UI.Card({
    title: "\n" + message,
    backgroundColor: accent,
    textAlign:'center',
    titleColor: '#FFFFFF'
  });

  successCard.show();  
  setTimeout(function () {
      successCard.hide();
    }, 2000);
}

/**
 * Builds a menu item with routes data
 * @param data for menu
 */
function displayRoutesMenu(data){
  // Construct Menu to show to user

  // Add data & style to menu
  var routesMenu = new UI.Menu({
    
    backgroundColor: primary,
    highlightBackgroundColor: secondary,
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
 * Builds a menu for selecting day
 */
function displayDaysMenu(data){
  // Construct Menu to show to user

  //create menu items
  var items = [];
  items.push({
    title:"Today"
  });
  items.push({
    title:"Tomorrow"
  });
  
  // Add data & style to menu
  var daysMenu = new UI.Menu({
    
    backgroundColor: primary,
    highlightBackgroundColor: secondary,
    textColor: '#FFFFFF',
    highlightTextColor: '#FFFFFF',
    sections: [{
      title: 'Departure Day',
      items: items
    }]
  });
  
  // Add an action for SELECT
  daysMenu.on('select', function(e) {
    
    switch (e.itemIndex){
      case 0:
        loadTimesData(data, true);
        break;
      case 1:
        loadTimesData(data, false);
        break;
    }
  });
  
  // Show the Menu, hide the splash
  daysMenu.show();
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
    
    backgroundColor: primary,
    highlightBackgroundColor: secondary,
    textColor: '#FFFFFF',
    highlightTextColor: '#FFFFFF',
    sections: [{
      title: 'Sailings',
      items: data
    }]
  });
  
  // Add an action for SELECT
  sailingsMenu.on('select', function(e) {
    displayDaysMenu(data[e.itemIndex]);
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
  
  var timesMenu = new UI.Menu({
    
    backgroundColor: primary,
    highlightBackgroundColor: secondary,
    textColor: '#FFFFFF',
    highlightTextColor: '#FFFFFF',
    sections: [{
      title: 'Times',
      items: data
    }]
  });
  
  if (!data[0].empty){
  
    // Add an action for SELECT
    timesMenu.on('select', function(e) {
      displayActionWindow(data[e.itemIndex]);
    });
  
  }
    
  // Show the Menu, hide the splash
  timesMenu.show();
  splashWindow.hide(); 
}

function displayActionWindow(time){
  
  var actionCard = new UI.Card({
    
    action: {
      up: "images/action_bar_icon_check",
      down: "images/action_bar_icon_dismiss",
      backgroundColor: "black"
    },
    title: "Add\n" + time.title + " departure to timeline?",
    backgroundColor: primary,
    titleColor: "#FFFFFF"
    
  });
  
  actionCard.on('click', 'up', function() {
    pushpin(time);
    displaySuccessScreen("Added to timeline!");
    actionCard.hide();
  });
  
  actionCard.on('click', 'down', function() {
    actionCard.hide();
  });
  actionCard.show();  
}

/**
 * Ajax call for route data.
 */
function loadRoutesData(){

  displaySplashScreen('Downloading Routes Data...', primary);
  
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
  displaySplashScreen("Downloading Sailings Data...", primary);
  
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
function loadTimesData(sailing, selectToday){
  if (DEBUG){
    console.log("");
  }
  displaySplashScreen("Downloading Times Data...", primary);
  
  var timesURL = "";
  
  if(selectToday){
    timesURL = 'http://www.wsdot.wa.gov/ferries/api/schedule/rest/schedule/' + today + '/' + sailing.route_id  + '?apiaccesscode=' + API_KEY;
  }else{
    timesURL = 'http://www.wsdot.wa.gov/ferries/api/schedule/rest/schedule/' + tomorrow + '/' + sailing.route_id  + '?apiaccesscode=' + API_KEY;
  }
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