const BCRYPT_SALT_ROUNDS = 10;
const bcrypttHelper = require('../../helpers/bcrypt.helper');
const mongoCLient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const configMessage = require("./config");
const paginate = require('./../../helpers/utilities.helper');
const errMsg = require('./../../helpers/utilities.helper');
const redisHelper = require('../../helpers/redis.helper');
const sendMsg = require('./../../helpers/mail.helper');
const util = require('./../../commons/util');
const cloudinary = require('cloudinary');
const multerHelper = require('../../helpers/multer.helper');
const dataModel = require('./model');

mongoCLient.Promise = Promise;

//Validation
const checkValidation = async (req) => {
    req.checkBody('first_name', configMessage.messageConfig.user.validationErrMessage.first_name).notEmpty();
    req.checkBody('first_name', configMessage.messageConfig.user.validationErrMessage.first_name_alpha).isAlpha();
    req.checkBody('last_name', configMessage.messageConfig.user.validationErrMessage.last_name).notEmpty();
    req.checkBody('last_name', configMessage.messageConfig.user.validationErrMessage.last_name_alpha).isAlpha()
    req.checkBody('email', configMessage.messageConfig.user.validationErrMessage.email).notEmpty();
    req.checkBody('email', configMessage.messageConfig.emailErr.validationErr.email).isEmail();
    req.checkBody('user_role', configMessage.messageConfig.user.validationErrMessage.user_role).notEmpty();
    req.checkBody('user_role', configMessage.messageConfig.user.validationErrMessage.user_role_field).optional().isIn(['superuser', 'enduser', 'superadmin', 'normaluser', 'reader', 'writer', 'manager']);
    req.checkBody('password', configMessage.messageConfig.user.validationErrMessage.password).notEmpty();
    req.checkBody('password', configMessage.messageConfig.user.validationErrMessage.passwordCharacter).matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,30})");
    req.checkBody('agree_terms_condition').notEmpty().isBoolean();

    const result = await req.getValidationResult();
    return result.array();
};

const saveUser = exports.saveUser = async (body) => {
    const collection = await global.db.collection("User");

    const salt = await bcrypttHelper.generateSalt(BCRYPT_SALT_ROUNDS);//generating salt
    const bPassword = await bcrypttHelper.hashPwd(body.password, salt);//hashing the password

    return collection.insertOne({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        password: bPassword,
        user_role: body.user_role,
        agree_terms_condition: body.agree_terms_condition,
        added_on: body.added_on,
        deleted: body.deleted,
        isVerified: body.isVerified,
        subscribe: body.subscribe,
    });
}


const sendingProperties = async (receivedHost, receivedEmail, receivedReq, receivedRes) => {
    try {
        if (receivedReq.route.path === "/subscribe/anonymous") {
            let k = await global.db.collection("AnonymousUser").findOne({ email: receivedEmail }, { projection: { _id: 1 } });
            console.log(k._id);
            sendMsg.sendEmail({ sbscr: receivedHost, mail: receivedEmail, id: k._id }, receivedReq)
                .then(() => {
                    receivedRes.status(200).json({
                        status_code: 200,
                        status: "OK",
                        message: "Subscribed Succesfully"
                    })
                })
                .catch((err) => {
                    receivedRes.status(400).json({
                        status_code: 400,
                        status: "Bad Request",
                        message: error
                    })
                });
        } else {
            const rand = Math.floor((Math.random() * 100) + 54);//random integer
            const token = toString(rand);
            const salt = await bcrypttHelper.generateSalt(BCRYPT_SALT_ROUNDS);
            const emailToken = await bcrypttHelper.hashPwd(token, salt);//hashing that random number

            const link = `http://${receivedHost}/verify/email?id=${emailToken}&${receivedEmail}`;

            const collection = global.db.collection("User");

            let a = await collection.findOne({ email: receivedEmail });
            var stringA = 'email-verification_' + a._id + "_" + receivedEmail;
            redisHelper.saveToRedis(emailToken, stringA);
            redisHelper.expireKey(emailToken, 608400);//expire token after 7 days

            sendMsg.sendEmail({ mail: receivedEmail, lnk: link, sbscr: a.subscribe }, receivedReq);
            //sendMsg.sendEmailSES({mail:email,lnk:link});

            return;
        }
    } catch (err) {
        console.log(err);
    }

};

//creating new user
exports.create_user = async (req, res) => {
    try {
        let validation = await checkValidation(req);

        if (!validation.length > 0) {
            const collection = db.collection("User");

            const first_name = req.body.first_name;
            const last_name = req.body.last_name;
            const email = req.body.email;

            const salutation = req.body.salutation;
            const user_role = req.body.user_role;
            let agree_terms_condition = req.body.agree_terms_condition;

            const password = req.body.password;
            const subscribe = false;
            const added_on = new Date();
            const isVerified = false;
            const deleted = false;

            const checkEmail = await collection.findOne({ email: email });
            if (checkEmail) {
                res.status(409).json({
                    status_code: "409",
                    status: "Conflict",
                    message: configMessage.messageConfig.emailErr.conflictMessage
                });
                //console.log(checkValidation(req));
            } else {
                agree_terms_condition = (agree_terms_condition === 'true' || agree_terms_condition === true) ? true : false;
                if (agree_terms_condition === true) {
                    try {
                        let k = await saveUser({ first_name, last_name, email, password, salutation, user_role, agree_terms_condition, deleted, added_on, isVerified, subscribe });
                        const host = req.get('host');
                        console.log("user create =>", k.result.n);

                        sendingProperties(host, email, req, res);

                        res.status(200).json({
                            status_code: "200",
                            status: "Ok",
                            message: configMessage.messageConfig.user.userCreateSuccess
                        });
                    } catch (err) {
                        console.log(err);
                        res.status(500).send({
                            status: "Internal server error",
                            msg: err.message
                        });
                    }
                } else {
                    res.status(400).json({
                        status_code: "400",
                        status: "Bad request",
                        message: configMessage.messageConfig.validationErrMessage.agree_terms_condition
                    });
                }
            }
        } else {
            console.log("Error Here");

            const fn = multerHelper.file_name;
            console.log("file_name => ", fn);
            cloudinary.v2.uploader.destroy(fn, { invalidate: true }, function (error, result) { console.log(result, error) });
            res.status(400).json({
                status_code: "400",
                status: "Bad request",
                err: errMsg.errorMessageControl(validation)
            });
        }
    } catch (err) {
        res.status(400).json({
            status_code: "400",
            status: "Bad Request",
            err: err.toString()
        });
    }
};

exports.listOfUser = async (req, res) => {
    try {
        var request = await paginate.paginationControl(req);

        let paginationList = await db
            .collection("User")
            .find(
                { deleted: false },
                { projection: { _id: 1, first_name: 1, last_name: 1, email: 1 } }
            )
            .skip((request.pageNumber - 1) * request.pageSizeLimit)
            .limit(request.pageSizeLimit)
            .toArray();

        if (paginationList.length > 0) {
            res.status(200).json({
                status_code: "200",
                status: "Ok",
                msg: paginationList
            });

        } else {
            res.status(200).json({
                status_code: "200",
                status: "Ok",
                message: configMessage.messageConfig.user.getUserEmptyMessage
            });
        }
    } catch (err) {
        res.status(400).json({
            status_code: "400",
            status: "Bad Request",
            msg: err
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        let id = ObjectID(req.params.id);

        let getInfo = await db.collection("User").findOne(
            { _id: id, deleted: false },
            {
                projection: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    email: 1,
                    salutation: 1,
                    user_role: 1
                }
            }
        );
        console.log(getInfo);
        if (getInfo) {
            res.status(200).json({
                status_code: "200",
                status: "Ok",
                message: getInfo
            });
        } else {
            res.status(404).json({
                status_code: "404",
                status: "Not Found",
                message: configMessage.messageConfig.validationErrMessage.not_found
            });
        }
    } catch (err) {
        res.status(400).json({
            status_code: "400",
            status: "Bad Request",
            message: err
        });
    }
};

exports.deleteUser = (req, res) => {
    try {
        let id = req.params.id;
        var user = {
            deleted: true
        };

        db.collection("User").update(
            {
                _id: ObjectID(id)
            },
            {
                $set: user
            },
            (err, result) => {
                if (err) {
                    throw err;
                }
                res.status(200).json({
                    status_code: "200",
                    status: "Ok",
                    message: configMessage.messageConfig.user.userDeleteMsg
                });
            }
        );
    } catch (err) {
        res.status(400).json({
            status_code: "400",
            status: "Bad Request",
            message: err
        })
    }
};

exports.updateUser = async (req, res) => {
    try {
        let validation = await checkValidation(req);
        if (!validation.length > 0) {
            let id = req.params.id;
            var user = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                salutation: req.body.salutation,
                user_role: req.body.user_role,
                password: req.body.password
            };

            let k = await db.collection("User").updateOne({
                _id: ObjectID(id)
            }, {
                    $set: user
                }, (err, result) => {
                    if (err) {
                        res.json(err);
                    }
                    if (result.result.nModified === 1) {
                        res.status(200).json({
                            status_code: "200",
                            status: "Ok",
                            message: configMessage.messageConfig.user.userUpdateMsg
                        });
                    } else {
                        res.status(200).json({
                            status_code: "200",
                            status: "OK",
                            message: "No changes made"
                        })
                    }

                });
        } else {
            res.status(400).json({
                status_code: "400",
                status: "Bad request",
                error: errMsg.errorMessageControl(validation)
            });
        }
    } catch (err) {
        res.status(400).json({
            status_code: "400",
            status: "Bad Request",
            message: err
        });
    }
};

exports.verifyEmail = async (req, res, next) => {

    try {
        let id = req.query.id;
        let tokenVerify = await redisHelper.fetchData(id);
        if (tokenVerify === null) {
            res.json(util.renderApiData(req, res, 401, configMessage.messageConfig.user.tokenNotFound));
        }
        let b = tokenVerify.split('_');

        const findEmail = await db.collection('User').findOne(
            {
                _id: ObjectID(b[1]),
                email: b[2]
            },

            {
                projection: {
                    _id: 1,
                    email: 1,
                    isVerified: 1
                }
            })

        const updateRes = await db.collection('User').updateOne({
            _id: ObjectID(b[1])
        }, {
                $set:
                    { isVerified: true }

            });
        if (updateRes.result.n > 0) {
            redisHelper.delkey(id);
            res.json(util.renderApiData(req, res, 200, configMessage.messageConfig.user.userVerifiedMsg));

        } else {
            res.json(util.renderApiData(req, res, 304, configMessage.messageConfig.user.userNotVerified));
        }


    } catch (error) {
        next(error);
    }
}

exports.resendToken = async (req, res) => {

    try {
        let user = await db.collection("User").findOne({ _id: id });
        if (user && user.user_role === "superuser") {
            let unverified_user = await db.collection("User").find({ isVerified: false }, { projection: { email: 1 } }).toArray();
            unverified_user.forEach(element => {

                const host = req.get('host');

                sendingProperties(host, user, element.email);

                res.status(200).json({
                    status: "Resending token",
                    message: "Token successfully sent"
                });

            });
        } else if (user && user.user_role != "superuser") {

            let unverified_user = await db.collection("User").findOne({ isVerified: false }, { projection: { email: 1 } });

            const host = req.get('host');

            sendingProperties(host, unverified_user, unverified_user.email);
            res.status(200).json({
                status: "Resending token",
                message: "Token successfully sent"
            });
        } else {

            res.status(400).json({ status: "Bad Request", msg: "Unverified user" });

        }

    } catch (err) {
        res.status(400).json({ status: "Bad Request", msg: err });
    }

}


exports.anonymousUser = async (req, res) => {
    try {
        console.log("I am here");
        let email = await req.body.email;
        let k = await global.db.collection("AnonymousUser").insertOne({ email: email, subscribe: true });
        //console.log("inserted",k);
        let ka = await global.db.collection("AnonymousUser").findOne({ email: email });
        //console.log(ka);
        sendingProperties(ka.subscribe, email, req, res);
    } catch (err) {
        res.status(400).json(err);
    }
};



exports.unsubscribe = async (req, res) => {
    let id = ObjectID(req.params.id);
    var anonUser = {
        subscribe: false
    };



    global.db.collection("AnonymousUser").update(
        {
            _id: id
        },
        {
            $set: anonUser
        }, (err, result) => {
            if (err) {
                console.log(err);
                throw err;
            }

            res.status(200).json({
                status_code: "200",
                status: "Ok",
                message: result
            });
        }
    );
}
