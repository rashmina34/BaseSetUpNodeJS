const jwt = require('jsonwebtoken');

exports.generateToken = (userId) => {
  let token = jwt.sign({ userId }, process.env.privateKey, {
    expiresIn: '10 days',
    issuer: userId.toString()
  });
  return token;

}


