import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "http://taskmanager.com",
    },
  });
  const emailText = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHTML = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_TRAP_HOST,
    port: process.env.MAIL_TRAP_PORT,
    auth: {
      user: process.env.MAIL_TRAP_USERNAME,
      pass: process.env.MAIL_TRAP_PASS,
    },
  });


  await transporter.sendMail({
    from: "harshdixit3006@gmail.com",
    to: options.to,
    subject: options.subject,
    text: emailText,
    html: emailHTML,
  });
};

const EmailVerificationMailGen = (userName, verificationUrl) => {
  return {
    body: {
      name: userName,
      intro: "Welcome to  Our app we are excited to have you onboard",
      action: {
        instruction: "To Verify your mail click on the given Button",
        button: {
          color: "#32CD32",
          text: "Verify your E-mail",
          link: verificationUrl,
        },
      },
      outro: "Need Help or any querry just reply this mail",
    },
  };
};

const forgotPassContent = (userName, forgotUrl) => {
  return {
    body: {
      name: userName,
      intro: "We have got a request to reset your password",
      action: {
        instruction: " to reset the pass click on the given button",
        button: {
          color: "#32CD32",
          text: "Click to reset the pass",
          link: forgotUrl,
        },
      },
      outro: "Need Help or any query just reply this mail",
    },
  };
};

export { EmailVerificationMailGen, forgotPassContent, sendEmail };
