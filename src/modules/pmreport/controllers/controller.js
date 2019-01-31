'use strict';
var mongoose = require('mongoose'),
    model = require('../models/model'),
    Pmreport = mongoose.model('Pmreport'),
    errorHandler = require('../../core/controllers/errors.server.controller'),
    _ = require('lodash'),
    request = require('request');

exports.getList = function (req, res) {
    Pmreport.find(function (err, datas) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: datas
            });
        };
    });
};

exports.create = function (req, res) {
    var newPmreport = new Pmreport(req.body);
    // newPmreport.createby = req.user;
    newPmreport.save(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
        };
    });
};

exports.getByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            status: 400,
            message: 'Id is invalid'
        });
    }

    Pmreport.findById(id, function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            req.data = data ? data : {};
            next();
        };
    });
};

exports.read = function (req, res) {
    res.jsonp({
        status: 200,
        data: req.data ? req.data : []
    });
};

exports.update = function (req, res) {
    var updPmreport = _.extend(req.data, req.body);
    updPmreport.updated = new Date();
    updPmreport.updateby = req.user;
    updPmreport.save(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
        };
    });
};

exports.delete = function (req, res) {
    req.data.remove(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
        };
    });
};

exports.hook = (req, res) => {
    if (req.body.events[0].message.type !== 'text') {
        res.sendStatus(400)
    }
    if (!isNaN(parseFloat(req.body.events[0].message.text)) && isFinite(req.body.events[0].message.text)) {

        var newPmreport = new Pmreport({
            name: 'station name',
            aqi: req.body.events[0].message.text,
            createby: {
                _id: req.body.events[0].source.userId || '',
                username: 'jigkoh',
                displayname: 'theera'
            }
        });
        newPmreport.save(function (err, data) {
            if (err) {
                return res.status(400).send({
                    status: 400,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                reply(req.body);
                res.jsonp({
                    status: 200,
                    data: data
                });
            };
        });
    } else if (req.body.events[0].message.text === '?') {
        replySummaryReport(req.body);
        res.jsonp({
            status: 200,
            data: {message: 'template'}
        });
    } else {
        replyException(req.body);
        res.jsonp({
            status: 200,
            data: {message: 'กรุณากรอกข้อมูลเป็นตัวเลข 0-300 (ค่า AQI)'}
        });
    }

}

const reply = (bodyResponse) => {
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer T9lDXjk9Hn7JIcIafSWNSasnnOcTWpZZziyQHO+91xhsw/6r3BQZkf9WYw6wpnAAG6n+spDjNXWoQKDZsUw+5ZIiZrXtrHhvPXs72nnIxdLFZ1RbC6/zQAXWQr7G2iHKYwVj6I4QzfaUmxe6AhffZwdB04t89/1O/w1cDnyilFU='
    }
    let body = JSON.stringify({
        replyToken: bodyResponse.events[0].replyToken,
        messages: [{
            type: `text`,
            text: `ขอบคุณครับสำหรับข้อมูล : ${bodyResponse.events[0].message.text}`
        }]
    })
    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode);
    });
}

const replyException = (bodyResponse) => {
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer T9lDXjk9Hn7JIcIafSWNSasnnOcTWpZZziyQHO+91xhsw/6r3BQZkf9WYw6wpnAAG6n+spDjNXWoQKDZsUw+5ZIiZrXtrHhvPXs72nnIxdLFZ1RbC6/zQAXWQr7G2iHKYwVj6I4QzfaUmxe6AhffZwdB04t89/1O/w1cDnyilFU='
    }
    let body = JSON.stringify({
        replyToken: bodyResponse.events[0].replyToken,
        messages: [
            {
                type: `text`,
                text: `กรุณากรอกข้อมูลเป็นตัวเลข 0-300 (ค่า AQI)`
            }
        ]
    })
    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode);
    });
}

const replySummaryReport = (bodyResponse) => {
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer T9lDXjk9Hn7JIcIafSWNSasnnOcTWpZZziyQHO+91xhsw/6r3BQZkf9WYw6wpnAAG6n+spDjNXWoQKDZsUw+5ZIiZrXtrHhvPXs72nnIxdLFZ1RbC6/zQAXWQr7G2iHKYwVj6I4QzfaUmxe6AhffZwdB04t89/1O/w1cDnyilFU='
    }
    let body = JSON.stringify({
        replyToken: bodyResponse.events[0].replyToken,
        messages: [
            {
                "type": "template",
                "altText": "this is a carousel template",
                "template": {
                    "type": "carousel",
                    "columns": [
                        {
                            "title": "44",
                            "text": "บ้านฟ้า min: 43 | max: 45",
                            "actions": [
                                {
                                    "type": "uri",
                                    "label": "View detail",
                                    "uri": "http://example.com/page/111"
                                }
                            ]
                        },
                        {
                            "title": "40",
                            "text": " วราบดินทร์ min: 39 | max: 41",
                            "actions": [
                                {
                                    "type": "uri",
                                    "label": "View detail",
                                    "uri": "http://example.com/page/111"
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    })
    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode);
    });
}
