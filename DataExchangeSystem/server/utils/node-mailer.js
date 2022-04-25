const nodemailer = require('nodemailer');
require("dotenv").config();
   /*  
       Purpose = to send an email using nodemailer
       Input = email id, subject of email and html to send
       Output = email with given subject and body(html to send) will be sent to given given id
   */
const sendMail = async (email, subject, htmlToSend) => {
    try {
        var transporter = nodemailer.createTransport({
            service: process.env.serviceUsed,
            auth: {
                user: process.env.hostEMail,
                pass: process.env.hostPassword
            }
        })
        var mailOptions = {
            from: process.env.hostEMail,
            to: email,
            subject: subject,
            html: htmlToSend
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (err) {
        console.log(err);
        throw err;
    }
};
module.exports = sendMail
