const router = require('express').Router();
const upload = require('../../helpers/multer.helper')
const authenticationMiddleware = require('./../../middlewares/token.authentication');
const newsController = require("./methods/create-news");

router.route('/')
    .post(authenticationMiddleware.checkToken, upload.upload_image.single('myfile'), newsController.addNews);

module.exports = router;