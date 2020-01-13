var mongoCLient = require('mongodb').MongoClient;
const tokenGenerator = require('../../helpers/jwt.helper');
const redisHelper = require('../../helpers/redis.helper');
const MAX_LOGIN_ATTEMPTS = 5;
const ObjectID = require('mongodb').ObjectID;
const verifyOTP = require('../two-factor-auth/index');
const util = require('../../commons/util');

mongoCLient.Promise = Promise;

exports.login_user = async (req, res, next) => {
    if (!req.session.secretKey) {
        let collection = global.db.collection("User");
        let emailChk = await collection.findOne({ 'email': req.body.email });

        //Generate JSON token along with Secret key(privatekey)
        const token = tokenGenerator.generateToken(emailChk._id.toString());
        console.log("Token =" + typeof token + token);

        //Save token to DB
        collection.updateOne({ _id: ObjectID(emailChk._id) }, { $set: { jwtToken: token.toString() } });

        // //Storing it in the redis server
        let userObj = {
            first_name: emailChk.first_name,
            last_name: emailChk.last_name,
            email: emailChk.email,
            salutation: emailChk.salutation,
            user_role: emailChk.user_role
        }
        redisHelper.saveToRedis(token, userObj);
        let value = await redisHelper.fetchData(token);
        res.json(util.renderApiData(req, res, 200, 'Token generated', { token: token, userId: emailChk._id, data: JSON.parse(value) }));

    } else {
        // verifyOTP.verifySecretKey(req, res, next);
        res.json(util.renderApiData(req, res, 200, 'Token generated', { token: token, userId: emailChk._id, data: JSON.parse(value) }));
    }

}





