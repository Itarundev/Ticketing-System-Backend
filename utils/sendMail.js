const nodemailer = require("nodemailer");

// create reusable transporter object using the default SMTP transport
const createEmailTransporter = (user, password) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    auth: {
      user: user,
      pass: password,
    },
  });
  return transporter;
};

function fillTemplate(template, vars) {
  for (const key in vars) {
    const regex = new RegExp(`#\\{${key}\\}`, "g");
    template = template.replace(regex, vars[key]);
  }
  return template;
}

const sendEmail = async (
  transporter,
  emailTo,
  subject,
  text,
  htmlTemplate,
  values,
  response,
  tenantName = "Ticketing System | GENEFIED",
) => {
  try {
    const options = {
      from: `${tenantName} <sender@gmail.com>`, // sender address
      to: emailTo,
      subject: subject,
      text: text,
      html: fillTemplate(htmlTemplate, values),
    };

    const info = await transporter.sendMail(options);
    console.log("Email sent successfully");
    console.log("MESSAGE ID: ", info.messageId);
    response(true, info);
  } catch (error) {
    console.log("Error at send email", error);
    response(false, error);
  }
};

module.exports = { createEmailTransporter, sendEmail };
