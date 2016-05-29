/**
 * WA Ferries App
 *
 * Author: Rogoon
 *         simnic31
 */
var DEBUG = true;

var API_KEY = '';

var UI = require('ui');
var Feature = require('platform/feature');
var ajax = require('ajax');
var uitls = require('timeUtils');
var jsonParse = require('jsonParseUtils');
var timeline = require('timeline');

// Global UI 
var splashCard = new UI.Card();
var textCard = new UI.Card();

// Global values
var today = uitls.getToday();
var tomorrow = uitls.getTomorrow();

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
      "backgroundColor":Feature.color(secondary, 'white'),
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
 */
function displaySplashScreen(message, bg_color){
  
  // Text element to inform user
  splashCard = new UI.Card({
    status: {
      separator: 'none',
    },
    title: message,
    titleColor:'#FFFFFF',
    textAlign:'center',
    backgroundColor: bg_color
  });
  
  splashCard.show();
}

function displayTextScreen(message, bg_color){
  
  // Text element to inform user
  textCard = new UI.Card({
    status: {
      separator: 'none',
    },
    scrollable: true,
    body: message.replace(/<(?:.|\n)*?>/gm, ''), // TH̘Ë͖́̉ ͠P̯͍̭O̚​N̐Y̡ H̸̡̪̯ͨ͊̽̅̾̎Ȩ̬̩̾͛ͪ̈́̀́͘ ̶̧̨̱̹̭̯ͧ̾ͬC̷̙̲̝͖ͭ̏ͥͮ͟Oͮ͏̮̪̝͍M̲̖͊̒ͪͩͬ̚̚͜Ȇ̴̟̟͙̞ͩ͌͝S̨̥̫͎̭ͯ̿̔̀ͅ
    bodyColor:'#FFFFFF',
    textAlign:'center',
    backgroundColor: bg_color
  });
  
  textCard.show();
}

/** 
 * displays a success screen for 2 seconds
 * @param message to be displayed on screen.
 */
function displaySuccessScreen(message){
  
  var successCard = new UI.Card({
    status: {
      separator: 'none',
    },
    title: "\n" + message,
    backgroundColor: Feature.color(accent, 'black'),
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
    status: {
      separator: 'none',
    },

    backgroundColor: Feature.color(primary, 'black'),
    highlightBackgroundColor: Feature.color(secondary, 'white'),
    textColor: '#FFFFFF',
    highlightTextColor: Feature.color('#FFFFFF', 'black'),
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
  splashCard.hide(); 
}

/**
 * Builds a menu for selecting day
 */
function displayDaysMenu(data){
  //create menu items
  var items = [];
  
  items.push({
    title:"Today"
  });
  items.push({
    title:"Tomorrow"
  });
  items.push({
    title:"Check For Alerts"
  });
  
  // Add data & style to menu
  var daysMenu = new UI.Menu({
    status: {
      separator: 'none',
    },

    backgroundColor: Feature.color(primary, 'black'),
    highlightBackgroundColor: Feature.color(secondary, 'white'),
    textColor: '#FFFFFF',
    highlightTextColor: Feature.color('#FFFFFF', 'black'),
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
      case 2:
        loadAlerts(data);
        break;
    }
  });
  
  // Show the Menu, hide the splash
  daysMenu.show();
  splashCard.hide(); 
}

/**
 * Builds a menu item with sailings data
 * @param data for menu
 */
function displaySailingsMenu(data){
  // Construct Menu to show to user

  // Add data & style to menu
  var sailingsMenu = new UI.Menu({
    status: {
      separator: 'none',
    },

    backgroundColor: Feature.color(primary, 'black'),
    highlightBackgroundColor: Feature.color(secondary, 'white'),
    textColor: '#FFFFFF',
    highlightTextColor: Feature.color('#FFFFFF', 'black'),
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
  splashCard.hide(); 
}

/**
 * Builds a menu item with times data
 * @param data for menu
 */
function displayTimesMenu(data){
  
  var timesMenu = new UI.Menu({
    status: {
      separator: 'none',
    },

    backgroundColor: Feature.color(primary, 'black'),
    highlightBackgroundColor: Feature.color(secondary, 'white'),
    textColor: '#FFFFFF',
    highlightTextColor: Feature.color('#FFFFFF', 'black'),
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
  splashCard.hide(); 
}

function displayAlertsMenu(alerts){
  
  var alertsMenu = new UI.Menu({
    status: {
      separator: 'none',
    },

    backgroundColor: Feature.color(primary, 'black'),
    highlightBackgroundColor: Feature.color(secondary, 'white'),
    textColor: '#FFFFFF',
    highlightTextColor: Feature.color('#FFFFFF', 'black'),
    sections: [{
      title: 'Alerts',
      items: alerts
    }],
  });
  
  // Add an action for SELECT
  alertsMenu.on('select', function(e) {
      displayTextScreen(alerts[e.itemIndex].subtitle, primary);
  });
  
  // Show the Menu, hide the splash
  alertsMenu.show();
  splashCard.hide();
}

function displayActionWindow(time){
  
  var actionCard = new UI.Card({
    status: {
      separator: 'none',
    },
    action: {
      up: "images/action_bar_icon_check",
      down: "images/action_bar_icon_dismiss",
      backgroundColor: "black"
    },
    title: "Add\n" + time.title + " departure to timeline?",
    backgroundColor: Feature.color(primary, 'black'),
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

function loadAlerts(sailing){
  
  displaySplashScreen("Checking for Alerts...", primary);
  var alertsURL = "";
  alertsURL = 'http://www.wsdot.wa.gov/ferries/api/schedule/rest/routedetails/' + today + '/' + sailing.route_id + '?apiaccesscode=' + API_KEY;

  ajax(
    {
      url: alertsURL,
      type: 'json'
    },
    function(data) {
      // Success!
      var menuItems = jsonParse.parseAlerts(data, sailing);
    
      if (DEBUG){
        console.log('Successfully fetched times data!');
        // Check the items are extracted OK
        for(var i = 0; i < menuItems.length; i++) {
          console.log(menuItems[i].title);
        }
      }
      if (DEBUG){
        console.log(menuItems);
      }
      displayAlertsMenu(menuItems);
    },
    function(error) {
      // Failure!
      displaySplashScreen('Failed to load data.', fail_bg);
      console.log('Failed fetching times data: ' + error);
    });
}