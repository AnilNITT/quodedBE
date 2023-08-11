var bcrypt = require("bcryptjs");

exports.generatePassword = async (password) => {
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashPassword = await bcrypt.hashSync(password, salt);
  return hashPassword;
};

exports.comparePassword = (hashedPassword, password) => {
    return bcrypt.compareSync(password, hashedPassword);
};
