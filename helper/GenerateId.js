var { customAlphabet } = require("nanoid");
var users = require("../Model/UserModel");

async function generateId() {
    
  const alphabet = "0123456789";
  const nanoid = customAlphabet(alphabet, 6);
  let randomFiveDigitNumber = nanoid();

  const user = await users.findOne({ user_id: randomFiveDigitNumber });

  if (user) {
    console.log(user);
    generateId();
  } else {
    return randomFiveDigitNumber;
  }
}

module.exports = { generateId };
