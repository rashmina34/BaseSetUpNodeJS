const jwt = require('jsonwebtoken');

exports.checkToken = async (req, res, next) => {
    const hToken = req.headers['token'];
    let collection = global.db.collection("User");

    try {
        const findToken = await collection.findOne({ jwtToken: hToken });
        if (!findToken) return res.json({
            code: 401,
            message: "Access Denied, No token provided"
        })

        try {
            let decoded = jwt.verify(findToken.jwtToken, process.env.privateKey);
            req.decodedUser = decoded;
            next();
        } catch (error) {
            if (error.name == "TokenExpiredError") {
                return res.json({
                    message: "Sorry, your token is expired, please generate a new token"
                })
            }
            next(error);
        }

    } catch (error) {
        next(error);
    }

}
