import nodemailer from "nodemailer";

const productionSender = Promise.resolve((message) => {
  nodemailer
    .createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      auth: {
        user: process.env.SMTP_AUTH_USER,
        pass: process.env.SMTP_AUTH_PASS
      }
    })
    .sendMail(message);
});

const testSender = Promise.resolve((message) => {
  nodemailer
    .createTransport({ streamTransport: true, buffer: true })
    .sendMail(message);
});

const developmentSender = new Promise((resolve, reject) => {
  nodemailer.createTestAccount((err, account) => {
    if(err) reject(err);

    const transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });

    const sendEmail = (message) => {
      transporter.sendMail(message, (err, info) => {
        if(err) { console.log(`mailer failed ${err.message}`); }
        else { 
          console.log("Message sent: %s", info.messageId);
          console.log("Message Preview URL: %s", nodemailer.getTestMessageUrl(info)); 
        }
      });
    }

    resolve(sendEmail);
  });
});

let sender;
switch(process.env.NODE_ENV) {
  case "development":
    sender = developmentSender;
    break;
  case "test":
    sender = testSender;
    break;
  default:
    sender = productionSender;
}

export default sender;