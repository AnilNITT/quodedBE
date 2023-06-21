// const crypto = require("crypto");
var config = require("./config");
var CryptoJS = require("crypto-js");

exports.encryption = (text) => {

  const keys = config.crypto_key;
  var ciphertext = CryptoJS.AES.encrypt(text, keys).toString();
  // const data = ciphertext.ciphertext.toString(CryptoJS.enc.Base64);
  return ciphertext;

  // console.log(cryptocrypto.createCipheriv(algorithm, key, iv));
  // var cipher = crypto.createCipheriv(algorithm, key, iv);
  // let encrypted = cipher.update(text, "utf8", "base64");
  // encrypted += cipher.final("base64");
  // return encrypted;

  // const a =0;
  // var cipher = crypto.createCipher(algorithm, key, iv);
  // var crypted = cipher.update(text, "utf8", "base64") + cipher.final("base64");
  // return crypted;
};


exports.decryption = (text) => {

    const keys = config.crypto_key;
    
    var ciphertext = CryptoJS.AES.decrypt(text, keys).toString(CryptoJS.enc.Utf8);
    // const data = ciphertext.ciphertext.toString(CryptoJS.enc.Base64);
    return ciphertext;
  
    // console.log(cryptocrypto.createCipheriv(algorithm, key, iv));
    // var cipher = crypto.createCipheriv(algorithm, key, iv);
    // let encrypted = cipher.update(text, "utf8", "base64");
    // encrypted += cipher.final("base64");
    // return encrypted;
  
    // const a =0;
    // var cipher = crypto.createCipher(algorithm, key, iv);
    // var crypted = cipher.update(text, "utf8", "base64") + cipher.final("base64");
    // return crypted;
};
