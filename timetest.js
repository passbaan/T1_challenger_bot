let utc = new Date().getTime();
let time = new Date();
const dSave = 1;
let offset = (8 - dSave) * 60 * 60 * 1000;
let current = new Date(utc - offset);
let Ladder = new Date(utc - offset);

Ladder.setUTCHours(23);
Ladder.setUTCMinutes(45);
Ladder.setUTCSeconds(0);

if (Ladder < current) {
  Ladder.setUTCDate(Ladder.getUTCDate() + 1);
}

console.log("Console Log: : msToTime(Ladder - x)", msToTime(Ladder - current));

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  if (hours > 0) {
    hours = hours > 1 ? hours + " hours" : hours + " hour";
  } else {
    hours = "";
  }
  if (minutes > 0) {
    minutes = minutes > 1 ? minutes + " minutes" : minutes + " minute";
  } else {
    minutes = "";
  }
  if (seconds > 0) {
    seconds = seconds > 1 ? seconds + " seconds" : seconds + " second";
  } else {
    seconds = "now";
  }

  let outText = hours !== "" ? hours + ", " : "";
  outText += minutes !== "" ? minutes + " and " : "";
  return outText + " " + seconds;
}

/* 
Check the date for 
Check if time is greater than 11:45PM PST


*/
