import nodemailer from "nodemailer";

const sendEmail = async (mailOptions) => {
  let tranporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ozgurkrks0697@gmail.com",
      pass: "vabl zvcg hpjs zbih",
    },
    tls: { rejectUnauthorized: false },
  });
  let info = await tranporter.sendMail(mailOptions);
  console.log(`Message Sent: ${info.messageId}`);
};

export { sendEmail };
