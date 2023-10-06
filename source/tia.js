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
//TestintroduceChannelID: 1128908643174199337
const miaId = "1128508029424373861";
const verifyChannelID = "902108236713426975";
//TestverifyChannelID: 1128908643174199337
const memberRoleID = "812038184246181960";
//TestmemeberRoleID: 1135788464105857114

// Function for non-blocking delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Array for new member IDs
let newMember = [];
// Variables for timestamp check
let lastVerifyTime = 0;
const twoMin = 2 * 60 * 1000;

// Message content formats
const verifyMessageFormat =
  /^(.+)\s*\|\s*(warren|sixth|seventh|revelle|muir|marshall|erc|eighth)\s*\|\s*(1[0-9]'*|2[0-9]'*|20[1-3][0-9])$/i;

const verifyMessageFormat2 =
  /^(.+)\s*\/\s*(warren|sixth|seventh|revelle|muir|marshall|erc|eighth)\s*\/\s*(1[0-9]'*|2[0-9]'*|20[1-3][0-9])$/i;

const verifyMessageFormat3 =
  /^(.+)\s*\,\s*(warren|sixth|seventh|revelle|muir|marshall|erc|eighth)\s*\,\s*(1[0-9]'*|2[0-9]'*|20[1-3][0-9])$/i;

const differentThanVerifyFormat =
  /^(.+)\s*\|\s*(.+)\s*\|\s*(1[0-9]'*|2[0-9]'*|20[1-3][0-9])$/i;

const differentThanVerifyFormat2 =
  /^(.+)\s*\/\s*(.+)\s*\/\s*(1[0-9]'*|2[0-9]'*|20[1-3][0-9])$/i;

const differentThanVerifyFormat3 =
  /^(.+)\s*\,\s*(.+)\s*\,\s*(1[0-9]'*|2[0-9]'*|20[1-3][0-9])$/i;

//Ready event
client.on("ready", () => {
  console.log(`🏎️  ${client.user.tag} is online!`);
  client.user.setActivity({
    name: "Brad lie",
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
    // newMember.includes(message.author.id) &&
    (verifyMessageFormat.test(message.content.trim()) &&
      message.channelId === verifyChannelID) ||
    (verifyMessageFormat2.test(message.content.trim()) &&
      message.channelId === verifyChannelID) ||
    (verifyMessageFormat3.test(message.content.trim()) &&
      message.channelId === verifyChannelID)
  ) {
    console.log(`trying...`);
    let name;
    let college;
    let year;

    try {
      //Get name, college, year from message
      if (verifyMessageFormat.test(message.content.trim())) {
        [, name, college, year] = message.content.match(verifyMessageFormat);
      } else if (verifyMessageFormat2.test(message.content.trim())) {
        [, name, college, year] = message.content.match(verifyMessageFormat2);
      } else {
        [, name, college, year] = message.content.match(verifyMessageFormat3);
      }

      //Capitalize first letters
      name = name.charAt(0).toUpperCase() + name.slice(1);
      college = college.charAt(0).toUpperCase() + college.slice(1);

      //Account for people typing 2025, 2024 instead of 25,24
      if (parseInt(year) > 2000) {
        year = (parseInt(year) - 2000).toString();
      }

      //Remove ' if it exists
      if (year.charAt(year.length - 1) == "'") {
        console.log(`${year.length}`);

        console.log(`In year '`);
        let deleteLastChar = year.slice(0, -1);
        year = deleteLastChar;
        console.log(`${year}`);
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
      const memberRole = message.guild.roles.cache.get(memberRoleID);
      await message.member.roles.add(memberRole);

      //Delete from new member array
      const index = newMember.indexOf(message.author.id);
      if (index > -1) {
        newMember.splice(index, 1);
      }
      lastVerifyTime = createdTime;

      //Reply
      message.reply(
        `You are verified! Feel free to introduce yourself in <#${introduceChannelID}> !!`
      );
      console.log(`Done!`);
    } catch (error) {
      console.log(error);
    }
  }

  //If not UCSD, reply "need manual verification"
  else if (
    (!verifyMessageFormat.test(message.content.trim()) &&
      differentThanVerifyFormat.test(message.content.trim()) &&
      message.channelId === verifyChannelID) ||
    (!verifyMessageFormat2.test(message.content.trim()) &&
      differentThanVerifyFormat2.test(message.content.trim()) &&
      message.channelId === verifyChannelID) ||
    (!verifyMessageFormat3.test(message.content.trim()) &&
      differentThanVerifyFormat3.test(message.content.trim()) &&
      message.channelId === verifyChannelID)
  ) {
    message.reply(
      `I am sorry, it appears you need manual verification. A board member will verify you shortly.`
    );
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
