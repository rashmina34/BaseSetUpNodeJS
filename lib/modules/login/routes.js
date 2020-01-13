
var express = require("express");
var router = express.Router();

var loginController = require("./index");
var passport = require('passport');
require('../../auth/passport');


router.post("/", passport.authenticate('local', { session: false }), loginController.login_user);
module.exports = router;