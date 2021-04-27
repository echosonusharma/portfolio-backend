const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const cors = require('cors');
require('dotenv').config();


const limiter = rateLimit({
    windowMs: 30 * 1000, // 30 sec
    max: 5, // limit each IP to 5 requests per windowMs
});

const speedLimiter = slowDown({
    windowMs: 30 * 1000,
    delayAfter: 3,
    delayMs: 1000, // begin adding 1000ms of delay per request above 3 api calls per windowMs
});

const app = express();
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(speedLimiter);



app.get('/', (req, res) => {
    res.json({
        msg: 'Congratulations you\'ve reached the end point 🥳'
    })
})

app.post('/send', slowDown, rateLimit, (req, res) => {
    console.log(req.body);
    const { name, email, subject, message } = req.body;
    const transporter = nodemailer.createTransport({
        host: "127.0.0.1",
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: email,
        to: process.env.EMAIL,
        subject: `Message from ${email}`,
        text: `name : ${name} \nsubject : ${subject} \n\nmessage : ${message} `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500)
            res.json({
                msg: 'server error'
            });

        } else {
            console.log('Email sent: ' + info.response);
            res.json({
                msg: 'message sent'
            });
        }

    })

});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server sprinting at PORT ${PORT}`)
})