module.exports = async (
  name,
  college,
  year,
  server,
  guildMember,
  memberRoleID,
  introduceChannelID,
  userID,
  verifyChannelID
) => {
  //LowerCase all letters
  name = name.toLowerCase();
  college = college.toLowerCase();

  //Capitalize first letters
  name = name.charAt(0).toUpperCase() + name.slice(1);
  college = college.charAt(0).toUpperCase() + college.slice(1);
  if (college === "Sdsu") {
    college = "SDSU";
  } else if (college === "Hs") {
    college = "HS";
  }
  //Account for people typing 2025, 2024 instead of 25,24
  if (parseInt(year) > 2000) {
    year = (parseInt(year) - 2000).toString();
  }

  //Remove ' if it exists
  if (year.charAt(year.length - 1) == "'") {
    let deleteLastChar = year.slice(0, -1);
    year = deleteLastChar;
  }
  console.log(year);
  //Set nickname according to format
  if (year === "null") {
    await guildMember.setNickname(`${name.trim()} | ${college.trim()}`);
    console.log("here");
  } else {
    await guildMember.setNickname(
      `${name.trim()} | ${college.trim()} | ${year.trim()}`
    );
  }

  //Give out member role
  const memberRole = server.roles.cache.get(memberRoleID);
  await guildMember.roles.add(memberRole);

  //Reply with verification message
  const verifyChannel = server.channels.cache.get(verifyChannelID);
  verifyChannel.send(
    `<@${userID}> You are verified! Feel free to introduce yourself in <#${introduceChannelID}> !!`
  );
};
