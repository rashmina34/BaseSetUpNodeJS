const nodemailer = require('nodemailer');
const ses = require('nodemailer-ses-transport');
require('dotenv').config();

exports.sendEmail = async (obj, req) => {

    //setting up email data
    let mailOptions = {
        from: 'someone@somemail.com',
        to: obj.mail,
        subject: 'User confirmation',
        html: `<p>Click this link to verify your email</p>
        <br/>
        <a href=${obj.lnk}>
        ${obj.lnk}</a>
        `
    };

    let newsSubscriptionMail = {
        from: 'someone@somemail.com',
        to: obj.mail,
        subject: 'News Subscription',

        html: `<p>Thank you for subscribing for our news letter.Click this link to unscubscribe: <a href="http://localhost:8000/api/user/unsubscribe/${obj.id}">unsubscribe</a></p>`
    };
    if (req.route.path === "/") {
        sendmail(mailOptions);
    }


    if (obj.sbscr === true || obj.sbscr === "true") {
        sendmail(newsSubscriptionMail);
    }
    return;
};

const sendmail = (option) => {

    nodemailer.createTestAccount((err, account) => {
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: account.user,
                pass: account.pass
            }
        });

        transporter.sendMail(option, (error, info) => {
            if (error) {
                console.log("i am here");
                return console.log(error);
            }
            console.log('Message sent : %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        })
    });
}

exports.sendEmailSES = async (obj) => {

    let options = {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET,
        region: process.env.REGION
    };

    let transporter = nodemailer.createTransport(ses(options));

    let mailOptions = {
        from: 'nodebeats@gmail.com',
        to: obj.mail,
        subject: 'User confirmation',
        html: `<p>Click this link to verify your email</p>
        <br/>
        <a href=${obj.lnk}>
        ${obj.lnk}</a>
        `
    };
    transporter.sendMail(mailOptions)
        .then((data) => {
            console.log(data);
        })
        .catch((err) => {
            return console.log(err);
        });
}

