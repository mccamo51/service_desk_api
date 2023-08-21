// emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail', // e.g., 'Gmail'
  auth: {
    user: 'Alonegod909@gmail.com',
    pass: '0541544405',
  },
});

async function sendVerificationEmail(to, verificationToken) {
  const mailOptions = {
    from: 'Alonegod909@gmail.com',
    to,
    subject: 'Verify Your Email',
    html: `
      <p>Click the following link to verify your email:</p>
      <a href="http://your-app-url/verify/${verificationToken}">Verify Email</a>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };
