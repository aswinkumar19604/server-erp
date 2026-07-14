import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log("MAIL FILE LOADED");
console.log("MAIL USER:", process.env.MAIL_USER);


const transporter = nodemailer.createTransport({

  service: "gmail",

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },

  tls: {
    rejectUnauthorized: false
  }

});


export default transporter;