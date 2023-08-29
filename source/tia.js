require("dotenv").config();
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const introduceChannelID = "962256471003918366";
const miaId = "1128508029424373861";

// Function for non-blocking delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Array for new member IDs
let newMember = [];
// Variables for timestamp check
let lastVerifyTime = 0;
const twoMin = 2 * 60 * 1000;

// Message content format
const verifyMessageFormat =
  /^(.+)\s*\|\s*(warren|sixth|seventh|revelle|muir|marshall|erc)\s*\|\s*(1[0-9]|2[0-9]|20[1-3][0-9])$/i;

client.on("ready", () => {
  console.log(`🏎️  ${client.user.tag} is online!`);
  client.user.setActivity({
    name: "headlights go down",
    type: ActivityType.Watching,
  });
});

// Adds new member's id to the newMember array
client.on("guildMemberAdd", (member) => {
  newMember.push(member.id);
});

let processing = false;
//Main function for verifying member
client.on("messageCreate", async (message) => {
  if (verifyMessageFormat.test(message.content.trim()) && processing == true) {
    await message.reply(
      `Sorry I am verifying another human, please wait 2 min and try again!`
    );
    return;
  }
  processing = true;

  const createdTime = message.createdTimestamp;

  //See if the message matches any variant of the format and is sent int the message channel
  if (
    //newMember.includes(message.author.id) &&
    verifyMessageFormat.test(message.content.trim()) &&
    message.channelId === "902108236713426975"
  ) {
    console.log(`trying...`);
    try {
      //Get name, college, year from message
      let [, name, college, year] = message.content.match(verifyMessageFormat);

      //Capitalize first letters
      name = name.charAt(0).toUpperCase() + name.slice(1);
      college = college.charAt(0).toUpperCase() + college.slice(1);

      //Account for people typing 2025, 2024 instead of 25,24
      if (parseInt(year) > 2000) {
        year = (parseInt(year) - 2000).toString();
      }

      //Delay verification if interval too small
      while (Date.now() - twoMin < lastVerifyTime) {
        await sleep(100);
      }

      //Set nickname according to format
      await message.member.setNickname(
        `${name.trim()} | ${college.trim()} | ${year.trim()}`
      );

      //Give out member role
      const memberRole = message.guild.roles.cache.get("812038184246181960");
      await message.member.roles.add(memberRole);

      //Delete from new member array
      const index = newMember.indexOf(message.author.id);
      if (index > -1) {
        newMember.splice(index, 1);
      }
      lastVerifyTime = createdTime;

      //Reply
      message.reply(
        `You are verified! Go introduce yourself in <#${introduceChannelID}> !!`
      );
      console.log(`Done!`);
    } catch (error) {
      console.log(error);
    }
  }
  processing = false;
});

//Used for miata command in Mia
client.on("messageCreate", async (message) => {
  if (
    message.author.id === "551279669979119616" &&
    message.content === "KILL123567"
  ) {
    console.log("Putting Tia to sleep...");
    client.destroy();
  }
  if (
    message.content.includes("_MIATA_") &&
    miaId.includes(message.author.id)
  ) {
    await sleep(1000);
    message.reply("_IS_");
  } else if (
    message.content.includes("_ALWAYS_") &&
    miaId.includes(message.author.id)
  ) {
    await sleep(1000);
    message.reply("_THE_");
  } else if (
    message.content.includes("_ANSWER!") &&
    miaId.includes(message.author.id)
  ) {
    await sleep(1000);
    message.reply({
      content:
        "https://static.wikia.nocookie.net/disney/images/c/cd/Profile_-_Mia_and_Tia.jpg/revision/latest?cb=20190528140824",
    });
  }
});

client.login(process.env.TOKEN);
