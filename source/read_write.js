const fs = require("fs");

//MODES:
//0 for read
//1 for write
//2 for find
module.exports = async (filename, mode, data = "") => {
  //for reading data
  if (mode === 0) {
    try {
      const data = fs.readFileSync(`${filename}`, "utf8");
      return await JSON.parse(data);
    } catch (err) {
      // Handle error (file doesn't exist or is invalid JSON)
      console.error("Error reading data:", err);
      return null;
    }
    //For writing data
  } else if (mode === 1) {
    try {
      fs.writeFileSync(`${filename}`, JSON.stringify(data, null, 1), "utf8");
    } catch (err) {
      // Handle error (file couldn't be written)
      console.error("Error writing data:", err);
    }
  }
};
