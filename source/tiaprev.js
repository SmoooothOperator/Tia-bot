require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let newMember = [];
let verrifyRequest = [];

const verifyMessageFormat =
  /^(.+)\s*\|\s*(warren|sixth|seventh|revelle|muir|marshall|erc)\s*\|\s*(1[0-9]|2[0-9]|30)$/i;

client.on("ready", () => {
  console.log(`🏎️  ${client.user.tag} is online!`);
});

client.on("guildMemberAdd", (member) => {
  console.log(member.id);
  newMember.push(member.id);
  console.log(newMember);
});

client.on("messageCreate", (message) => {
  console.log(message.content);
  console.log(message.author.id);

  if (
    //newMember.includes(message.author.id) &&
    verifyMessageFormat.test(message.content.trim())
  ) {
    const [, name, college, year] = message.content.match(verifyMessageFormat);
    console.log(`name is ${name.trim()}`);
    console.log(college.trim());
    console.log(year.trim());
    message.member
      .setNickname(`${name.trim()} | ${college.trim()} | ${year.trim()}`)
      .catch((error) => {
        console.error("Error setting nickname:", error);
      });
    const index = newMember.indexOf(message.author.id);
    if (index > -1) {
      newMember.splice(index, 1);
    }
  }
  // else{
  //   message.reply(`Sorry, looks like you need manual verification from a board member, please wait just a moment, I have pinged them to help you out!`)
  // }
});

client.on("messageCreate", (message) => {
  if (
    message.author.id === "551279669979119616" &&
    message.content === "STOP120399"
  ) {
    console.log("Putting Tia to sleep...");
    client.destroy();
  }
});

client.login(process.env.TOKEN);
