// Uitl functions

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

// returns current date in YYYY-MM-DD format.
function getToday(){
  today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;
  return today;
}



// Export
module.exports.convertTime();
module.exports.getToday();