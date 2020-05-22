const tmi = require("tmi.js");
require("dotenv").config();
var https = require("https");
var http = require("http");
var fs = require("fs");

const URLLOW =
  "https://na1.api.riotgames.com/lol/league-exp/v4/entries/RANKED_SOLO_5x5/CHALLENGER/I?page=2";
const URLHIGH =
  "https://na1.api.riotgames.com/lol/league-exp/v4/entries/RANKED_SOLO_5x5/CHALLENGER/I?page=1";
const GMURL =
  "https://na1.api.riotgames.com/lol/league-exp/v4/entries/RANKED_SOLO_5x5/GRANDMASTER/I?page=1";
const api = `&api_key=${process.env.RIOT_KEY}`;
let rankInfo = "";
let last_time;
const refreshDelay = 10;
let chals = [];
let challengers = [];
let gms = [];
let gmas = [];
lowestChal = "";
function getLastpage() {
  challengers = [];
  const responses = [];
  https.get(URLLOW + api, (res) => {
    var chunks = [];
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      responses.push(JSON.parse(body));
      var lastElement = responses[0][responses[0].length - 1];
      // rankInfo = `${lastElement.leaguePoints}LP is lowest challenger but...`;
      lowestChal = lastElement.leaguePoints;
      chals = chals.concat(responses[0]);

      chals.map((chal, index) => {
        challengers.push({
          rank: index + 1,
          lp: chal.leaguePoints,
          summoner: chal.summonerName,
          tier: chal.tier,
        });
      });

      getTopGM();
    });
    res.on("error", function (error) {
      console.error(error);
    });
  });
}

function getFirstPage() {
  rankInfo ="";
  chals = [];
  const responses = [];
  https.get(URLHIGH + api, (res) => {
    var chunks = [];
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      responses.push(JSON.parse(body));
      var lastElement = responses[0][responses[0].length - 1];
      // rankInfo = `Lowest Challenger: ${lastElement.leaguePoints}LP.`;
      chals = responses[0];

      getLastpage();
    });
    res.on("error", function (error) {
      console.error(error);
    });
  });
}

function getTopGM() {
  gms = [];
  gmas = [];
  const responses = [];
  https.get(GMURL + api, (res) => {
    var chunks = [];
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      responses.push(JSON.parse(body));
      var lastElement = responses[0][0];
      //   rankInfo += ` Highest GM : ${lastElement.leaguePoints}LP.`;
      last_time = new Date();

      gms = responses[0];

      gms.map((gm, index) => {
        gmas.push({
          rank: index + 1,
          lp: gm.leaguePoints,
          summoner: gm.summonerName,
          tier: gm.tier,
        });
      });

      getCutoff();
    });

    res.on("error", function (error) {
      console.error(error);
    });
  });
}
function getCutoff() {
  let GM_CHAL = challengers.concat(gmas);
  sortByKey(GM_CHAL, "lp");

  const cut = GM_CHAL[299].lp + 1;
  rankInfo += ` ${cut}LP needed to overtake current rank 300 contender for ladder update at 11:45pm PST. Lowest Chal: ${lowestChal}LP`;
  last_time = new Date();
  console.log(rankInfo);
  /* fs.writeFile("result.json", JSON.stringify(GM_CHAL), function (err) {
    if (err) throw err;
    console.log("Saved!");
  }); */
  setTimeout(() => {
    getFirstPage();
  }, refreshDelay*1000); 
}
getFirstPage();
function sortByKey(array, key) {
  return array.sort(function (a, b) {
    var x = a[key];
    var y = b[key];
    return x > y ? -1 : x < y ? 1 : 0;
  });
}
const client = new tmi.Client({
  options: { debug: true },
  connection: {
    secure: true,
    reconnect: true,
  },
  identity: {
    username: "t1challanger",
    password: `${process.env.TWITCH_PASS}`,
  },
  channels: ["#spectatetyler1"],
});

client.connect();
var substring = "!challenger";
console.log(client.getOptions());
client.on("chat", (channel, user, message, self) => {
  // Ignore echoed messages.
  if (self) return;
  if (message.toLowerCase().indexOf(substring) !== -1) {
	  setTimeout(() => {
		let current_time = new Date();
		var seconds = (current_time.getTime() - last_time.getTime()) / 1000;
		client.say("spectateTyler1", `@${user.username} ${rankInfo} Updated ${Math.trunc(seconds)} seconds ago`);
	  }, 1000);
  }
});