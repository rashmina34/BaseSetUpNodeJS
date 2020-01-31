const router = require('express').Router();
const upload = require('../../helpers/multer.helper')
const authenticationMiddleware = require('./../../middlewares/token.authentication');
const newsController = require("./methods/create-news");

router.route('/create')
    // .post(authenticationMiddleware.checkToken, upload.upload_image.single('file'), newsController.addNews);
    .post(authenticationMiddleware.checkToken, newsController.addNews);

const getNewsController = require('./methods/get-news');
router.route('/get')
    .get(authenticationMiddleware.checkToken, getNewsController.getNews);


module.exports = router;