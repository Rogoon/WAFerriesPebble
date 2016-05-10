// Util functions

/**
 * Parses json feed time for current hour and formats. 
 * @param time from ferries API JSON feed
 */
function convertTime(time){
  
  var date = new Date(parseInt(time.substring(6, 19)));

  var hours = parseInt(date.getHours());
  var mins = parseInt(date.getMinutes());
  var ampm = 'am';
  
  switch(hours){
    case 0:
      hours = 12;
      break;
    case 12:
      ampm = 'pm';
      break;
    default:
      if (parseInt(date.getHours()) > 12){
        hours = hours - 12;
        ampm = 'pm';
      }
  }
  
  if(mins < 10){
    mins = mins + '0';
  }
  
  return hours + ':' + mins + ' ' + ampm;
}

/**
 * Converts current time into YYYY-MM-DD for api call.
 */
function getToday(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;
  return today;
}

function getTomorrow(){
  var tomorrow = new Date();
  var dd = tomorrow.getDate() + 1;
  var mm = tomorrow.getMonth() + 1;
  var yyyy = tomorrow.getFullYear();
  tomorrow = yyyy + '-' + mm + '-' + dd;
  return tomorrow;
}

// Export
module.exports.convertTime = convertTime;
module.exports.getToday = getToday;
module.exports.getTomorrow = getTomorrow;