const express = require('express');
require('dotenv').config(`${__dirname}/.env`);
const session = require('express-session');
const config = require('./lib/configs/app.config');
const app = express(),
    expressValidator = require("express-validator"),
    cors = require('cors');
const passport = require('passport');
const parser = require("body-parser");

app.use(cors());

app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());

const dbConnector = require('./lib/helpers/db.helper'),
    routeHelper = require('./lib/routes/index'),
    logWriter = require('./lib/helpers/logwriter.helper'),
    redisConnector = require('./lib/helpers/redis.helper'),
    path = require('path'),
    errorController = require('./lib/modules/errorlogs/index');

dbConnector.init(app);
redisConnector.init(app);
app.use(session({
    secret: config.secretKey,
    resave: true
}));
app.use(passport.initialize());

app.use(express.static(path.join(__dirname, 'public')));
app.use(
    expressValidator({
        errorFormatter: function (param, msg, value) {
            var namespace = param.split("."),
                root = namespace.shift(),
                formParam = root;

            while (namespace.length) {
                formParam += "[" + namespace.shift() + "]";
            }
            return {
                param: formParam,
                msg: msg,
                value: value
            };
        }
    })
);

routeHelper.init(app);
logWriter.init(app);

app.get('/', (req, res, next) => {
    next();
}, function (req, res, next) {
    res.send("Hello from Admin Rashmina Shrestha.")
})

//Error middleware
app.use(function (err, req, res, next) {
    errorController.log_error(err, req, res, next);
})

module.exports = app;
