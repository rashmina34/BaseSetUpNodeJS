const express = require('express');
const moduleConfig = require('../config');
const newsModel = require('../model');
const ObjectID = require('mongodb').ObjectID;
const pagination = require('../../../helpers/utilities.helper');
const path = require('path');

let multer = require('multer');
let upload = multer({ dest: 'uploads/' });

let validationCheck = async (req) => {

    req.checkBody('title', moduleConfig.message.validationErrMessage.title).notEmpty();
    req.checkBody('details', moduleConfig.message.validationErrMessage.title).notEmpty();
    const result = await req.getValidationResult();
    return result.array();
};

exports.addNews = async (req, res, next) => {
    try {
        let validation = await validationCheck(req);
        if (!validation.length > 0) {
            const findNews = await db.collection("News").findOne({
                title: req.body.title
            });
            if (findNews) {
                res.status(409).json({
                    status: moduleConfig.message.conflict
                });
            } else {
                let news = {
                    title: req.body.title,
                    details: req.body.details,
                    filePath: req.file.path,
                    added_on: new Date(),
                    deleted: false
                }
                const createNews = await db.collection("News").insertOne(news);
                res.send(config.message.save);
            }
        } else {
            res.status(400).json({
                status_code: "400",
                status: "Bad Request",
                err: pagination.errorMessageControl(validation)
            });
        }
    } catch (err) {
        res.status(409).json({
            msg: "Something went wrong",
            errMsg: err.toString()
        });
    };
};