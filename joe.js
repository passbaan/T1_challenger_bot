const tmi = require("tmi.js");
require("dotenv").config();
var axios = require("axios");
var https = require("https");
var fs = require("fs");
const refresh = 30;

const URLLOW =
  "https://euw1.api.riotgames.com/lol/league-exp/v4/entries/RANKED_SOLO_5x5/CHALLENGER/I?page=2&";
const URLHIGH =
  "https://euw1.api.riotgames.com/lol/league-exp/v4/entries/RANKED_SOLO_5x5/CHALLENGER/I?page=1&";
const GMURL =
  "https://euw1.api.riotgames.com/lol/league-exp/v4/entries/RANKED_SOLO_5x5/GRANDMASTER/I?page=1&";

/* const buzzLightYear = "YYz-xLXeLaUJyox7yDfjirMT2p1bV512_mJ6XHF-Ssr8-mZW";
const s8issofun = "RP5DGXs4P_ttDlQXi677S-JS48-m5hcnceJAj5siDSNJ8ZM";
const nightblue3 = "qu5FJhMyCshaG3RdaSfFkgZ7fRP7qnhcaGTLqrfGNmXZZhE"; */
const kleptoArena = "hh80ea7w3btdkDchf9Gqq_DLKaMJ3pjpTbsx_EWcxPQNl4H8";
const joefisx20s = "rwWAEsgL6YNjYfJme580kT1IsoJN6hUV74Id9qiIclwH-UY";
const SUMMONER_URL =
  "https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/";

const MAIN_URL = SUMMONER_URL + joefisx20s + "?";
const SMURF_URL = SUMMONER_URL + kleptoArena + "?";
// const NB3_URL = SUMMONER_URL + nightblue3 + "?";

let api = `api_key=${process.env.RIOT_KEY}`;

let last_time = new Date();
const outputs = {
  main: {},
  smurf: {},
  chal: "",
};

let pause = false;
/* Time Settings */
let utc = new Date().getTime();
const dSave = 1;
let offset = (8 - dSave) * 60 * 60 * 1000;
let Ladder = new Date(utc - offset);
Ladder.setUTCHours(23);
Ladder.setUTCMinutes(45);
Ladder.setUTCSeconds(0);

const joinedChannel = "spectatejoefisx20s";

async function getFirstPage() {
  /* * * * * * * * * * * * * * * * * * * * * * *
   * * * * * * * * * * * * * * * * * * * * * * *
   *  STEP 1:                            * * * *
   *  GET ALL DATA FROM RIOT API AT ONCE * * * *
   * * * * * * * * * * * * * * * * * * * * * * *
   * * * * * * * * * * * * * * * * * * * * * * *
   */
  rankInfo = "";

  let Chals1_res = "";
  let Chals2_res = "";
  let Gms_res = "";
  let main_res = "";
  let smurf_res = "";

  try {
    const urls = {
      chall_1: URLHIGH + api,
      chall_2: URLLOW + api,
      gm_1: GMURL + api,

      main: MAIN_URL + api,
      smurf: SMURF_URL + api,
    };

    Chals1_res = await axios.get(urls.chall_1);

    Chals2_res = await axios.get(urls.chall_2);

    Gms_res = await axios.get(urls.gm_1);

    // Buzzlightyear99 data
    main_res = await axios.get(urls.main);
    outputs.main.res = main_res.data;
    // S8 Is So Fun Data
    smurf_res = await axios.get(urls.smurf);
    outputs.smurf.res = smurf_res.data;

    

    // Step 2 COMBINE CHALLENGER ARRAY
    let chals = [];
    chals = await Chals1_res.data;

    // var lastElement = Chals2_res.data[Chals2_res.data.length - 1];
    chals = chals.concat(await Chals2_res.data);
    let challengers = [];
    chals.map((chal, index) => {
      challengers.push({
        rank: index + 1,
        lp: chal.leaguePoints,
        summoner: chal.summonerName,
        tier: chal.tier,
      });
    });
    last_time = new Date();
    gms = [];
    gmas = [];
    gms = Gms_res.data;

    gms.map((gm, index) => {
      gmas.push({
        rank: index + 1,
        lp: gm.leaguePoints,
        summoner: gm.summonerName,
        tier: gm.tier,
      });
    });
    let GM_CHAL = challengers.concat(gmas);
    sortByKey(GM_CHAL, "lp");
    GM_CHAL.map((x, i) => {
      x.index = i;
    });

    // Produce Challenger cutoff
    const cut = GM_CHAL[299].lp + 1;
    let cutoff = `Need ${cut}LP to beat current rank 300 contender.`;
    outputs.chal = cutoff;
    

    // Get
    getPlayer(GM_CHAL, "main");
    getPlayer(GM_CHAL, "smurf");
    
    setTimeout(() => {
      if (!pause) {
        getFirstPage();
      }
    }, refresh * 1000);
    
  } catch (error) {
    console.log(error);
  }
}

function sortByKey(array, key) {
  return array.sort(function (a, b) {
    var x = a[key];
    var y = b[key];
    return x > y ? -1 : x < y ? 1 : 0;
  });
}
function getPlayer(list, outputIndex) {
  let tt = outputs[outputIndex].res;
  let soloIndex = 0;
  for (let i = 0; i < tt.length; ++i) {
    if (tt.queueType === "RANKED_SOLO_5x5") {
      soloIndex = i;
      break;
    }
  }
  tt = outputs[outputIndex].res[0];
 /*  fs.writeFile(`${outputIndex}.json`, JSON.stringify(tt), function (err) {
    if (err) throw err;
  });
 */
  let outText = "";
  const player_rank = {
    lp: tt.leaguePoints,
    summoner: tt.summonerName,
    tier: tt.tier,
    rank: tt.rank,
  };
  outText = `"${player_rank.summoner}" is `;
  if (tt["miniSeries"] !== undefined) {
    outText += `in ${player_rank.tier} ${player_rank.rank}+  promos. And Needs ${tt["miniSeries"].target} Wins.`;
    outText += `Currently ${tt["miniSeries"].wins} Wins and ${tt["miniSeries"].losses} losses.`;
  } else if (
    player_rank.tier.toLowerCase() !== "grandmaster" &&
    player_rank.tier.toLowerCase() !== "master" &&
    player_rank.tier.toLowerCase() !== "challenger"
  ) {
    outText += `Currently ${player_rank.tier} ${player_rank.rank} ${player_rank.lp}LP.`;
    // Player is below Master Tier
  } else {
    let can_challenger = false;
    let overtake_index = 0;
    for (let i = 299; i >= 0; --i) {
      if (
        list[i].summoner.toLowerCase() === player_rank.summoner.toLowerCase()
      ) {
        can_challenger = true;
        overtake_index = i;
        break;
      }
    }

    if (can_challenger) {
      const buzz_player = list[overtake_index];
      if (buzz_player.tier.toLowerCase() === "grandmaster") {
        outText += `${buzz_player.tier.toLowerCase()} ${
          buzz_player.lp
        }LP is elgibile for min Rank ${
          overtake_index + 1
        } challenger by the time ladder updates. If no one overtakes him.`;
      } else if (buzz_player.tier.toLowerCase() === "challenger") {
        outText += `${buzz_player.lp}LP Rank ${
          overtake_index + 1
        } challenger and needs  ${
          list[overtake_index - 1].lp - player_rank.lp + 1
        } more LP to beat "${list[overtake_index - 1].summoner}" ${
          list[overtake_index - 1].lp
        }LP  for rank ${overtake_index} challenger.`;
      }
    } else {
      outText += `${player_rank.lp}LP ${
        player_rank.tier.toLowerCase() === "challenger"
          ? "chall(for now)"
          : player_rank.tier.toLowerCase()
      } and needs ${list[299].lp - player_rank.lp + 1} more LP  to beat "${
        list[299].summoner
      }" ${list[299].lp}LP  for rank 300 contender.`;
    }
  }
  outputs[outputIndex].text = outText;
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
  var cutoff = "!cutoff";
  var main = "!main";
  var smurf = "!smurf";

  var pauseText = "!challengerpolice_pause";
  var startText = "!challengerpolice_update";

  var policeText = "!commands";
  var yoinkText = "!yoink";

  var fuckedText = "!fuck";

  console.log(client.getOptions());

  client.on("chat", (channel, user, message, self) => {
    // Ignore echoed messages.
    if (self) return;
    switch (message.toLowerCase()) {
      case cutoff:
        setTimeout(() => {
          let current_time = new Date();
          utc = new Date().getTime();
          let current = new Date(utc - offset);
          var seconds = (current_time.getTime() - last_time.getTime()) / 1000;
          if (Ladder < current) {
            Ladder.setUTCDate(Ladder.getUTCDate() + 1);
          }

          client.say(
            joinedChannel,
            ` ${outputs.chal} Ladder updates in ${msToTime(
              Ladder - current
            )}. @${user.username} Updated ${
              seconds > 0 ? Math.trunc(seconds) : "now"
            } seconds ago`
          );
        }, 200);
        break;
      case main:
        setTimeout(() => {
          let current_time = new Date();
          utc = new Date().getTime();
          let current = new Date(utc - offset);
          var seconds = (current_time.getTime() - last_time.getTime()) / 1000;
          if (Ladder < current) {
            Ladder.setUTCDate(Ladder.getUTCDate() + 1);
          }
          client.say(
            joinedChannel,
            ` ${outputs.main.text} Ladder updates in ${msToTime(
              Ladder - current
            )}. @${user.username}  Updated ${
              seconds > 0 ? Math.trunc(seconds) : "now"
            } seconds ago `
          );
        }, 200);
        break;
      case smurf:
        setTimeout(() => {
          let current_time = new Date();
          utc = new Date().getTime();
          let current = new Date(utc - offset);
          var seconds = (current_time.getTime() - last_time.getTime()) / 1000;
          if (Ladder < current) {
            Ladder.setUTCDate(Ladder.getUTCDate() + 1);
          }
          client.say(
            joinedChannel,
            ` ${outputs.smurf.text} Ladder updates in ${msToTime(
              Ladder - current
            )}. @${user.username}  Updated ${
              seconds > 0 ? Math.trunc(seconds) : "now"
            } seconds ago `
          );
        }, 200);
        break;

      case policeText:
        setTimeout(() => {
          client.say(
            joinedChannel,
            `My daddy taught me these tricks -> !main, !smurf !cutoff @${user.username}`
          );
        }, 200);
        break;
      case fuckedText:
        setTimeout(() => {
          let current_time = new Date();
          var seconds = (current_time.getTime() - last_time.getTime()) / 1000;
          client.say(
            joinedChannel,
            `${user.username} wants to say... And I'm the first person to stand up and say: this is fucked, this is not right, this is not cool, this is fucking bullshit. This is fucking bullshit.`
          );
        }, 200);

      case pauseText:
        if (
          user.username.toLowerCase() === "radiqall" ||
          user.username.toLowerCase() === "challengerpolice"
        ) {
          pauseLoop();
          client.action(
            joinedChannel,
            `Challenger Updates paused for maintaince!`
          );
        }
        break;
      case startText:
        if (
          user.username.toLowerCase() === "radiqall" ||
          user.username.toLowerCase() === "challengerpolice"
        ) {
          client.action(
            joinedChannel,
            `Challenger Updates restored after maintaince! MrDestructoid !police`
          );
          startLoop();
        }
        break;
      case yoinkText:
        if (user.username.toLowerCase() === "radiqall") {
          client.say(joinedChannel, `!give radiqall all`);
        }
      default:
        return;
    }
  });
}, 5000);

getFirstPage();

// MISC FUNCTIONS
function pauseLoop() {
  pause = true;
}
function startLoop() {
  pause = false;
  api = `&api_key=${process.env.RIOT_KEY}`;
  getFirstPage();
}

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
