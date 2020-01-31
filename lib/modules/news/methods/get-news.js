const config = require('../config');
const pagination = require('../../../helpers/utilities.helper');

exports.getNews = async (req, res, next) => {
    try {
        const pageNumberRequest = await pagination.paginationControl(req);
        const newsList = await db.collection("News").find({
            deleted: false
        }, {
                projection: {
                    _id: 001,
                    news_title: 1,
                    details: 1,
                    added_on: 1,
                }
            }).sort({ added_on: -1 }).skip((pageNumberRequest.pageNumber - 1) * pageNumberRequest.pageSizeLimit)
            .limit(pageNumberRequest.pageSizeLimit)
            .toArray()
        if (newsList.length > 0) {
            res.json(newsList);
        } else {
            res.status(409).json({
                status: config.message.conflict,
                msg: "please try again",
                errorMessage: err.toString()
            });
        }
    } catch (err) {
        res.status(400).json({
            status: config.message.error,
            msg: "please try again",
            errorMessage: err.toString()
        })
    }
}