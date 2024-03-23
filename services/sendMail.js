const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendMail = async (userEmail) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: "Quota Exceeded",
    html: `<p>Hello from FolderX!</p>
    <p>Dear user, </br> We regret to inform you that your storage quota of <strong>50MB</strong> has been exceeded on FolderX. To continue using our services, please take action to free up space.</p>
    <p>Thank you for choosing FolderX!</p>
    <p>Best regards,<br>
    FolderX</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendMail };
