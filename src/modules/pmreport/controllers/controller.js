'use strict';
var mongoose = require('mongoose'),
    model = require('../models/model'),
    Pmreport = mongoose.model('Pmreport'),
    User = mongoose.model('User'),
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

exports.Users = function (req, res) {
    User.find(function (err, datas) {
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

exports.userById = function (req, res) {
    res.jsonp({
        status: 200,
        data: req.data
    });
};

exports.createUser = function (req, res) {
    var newUser = new User(req.body);
    // newPmreport.createby = req.user;
    newUser.save(function (err, data) {
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

exports.getByUserID = function (req, res, next, id) {

    User.findOne({ 'userid': id }, function (err, data) {
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

exports.getUserProfile = (req, res, next) => {
    if (req.body.events[0].message.type !== 'text') {
        res.sendStatus(400)
    }
    User.findOne({ 'userid': req.body.events[0].source.userId }, function (err, data) {
        if (err) {
            next();
        } else {
            req.userData = data;
            next();
        };
    });
    // next();
}

exports.updateNews = (req, res, next) => {
    if (!isNaN(parseFloat(req.body.events[0].message.text)) && isFinite(req.body.events[0].message.text) && parseFloat(req.body.events[0].message.text) <= 300) {
        if (req.userData) {
            var newPmreport = new Pmreport({
                name: req.userData.stationgroup,
                aqi: req.body.events[0].message.text,
                createby: {
                    _id: req.body.events[0].source.userId || '',
                    username: req.userData.name
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
        } else {
            replyNotAuthorize(req.body)
            res.sendStatus(400)
        }
    } else {
        next();
    }
}

exports.getPMData = (req, res, next) => {
    if (req.body.events[0].message.text === '?') {
        let d = new Date(Date.now() - 60 * 60 * 1000);
        Pmreport.find({
            created: {
                $gt: d
            },
        }, (err, data) => {
            if (err) {
                return res.status(400).send({
                    status: 400,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                req.data = data;
                next();
            };
        })
    } else {
        next();
    }
}

exports.cookTemplateData = (req, res, next) => {
    let lst = [];
    let min, max = 0;
    req.columns = [];
    if (req.data) {
        req.data.forEach(element => {
            if (lst.indexOf(element.name) === -1) {
                lst.push(element.name);
                min = element.aqi;
                max = element.aqi;
                req.columns.push({
                    title: element.aqi,
                    text: `${element.name} min:${min} | max:${max}`,
                    min: element.aqi,
                    max: element.aqi,
                    sum: element.aqi,
                    cnt: 1,
                    actions: [
                        {
                            type: "uri",
                            label: "View detail",
                            uri: "http://example.com/page/111"
                        }
                    ]
                });
            } else {
                req.columns[lst.indexOf(element.name)].sum += element.aqi;
                req.columns[lst.indexOf(element.name)].cnt += 1;
                if (req.columns[lst.indexOf(element.name)].min > element.aqi) {
                    req.columns[lst.indexOf(element.name)].min = element.aqi;
                }
                if (req.columns[lst.indexOf(element.name)].max < req.columns[lst.indexOf(element.name)].aqi) {
                    req.columns[lst.indexOf(element.name)].max = element.aqi;
                }
                req.columns[lst.indexOf(element.name)].text =  `${element.name} min:${req.columns[lst.indexOf(element.name)].min} | max:${req.columns[lst.indexOf(element.name)].max}`;
                req.columns[lst.indexOf(element.name)].title = req.columns[lst.indexOf(element.name)].sum / req.columns[lst.indexOf(element.name)].cnt;
            }

        });
        next();
    } else {
        next();
    }

}

exports.getReport = (req, res, next) => {
    if (req.body.events[0].message.text === '?') {
        replySummaryReport(req.body, req.columns);
        res.jsonp({
            status: 200,
            data: req.data
        });
    } else {
        next();
    }
}

exports.replyException = (req, res, next) => {
    replyException(req.body);
    res.jsonp({
        status: 200,
        data: { message: 'กรุณากรอกข้อมูลเป็นตัวเลข 0-300 (ค่า AQI)' }
    });
}

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
            data: { message: 'template' }
        });
    } else {
        replyException(req.body);
        res.jsonp({
            status: 200,
            data: { message: 'กรุณากรอกข้อมูลเป็นตัวเลข 0-300 (ค่า AQI)' }
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
                text: `กรุณากรอกข้อมูลเป็นตัวเลข 0-300 (ค่า PM2.5)`
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

const replySummaryReport = (bodyResponse, columns) => {
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer T9lDXjk9Hn7JIcIafSWNSasnnOcTWpZZziyQHO+91xhsw/6r3BQZkf9WYw6wpnAAG6n+spDjNXWoQKDZsUw+5ZIiZrXtrHhvPXs72nnIxdLFZ1RbC6/zQAXWQr7G2iHKYwVj6I4QzfaUmxe6AhffZwdB04t89/1O/w1cDnyilFU='
    }
    let body = JSON.stringify({
        replyToken: bodyResponse.events[0].replyToken,
        messages: [
            {
                type: "template",
                altText: "this is a carousel template",
                template: {
                    type: "carousel",
                    columns: columns
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

const replyNotAuthorize = (bodyResponse) => {
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer T9lDXjk9Hn7JIcIafSWNSasnnOcTWpZZziyQHO+91xhsw/6r3BQZkf9WYw6wpnAAG6n+spDjNXWoQKDZsUw+5ZIiZrXtrHhvPXs72nnIxdLFZ1RbC6/zQAXWQr7G2iHKYwVj6I4QzfaUmxe6AhffZwdB04t89/1O/w1cDnyilFU='
    }
    let body = JSON.stringify({
        replyToken: bodyResponse.events[0].replyToken,
        messages: [{
            type: `text`,
            text: `ท่านยังไม่ได้ลงทะเบียนกับผู้ดูแลระบบ โดยอ้างอิงเลขที่ : ${bodyResponse.events[0].source.userId}`
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
