const tmi = require("tmi.js");
require("dotenv").config();
var https = require("https");
var http = require("http");

const URL =
  "https://na1.api.riotgames.com/lol/league-exp/v4/entries/RANKED_SOLO_5x5/CHALLENGER/I?page=2";
const GMURL =
  "https://na1.api.riotgames.com/lol/league-exp/v4/entries/RANKED_SOLO_5x5/GRANDMASTER/I?page=1";
const api = `&api_key=${process.env.RIOT_KEY}`;
let rankInfo = "";
let last_time;
function getRank300() {
  const responses = [];
  https.get(URL + api, (res) => {
    var chunks = [];
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      responses.push(JSON.parse(body));
      //   console.log("Console Log: : responses", responses);
      var lastElement = responses[0][responses[0].length - 1];
      rankInfo = `Lowest Challenger: ${lastElement.leaguePoints}LP.`;
      getTopGM();
      setTimeout(() => {
        getRank300();
      }, 120000);
    });
    res.on("error", function (error) {
      console.error(error);
    });
  });
}
getRank300();
function getTopGM() {
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
      rankInfo += ` Highest GM : ${lastElement.leaguePoints}LP.`;
      last_time = new Date();
    });

    res.on("error", function (error) {
      console.error(error);
    });
  });
}

const client = new tmi.Client({
  options: { debug: true },
  connection: {
    secure: true,
    reconnect: true,
  },
  identity: {
    username: "radiqall",
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
