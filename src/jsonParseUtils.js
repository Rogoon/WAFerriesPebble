var uitls = require('timeUtils');


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

    // Add to menu items array
    items.push({
      title:abbrev_name,
      subtitle:full_name,
      id:id
    });
  }
  return items;
}

function parseSailings(data, route){
  
  var items = [];
  for(var i in data) {
    
    // Get Route ID
    var depart_id = data[i].DepartingTerminalID;
    var arrive_id = data[i].ArrivingTerminalID;
    
    // Get sailing name
    var sailing_name = data[i].DepartingDescription.substring(0, 6) + ' / ' + data[i].ArrivingDescription.substring(0, 6);
   
    // Add to menu items array
    items.push({
      title:sailing_name,
      depart_id:depart_id,
      arrive_id:arrive_id,
      route_id:route.id
    });
  }
  return items;
}

function parseTimes(data, sailing){  
  var items = [];
  for (var i = 0; i < data.TerminalCombos.length; i++) {
    if (data.TerminalCombos[i].DepartingTerminalID == sailing.depart_id && data.TerminalCombos[i].ArrivingTerminalID == sailing.arrive_id){
      for (var j = 0; j < data.TerminalCombos[i].Times.length; j++){
        var now = new Date();
        var depart = new Date(parseInt(data.TerminalCombos[i].Times[j].DepartingTime.substring(6,19)));
        // Only add future s~ailings
        if (now.getTime() < depart.getTime()){
          var title = uitls.convertTime(data.TerminalCombos[i].Times[j].DepartingTime);
          // Add to menu items array
          items.push({
            title:title,
            route_name:sailing.title,
            time: new Date(parseInt(data.TerminalCombos[i].Times[j].DepartingTime.substring(6,19))),
            empty: false
          });
        }
      } 
    }
  }
}
  
function parseAlerts(data, sailing){  
  var items = [];
  for (var i = 0; i < data.Alerts.length; i++) {
    items.push({
      title: data.Alerts[i].AlertFullTitle,
      subtitle: data.Alerts[i].AlertFullText
    });
  }
  if (data.Alerts.length === 0){
    items.push({
      title: "No Active Alerts"
    });
  }
  return items;
}

module.exports.parseRoutes = parseRoutes;
module.exports.parseSailings = parseSailings;
module.exports.parseTimes = parseTimes;
module.exports.parseAlerts = parseAlerts;