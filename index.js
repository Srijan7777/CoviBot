const Discord = require('discord.js')
const axios = require('axios')
const keepAlive =require('./server')
const mainWebsite = "https://www.covid19india.org/";
const mainWebsiteFavicon = "https://www.covid19india.org/favicon-32x32.png";
const apiURL = "https://api.covid19india.org/data.json";
const apiURL_district =
  "https://api.covid19india.org/v2/state_district_wise.json";

let totalCases;
let totalActive;
let totalRecovered;
let totalDeaths;
let lastUpdated;
let statewise;
let districtwise;
let tested;
let firstdoseadministered;
const hour = 1000 * 60 * 60; 
const embedColor = "#2a9d8f";

const client = new Discord.Client();

function fetchData()
{
  axios
  .get(apiURL)
  .then(res=>{
    statewise = res.data.statewise;
      totalCases = statewise[0].confirmed;
      deltaTotalCases = statewise[0].deltaconfirmed;
      totalActive = statewise[0].active;
      totalRecovered = statewise[0].recovered;
      deltaRecovered = statewise[0].deltarecovered;
      totalDeaths = statewise[0].deaths;
      deltaDeaths = statewise[0].deltadeaths;
      lastUpdated = statewise[0].lastupdatedtime;
     })
  .catch((error) => {
      console.log(error);
    });
    
      axios
    .get(apiURL_district)
    .then((res) => {
      districtwise = res.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

client.once("ready", () => {
  console.log("The bot is ready!");

  client.user.setActivity("!covid-19", { type: "WATCHING" });

  fetchData();
  setInterval(fetchData, hour);
});
client.on("message", (message) => {
  const messageContent = message.content;

  if (
    messageContent.startsWith("!covid") ||
    messageContent.startsWith("!covid19") ||
    messageContent.startsWith("!covid-19")
  ) {
    const embed = new Discord.MessageEmbed()
      .setColor(embedColor)
      .setTitle("COVID-19 INDIA")
      .setURL(mainWebsite)
      .setDescription(
        "**Type in `!covid-19 states` to get a list of states with statecodes**."
      )
      .setFooter("COVID-19 India unofficial Discord bot", mainWebsiteFavicon);

    let remainingStates;

    const code =
      messageContent.split(" ")[1] == null
        ? ""
        : messageContent.split(" ")[1].trim();

    const codeParam1 =
      messageContent.split(" ")[2] == null
        ? ""
        : messageContent.split(" ")[2].trim();

    if (code == null || code.length == 0)
      embed.addFields(
        {
          name: "**Total # of cases**",
          value: totalCases + " (+" + deltaTotalCases + ")",
        },
        {
          name: "**Active cases**",
          value: totalActive,
        },
        {
          name: "**Recovery**",
          value: totalRecovered + " (+" + deltaRecovered + ")",
        },
        {
          name: "**Deaths**",
          value: totalDeaths + " (+" + deltaDeaths + ")",
        },
        {
          name: "**Last updated**",
          value: lastUpdated,
        }
      );
    if (code.toLowerCase() == "states") {
      const description =
        "**• Type in `!covid-19 <statecode>` to get details about that state**.\nExample: `!covid-19 DL` to get details about New Delhi.\n\n• **Type `!covid-19 <statecode> districtwise` to get district-wise breakdown**.\nExample: `!covid-19 MH districtwise` to get district-wise details about Maharashtra";

      embed.setDescription(description);

      // Discord allows upto 25 fields only
      if (statewise.length > 25) {
        remainingStates = new Discord.MessageEmbed().setColor(embedColor);
      }

      statewise.forEach((item, index) => {
        if (index != 0)
          if (index > 25)
            remainingStates.addFields({
              name: "**" + index + ". " + item.statecode + "**",
              value: item.state,
            });
          else
            embed.addFields({
              name: "**" + index + ". " + item.statecode + "**",
              value: item.state,
            });
      });
    }

    if (code.length == 2) {
      if (codeParam1.toLowerCase() == "districtwise") {
        districtwise.forEach((item, index) => {
          if (item.statecode == code.toUpperCase()) {
            embed.setDescription(
              "**District-wise cases of " + item.state + "**"
            );

            let districtList = new Array();
            item.districtData.forEach((district, i) => {
              districtList.push(district);
            });

            let districtChunks = new Array();
            while (districtList.length) {
              districtChunks.push(districtList.splice(0, 10));
            }

            for (let i = 0; i < districtChunks.length; ++i)
              districtChunks[i].forEach((d) => {
                embed.addFields({
                  name: "**" + d.district + ":** " + d.confirmed + " cases",
                  value: "\u200B",
                });
              });

            message.channel.send(
              "Showing top 25 districts only, for complete details visit: " +
                mainWebsite
            );
          }
        });

      }
       else {
        statewise.forEach((item, index) => {
          if (item.statecode == code.toUpperCase()) {
            embed
              .addFields(
                {
                  name: "**Total cases**",
                  value: item.confirmed + " (+" + item.deltaconfirmed + ")",
                },
                {
                  name: "**Active cases**",
                  value: item.active,
                },
                {
                  name: "**Recovered**",
                  value: item.recovered + " (+" + item.deltarecovered + ")",
                },
                {
                  name: "**Deaths**",
                  value: item.deaths + " (+" + item.deltadeaths + ")",
                },
                {
                  name: "Last updated on",
                  value: item.lastupdatedtime,
                }
              );
          }
        });
      }
    }

    message.channel.send(embed);
    if (remainingStates != null) message.channel.send(remainingStates);
  }
});
keepAlive()
const mySecret = process.env['TOKEN']
client.login(mySecret)