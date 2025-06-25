require("dotenv").config();
//verify function import
const verify = require("./verify");
const read_write = require("./read_write");
const {
  Client,
  GatewayIntentBits,
  ActivityType,
  Events,
  Partials,
} = require("discord.js");
const { boardChannelID } = require("../../constants");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
  ],
});

const introduceChannelID = "962256471003918366";
//TestintroduceChannelID: 1128908643174199337
const miaId = "1128508029424373861";
const verifyChannelID = "902108236713426975";
//ActualChannelID = "902108236713426975"
//TestverifyChannelID: 1141162992310960218
const memberRoleID = "812038184246181960";
//TestmemeberRoleID: 1135788464105857114
//const boardChannelID = "1120964377617637456";
//ActualboardChannelID = 1120964377617637456
const boardID = "812038215267254313";

// Function for non-blocking delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Array for new member IDs
let newMember = [];
// Message content formats
const verifyMessageFormat =
  /^(.+)\s*[|,/-]\s*(warren|sixth|seventh|revelle|muir|marshall|erc|eighth)\s*[|,/-]\s*(1[0-9]'*|2[0-9]'*|20[1-3][0-9])$/i;

const differentThanVerifyFormat =
  /^(.+)\s*[|,/-]\s*(.+)\s*[|,/-]\s*(1[0-9]'*|2[0-9]'*|20[1-3][0-9])$/i;

const differentThanVerifyFormat2 = /^(.+)\s*[|,/-]\s*(.+)\s*$/i;

//Ready event
client.on("ready", () => {
  console.log(`🏎️  ${client.user.tag} is online!`);
  client.user.setActivity({
    name: "Subarus blow up",
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

  const userID = message.author.id;
  if (message.channelId === verifyChannelID) {
    if (verifyMessageFormat.test(message.content.trim())) {
      console.log(`trying...`);
      let name;
      let college;
      let year;
      const guildMember = message.member;
      const server = message.guild;

      try {
        //TODO
        //IMPLEMENT A SWITCH
        //Get name, college, year from message
        [, name, college, year] = message.content.match(verifyMessageFormat);
        //Verify function
        verify(
          name,
          college,
          year,
          server,
          guildMember,
          memberRoleID,
          introduceChannelID,
          userID,
          verifyChannelID
        );
      } catch (error) {
        console.log(error);
      }
    }

    //If not UCSD, reply "need manual verification"
    //TODO
    //Send a message to board chat with the person's verify message
    //push the messageID of the board-message and original member verify message to a file
    //if someone in board replies yes to a message in the file, verify member and pop the board-message
    else if (
      differentThanVerifyFormat.test(message.content.trim()) ||
      differentThanVerifyFormat2.test(message.content.trim())
    ) {
      const userID = message.author.id;
      let name;
      let college;
      let year = null;
      //For non-UCSD people
      if (differentThanVerifyFormat.test(message.content.trim())) {
        [, name, college, year] = message.content.match(
          differentThanVerifyFormat
        );
        //For people with no years, such as HS
      } else {
        [, name, college] = message.content.match(differentThanVerifyFormat2);
      }
      //Get board channel
      const boardChannel = client.channels.cache.get(boardChannelID);
      //sentMessageID
      let sentMessageID;
      //Send message to boardChannel informing board of manual verification request
      boardChannel
        .send(
          `<@&${boardID}> ${name}, ${college} needs manual verification. Should I verify them? (Y/N)`
        )
        .then(async (sentMessage) => {
          console.log("Message sent with ID:", sentMessage.id);
          sentMessageID = sentMessage.id;
          //get the file that stores manual verification requests
          let existing_file = await read_write("manual_verify.json", 0);
          //if file is empty
          if (!existing_file) {
            existing_file = [];
          }
          //push the new request messageID into the file
          existing_file.push({
            boardMsgID: `${sentMessageID}`,
            userID: `${userID}`,
            name: `${name.trim()}`,
            college: `${college.trim()}`,
            year: `${year}`,
          });
          //write data
          await read_write("manual_verify.json", 1, existing_file);
        });
      message.reply(
        `I am sorry, it appears you need manual verification. A board member will verify you shortly.`
      );
    }
  }
  //See if the message matches any variant of the format and is sent int the message channel

  processing = false;
});
//-------------------------------------------------------------------------------------------------------------
client.on("messageCreate", async (message) => {
  const msgContent = message.content.trim().toLowerCase();
  const server = message.guild;
  console.log(server);
  //See if message is a reply
  if (message.reference) {
    //Load people that need manual verification
    let existing_file = await read_write("manual_verify.json", 0);
    //if file is empty
    if (!existing_file) {
      existing_file = [];
    }
    const parentID = message.reference.messageId;
    //See if the file contains the reply's parentID
    for (let entry of existing_file) {
      if (entry.boardMsgID === parentID && msgContent === "y") {
        const name = entry.name;
        const college = entry.college;
        const year = entry.year;
        const userID = entry.userID;
        const guildMember = await server.members.fetch(userID);
        console.log(guildMember);

        console.log(userID);
        //Call verify
        await verify(
          name,
          college,
          year,
          server,
          guildMember,
          memberRoleID,
          introduceChannelID,
          userID,
          verifyChannelID
        );
        //Remove entry from the JSON file
        existing_file = existing_file.filter((item) => item != entry);
        //Save file
        await read_write("manual_verify.json", 1, existing_file);
        break;
      } else if (entry.boardMsgID === parentID && msgContent === "n") {
        //Remove entry from the JSON file
        existing_file = existing_file.filter((item) => item != entry);
        //Save file
        await read_write("manual_verify.json", 1, existing_file);
        break;
      }
    }
  }

  //Used for miata command in Mia
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
