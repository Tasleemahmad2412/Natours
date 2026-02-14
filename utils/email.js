/* eslint-disable no-undef */
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  //  1. Create a trnaporter (transporter is a service that will actually send email)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2. Define the email options
  const mailOptions = {
    from: "<iqra@tasleem.io>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3. Actually send the email with the node mailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
