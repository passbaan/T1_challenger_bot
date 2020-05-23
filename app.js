const tmi = require("tmi.js");
require("dotenv").config();
var https = require("https");
var http = require("http");
var fs = require("fs");

const URLLOW =
  "https://na1.api.riotgames.com/lol/league-exp/v4/entries/RANKED_SOLO_5x5/CHALLENGER/I?page=2&";
const URLHIGH =
  "https://na1.api.riotgames.com/lol/league-exp/v4/entries/RANKED_SOLO_5x5/CHALLENGER/I?page=1&";
const GMURL =
  "https://na1.api.riotgames.com/lol/league-exp/v4/entries/RANKED_SOLO_5x5/GRANDMASTER/I?page=1&";
const buzzLightYear = "YYz-xLXeLaUJyox7yDfjirMT2p1bV512_mJ6XHF-Ssr8-mZW";
const SUMMONER_URL =
  "https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/" +
  buzzLightYear +
  "?";

let api = `api_key=${process.env.RIOT_KEY}`;

let rankInfo = "";
let last_time;
// Delay for updating list in seconds
const seconds = 30;

let chals = [];
let challengers = [];

let gms = [];
let gmas = [];

let buzzlightyear99 = null;

lowestChal = "";

let doChallenger = "";
let doTyler = "";

let pause = false;

const joinedChannel = "spectatetyler1";

const random = [
  {
    rank: 82,
    lp: 423,
    summoner: "BUZZLIGHTYEAR99",
    tier: "GRANDMASTER",
  },
];

function getFirstPage() {
  rankInfo = "";
  if (
    buzzlightyear99.tier.toLowerCase() !== "master" &&
    buzzlightyear99.tier.toLowerCase() !== "grandmaster" &&
    buzzlightyear99.tier.toLowerCase() !== "challenger"
  ) {
    rankInfo = `WeirdChamp :point_right: MASTER/GM/CHAL. OKAY_CHAMP :point_right: ${buzzlightyear99.tier}${buzzlightyear99.rank} ${buzzlightyear99.lp}LP.`;

    doChallenger =
      "You should be ashamed of yourself. PogO :point_right: :door: ";
    doTyler = rankInfo;

    return;
  }
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
      chals = responses[0];

      getLastpage();
    });
    res.on("error", function (error) {
      console.error(error);
    });
  });
}
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
  GM_CHAL = GM_CHAL.concat(buzzlightyear99);
  sortByKey(GM_CHAL, "lp");

  let can_challenger = false;
  let buzzlightyear_index = 0;
  for (let i = 299; i >= 0; --i) {
    if (GM_CHAL[i].summoner.toLowerCase() === "buzzlightyear99") {
      can_challenger = true;
      buzzlightyear_index = i;
      break;
    }
  }
  if (can_challenger) {
    const buzz_player = GM_CHAL[buzzlightyear_index];
    if (buzz_player.tier.toLowerCase() === "grandmaster") {
      rankInfo = `Pog ${buzz_player.summoner.toLowerCase()} ${
        buzz_player.lp
      }LP is elibile for Rank ${buzzlightyear_index + 1} challenger.`;
      doChallenger = rankInfo;
    } else if (buzz_player.tier.toLowerCase() === "challenger") {
      rankInfo = `${buzz_player.summoner} ${buzz_player.lp}LP is Rank ${
        buzzlightyear_index + 1
      } challenger.`;
      doChallenger = rankInfo;
    }
    doTyler = `buzzlightyear99 ${
      buzzlightyear99.lp
    } ${buzzlightyear99.tier.toLowerCase()}  needs ${
      GM_CHAL[buzzlightyear_index - 1].lp - buzzlightyear99.lp + 1
    } more LP to overtake "${GM_CHAL[buzzlightyear_index - 1].summoner}" ${
      GM_CHAL[buzzlightyear_index - 1].lp
    }LP  for rank ${buzzlightyear_index}.`;
  } else {
    const cut = GM_CHAL[299].lp + 1;
    rankInfo = `Need ${cut}LP to overtake current rank 300 contender.`;
    rankInfo += ` Current Rank 300 is ${lowestChal}LP.`;
    doChallenger = rankInfo;
    doTyler = `buzzlightyear99 ${
      buzzlightyear99.lp
    }LP ${buzzlightyear99.tier.toLowerCase()}  needs ${
      GM_CHAL[299].lp - buzzlightyear99.lp + 1
    } more LP to overtake "${GM_CHAL[299].summoner}" ${
      GM_CHAL[299].lp
    }LP  for rank 300 contender.`;
  }
  doChallenger += ` Ladder updates at 11.45pm PST.`;
  doTyler += ` Ladder updates at 11.45pm PST.`;
  last_time = new Date();
  /* console.log("Console Log: : getCutoff -> doChallenger", doChallenger);
  console.log("Console Log: : getCutoff -> doTyler", doTyler); */
}

function sortByKey(array, key) {
  return array.sort(function (a, b) {
    var x = a[key];
    var y = b[key];
    return x > y ? -1 : x < y ? 1 : 0;
  });
}

function getT1Rank() {
  const responses = [];
  https.get(SUMMONER_URL + api, (res) => {
    var chunks = [];
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      responses.push(JSON.parse(body));
      const t1 = responses[0][0];
      buzzlightyear99 = {
        lp: t1.leaguePoints,
        summoner: t1.summonerName,
        tier: t1.tier,
        rank: t1.rank,
      };
      getFirstPage();
      setTimeout(() => {
        if (!pause) {
          getT1Rank();
        }
      }, seconds * 1000);
    });
    res.on("error", function (error) {
      console.error(error);
    });
  });
}

function pauseLoop() {
  pause = true;
}

function startLoop() {
  pause = false;
  api = `&api_key=${process.env.RIOT_KEY}`;
  getT1Rank();
}

setTimeout(() => {
  const client = new tmi.Client({
    options: { debug: true },
    connection: {
      secure: true,
      reconnect: true,
    },
    identity: {
      username: "ChallengerPolice",
      password: `${process.env.TWITCH_PASS}`,
    },
    channels: [`#${joinedChannel}`],
  });

  client.connect();
  var substring = "!challenger";
  var pauseText = "!challengerpolice_pause";
  var startText = "!challengerpolice_start";
  var tylerText = "!tyler";
  var policeText = "!police";
  // console.log(client.getOptions());
  client.on("chat", (channel, user, message, self) => {
    // Ignore echoed messages.
    if (self) return;
    if (message.toLowerCase() === substring) {
      setTimeout(() => {
        let current_time = new Date();
        var seconds = (current_time.getTime() - last_time.getTime()) / 1000;
        client.say(
          joinedChannel,
          `/me ${doChallenger} @${user.username} Updated ${Math.trunc(
            seconds
          )} seconds ago peepoClap !tyler new command OhISee`
        );
      }, 200);
    } else if (message.toLowerCase() === policeText) {
      setTimeout(() => {
        let current_time = new Date();
        var seconds = (current_time.getTime() - last_time.getTime()) / 1000;
        client.say(
          joinedChannel,
          `/me I can do two tricks !challenger and !tyler @${user.username}`
        );
      }, 200);
    } else if (message.toLowerCase() === tylerText) {
      setTimeout(() => {
        let current_time = new Date();
        var seconds = (current_time.getTime() - last_time.getTime()) / 1000;
        client.say(
          joinedChannel,
          `/me ${doTyler} @${user.username} Updated ${Math.trunc(
            seconds
          )} seconds ago peepoClap !tyler new command OhISee`
        );
      }, 200);
    } else if (
      (message.toLowerCase() === pauseText &&
        user.username.toLowerCase() === "radiqall") ||
      user.username.toLowerCase() === "challengerpolice"
    ) {
      console.log(user.username);
      pauseLoop();
      client.action(
        joinedChannel,
        `Challenger Updates paused for maintaince!  `
      );
    } else if (
      (message.toLowerCase() === startText &&
        user.username.toLowerCase() === "radiqall") ||
      user.username.toLowerCase() === "challengerpolice"
    ) {
      client.action(
        joinedChannel,
        `Challenger Updates restored after maintaince! MrDestructoid Clap !police`
      );
      startLoop();
    }
  });
}, 5000);

// Start the loop

getT1Rank();
