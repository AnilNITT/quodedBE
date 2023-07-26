const nodemailer = require("nodemailer");

async function sendEmail({ email, otp, name, text }) {
  // let testAccount = await nodemailer.createTestAccount();

  // connect with the smtp
  try {
    let transporter = nodemailer.createTransport({
      /* host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "maegan.jast87@ethereal.email",
        pass: "agfA7cHajK8sF1VUKk",
      }, */

      // zoho mail
      host: "smtp.zoho.com",
      port: 465,
      secure: true, // use SSL
      auth: {
        user: "patidaranil0791@gmail.com",
        pass: "rXVhAPK1fV6H",
      },
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
    });
    if (text) {
      try {
        const info = await transporter.sendMail({
          from: '"Quoded App" <patidaranil0791@gmail.com>', // sender address
          to: email, // list of receivers
          subject: "you have new message", // Subject line
          text: "Hello ur otp is", // plain text body
          html: `<h2> You have new message</h1>
        <br/>
        <h3>"${name}" send you a Message</h3>
        <h3>message :<span style ="background: #bfbfbf;
        color: black;
        padding: 0.5rem;
        border-radius: 0.5rem;
        font-size: 20px;">
        ${text}
        </span></h3>
    
        'Thanks,Quoded Team...'`, // html body
        });
        return { status: true, msgID: info.messageId };
      } catch (err) {
        return { status: false, error: err };
      }
    } else {
      try {
        let info = await transporter.sendMail({
          from: '"Quoded App" <patidaranil0791@gmail.com>', // sender address
          to: email, // list of receivers
          subject: "Quoded App", // Subject line
          text: "Hello ur otp is", // plain text body
          html: `<h2> Hello User</h1>
      <br/>
      <h3>Your OTP to verifying your Email Authentication</h3>
      <h3>OTP : 
      <span style ="background: yellow;
      color: black;
      padding: 0.5rem;
      border-radius: 0.5rem;
      font-size: 25px;">
      ${otp}
      </span>
      </h3>
      <h4>This OTP is valid only within two minutes.</h4>
  
      'Thanks,Quoded Team...'`, // html body
        });

        return { status: true, msgID: info.messageId };
      } catch (err) {
        return { status: false, error: err };
      }
    }
  } catch (err) {
    return { status: false, error: err };
  }
}

module.exports = sendEmail;
