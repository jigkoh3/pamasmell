"use strict";
var mongoose = require("mongoose"),
  model = require("../models/model"),
  Pmreport = mongoose.model("Pmreport"),
  User = mongoose.model("User"),
  errorHandler = require("../../core/controllers/errors.server.controller"),
  _ = require("lodash"),
  request = require("request");
var timeAgo = require("node-time-ago");
var moment = require("moment");
exports.getList = function(req, res) {
  Pmreport.find(function(err, datas) {
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
    }
  });
};

exports.Users = function(req, res) {
  User.find(function(err, datas) {
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
    }
  });
};

exports.create = function(req, res) {
  var newPmreport = new Pmreport(req.body);
  // newPmreport.createby = req.user;
  newPmreport.save(function(err, data) {
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
    }
  });
};

exports.getByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      status: 400,
      message: "Id is invalid"
    });
  }

  Pmreport.findById(id, function(err, data) {
    if (err) {
      return res.status(400).send({
        status: 400,
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.data = data ? data : {};
      next();
    }
  });
};

exports.userById = function(req, res) {
  res.jsonp({
    status: 200,
    data: req.data
  });
};

exports.createUser = function(req, res) {
  var newUser = new User(req.body);
  // newPmreport.createby = req.user;
  newUser.save(function(err, data) {
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
    }
  });
};

exports.getByUserID = function(req, res, next, id) {
  User.findOne({ userid: id }, function(err, data) {
    if (err) {
      return res.status(400).send({
        status: 400,
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.data = data ? data : {};
      next();
    }
  });
};

exports.read = function(req, res) {
  res.jsonp({
    status: 200,
    data: req.data ? req.data : []
  });
};

exports.update = function(req, res) {
  var updPmreport = _.extend(req.data, req.body);
  updPmreport.updated = new Date();
  updPmreport.updateby = req.user;
  updPmreport.save(function(err, data) {
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
    }
  });
};

exports.delete = function(req, res) {
  req.data.remove(function(err, data) {
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
    }
  });
};

exports.getUserProfile = (req, res, next) => {
  if (req.body.events[0].message.type !== "text") {
    if (req.body.events[0].message.type === "location") {
      var newUser = new User({
        name: req.body.events[0].source.userId,
        userid: req.body.events[0].source.userId,
        lat: req.body.events[0].message.latitude,
        lng: req.body.events[0].message.longitude,
        stationgroup: req.body.events[0].message.title,
        devicename: "MI xx"
      });
      // newPmreport.createby = req.user;
      newUser.save(function(err, data) {
        if (err) {
          return res.status(400).send({
            status: 400,
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          replyRegisterSuccess();
          res.jsonp({
            status: 200,
            data: data
          });
        }
      });
    } else {
      res.sendStatus(400);
    }
  }
  User.findOne({ userid: req.body.events[0].source.userId }, function(
    err,
    data
  ) {
    if (err) {
      next();
    } else {
      req.userData = data;
      next();
    }
  });
  // next();
};

exports.updateNews = (req, res, next) => {
  if (
    !isNaN(parseFloat(req.body.events[0].message.text)) &&
    isFinite(req.body.events[0].message.text) &&
    parseFloat(req.body.events[0].message.text) <= 300
  ) {
    if (req.userData) {
      var newPmreport = new Pmreport({
        name: req.userData.stationgroup,
        aqi: req.body.events[0].message.text,
        lat: req.userData.lat,
        lng: req.userData.lng,
        createby: {
          _id: req.body.events[0].source.userId || "",
          username: req.userData.name
        }
      });
      newPmreport.save(function(err, data) {
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
        }
      });
    } else {
      replyNotAuthorize(req.body);
      res.sendStatus(400);
    }
  } else {
    next();
  }
};
exports.getUser = (req, res, next) => {
  User.find((err, data) => {
    if (err) {
      return res.status(400).send({
        status: 400,
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.user = data;
      next();
    }
  });
};
exports.getPMData = (req, res, next) => {
  if (req.body.events[0].message.text === "?") {
    let d = new Date(Date.now() - 60 * 60 * 1000);
    Pmreport.find(
      {
        created: {
          $gt: d
        }
      },
      null,
      { sort: "-created" },
      (err, data) => {
        if (err) {
          return res.status(400).send({
            status: 400,
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          req.data = data || [];
          next();
        }
      }
    );
  } else {
    next();
  }
};

exports.getPMData2 = (req, res, next) => {
  if (true) {
    let d = new Date(Date.now() - 60 * 60 * 1000);
    Pmreport.find(
      {
        created: {
          $gt: d
        }
      },
      null,
      { sort: "-created" },
      (err, data) => {
        if (err) {
          return res.status(400).send({
            status: 400,
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          req.data = data || [];

          next();
        }
      }
    );
  } else {
    next();
  }
};
exports.cookTemplateData = (req, res, next) => {
  var lst = [];
  var min,
    max = 0;
  var timeago = "ago"; //timeAgo(Date.now() + 35 * 1000);
  var currvalue = 0;
  req.columns = [];
  if (req.data) {
    req.data.forEach(element => {
      if (lst.indexOf(element.name) === -1) {
        lst.push(element.name);
        min = element.aqi;
        max = element.aqi;

        // var d = new Date("2017-03-16T17:46:53.677");
        // console.log(d.toLocaleString());
        timeago = timeAgo(element.created + 35 * 1000);
        //timeago = moment(element.created).format('DD/MM/YYYY h:mm')
        req.columns.push({
          name: element.name,
          title: `${element.name}, Avg1Hr:${element.aqi}`,
          text: `last update :${element.aqi}(${timeago})\n${min}|${max}`,
          lat: element.lat,
          lng: element.lng,
          min: element.aqi,
          max: element.aqi,
          sum: element.aqi,
          lasted: element.aqi,
          userId: element.createby._id,
          cnt: 1,
          timeago: timeago,
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
        if (req.columns[lst.indexOf(element.name)].max < element.aqi) {
          req.columns[lst.indexOf(element.name)].max = element.aqi;
        }
        req.columns[lst.indexOf(element.name)].text = `Last update :${
          req.columns[lst.indexOf(element.name)].lasted
        }(${req.columns[lst.indexOf(element.name)].timeago})\n${
          req.columns[lst.indexOf(element.name)].min
        }|${req.columns[lst.indexOf(element.name)].max}`;
        req.columns[lst.indexOf(element.name)].title = `${
          element.name
        }, Avg1Hr:${Math.round(
          req.columns[lst.indexOf(element.name)].sum /
            req.columns[lst.indexOf(element.name)].cnt
        )}`;
      }
    });
    next();
  } else {
    next();
  }
};

exports.getReport = (req, res, next) => {
  if (req.body.events[0].message.text === "?") {
    replySummaryReport(req.body, req.columns);
    res.jsonp({
      status: 200,
      data: req.data
    });
  } else {
    next();
  }
};
exports.forUserAndCookdata = (req, res, next) => {
  req.dataOK = [];
  if (req.columns.length === 0) {
    req.user.forEach(user => {
      req.dataOK.push({
        name: user.name,
        title: ``,
        text: ``,
        lat: user.lat,
        lng: user.lng,
        min: 0,
        max: 0,
        sum: 0,
        lasted: 0,
        userId: user.userid,
        cnt: 1,
        timeago: ""
      });
    });
  } else {
    req.user.forEach(user => {
      req.columns.forEach(column => {
        if (column.userId === user.userid) {
          req.dataOK.push(column);
        } else {
          req.dataOK.push({
            name: user.name,
            title: ``,
            text: ``,
            lat: user.lat,
            lng: user.lng,
            min: 0,
            max: 0,
            sum: 0,
            lasted: 0,
            userId: user.userid,
            cnt: 1,
            timeago: ""
          });
        }
      });
    });
  }

  next();
};
exports.getReport2 = (req, res, next) => {
  res.jsonp({
    status: 200,
    data: req.dataOK
  });
};

exports.replyException = (req, res, next) => {
  replyException(req.body);
  res.jsonp({
    status: 200,
    data: { message: "กรุณากรอกข้อมูลเป็นตัวเลข 0-300 (ค่า AQI)" }
  });
};

exports.hook = (req, res) => {
  if (req.body.events[0].message.type !== "text") {
    res.sendStatus(400);
  }
  if (
    !isNaN(parseFloat(req.body.events[0].message.text)) &&
    isFinite(req.body.events[0].message.text)
  ) {
    var newPmreport = new Pmreport({
      name: "station name",
      aqi: req.body.events[0].message.text,
      createby: {
        _id: req.body.events[0].source.userId || "",
        username: "jigkoh",
        displayname: "theera"
      }
    });
    newPmreport.save(function(err, data) {
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
      }
    });
  } else if (req.body.events[0].message.text === "?") {
    replySummaryReport(req.body);
    res.jsonp({
      status: 200,
      data: { message: "template" }
    });
  } else {
    replyException(req.body);
    res.jsonp({
      status: 200,
      data: { message: "กรุณากรอกข้อมูลเป็นตัวเลข 0-300 (ค่า PM2.5)" }
    });
  }
};

exports.iotCreate = (req, res) => {
  var newPmreport = new Pmreport({
    name: req.query.name,
    aqi: req.query.aqi
  });
  newPmreport.save(function(err, data) {
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
    }
  });
};

exports.startdate = function(req, res, next, enddate) {
  var end = new Date(enddate);
  var startdate = req.startdate;
  Pmreport.find({ created: { $gte: startdate, $lte: end } })
    .sort("-created")
    .exec(function(err, data) {
      if (err) {
        return next(err);
      } else if (!data) {
        return res.status(404).send({
          message: "No data found"
        });
      }
      req.pm2dot5 = data;
      next();
    });
};

exports.excelreports = function(req, res, next) {
  var items = [];
  var pm2dot5 = req.pm2dot5 ? req.pm2dot5 : [];
  pm2dot5.forEach(function(itm) {
    items.push({
      reportdate: formatDate(itm.created),
      reporttime : formatTime(itm.created),//new Date(itm.created).toLocaleTimeString(),
      reporter: itm.name,
      value: itm.aqi,
      lat: itm.lat,
      lng: itm.lng
    });
  });
  res.xls("data.xlsx", items);
  //res.jsonp({ orders: orderslist});
};

function formatTime(date) {
  var d = new Date(date),
    hour = "" + d.getHours(),
    minutes = "" + d.getMinutes(),
    seconds = d.getSeconds();

  if (hour.length < 2) hour = "0" + hour;
  if (minutes.length < 2) minutes = "0" + minutes;
  if (seconds.length < 2) seconds = "0" + seconds;

  return [hour, minutes, seconds].join("-");
}

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

const reply = bodyResponse => {
  let headers = {
    "Content-Type": "application/json",
    Authorization:
      "Bearer T9lDXjk9Hn7JIcIafSWNSasnnOcTWpZZziyQHO+91xhsw/6r3BQZkf9WYw6wpnAAG6n+spDjNXWoQKDZsUw+5ZIiZrXtrHhvPXs72nnIxdLFZ1RbC6/zQAXWQr7G2iHKYwVj6I4QzfaUmxe6AhffZwdB04t89/1O/w1cDnyilFU="
  };
  let body = JSON.stringify({
    replyToken: bodyResponse.events[0].replyToken,
    messages: [
      {
        type: `text`,
        text: `ขอบคุณครับสำหรับข้อมูล : ${bodyResponse.events[0].message.text}`
      }
    ]
  });
  request.post(
    {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: headers,
      body: body
    },
    (err, res, body) => {
      console.log("status = " + res.statusCode);
    }
  );
};

const replyRegisterSuccess = bodyResponse => {
  let headers = {
    "Content-Type": "application/json",
    Authorization:
      "Bearer T9lDXjk9Hn7JIcIafSWNSasnnOcTWpZZziyQHO+91xhsw/6r3BQZkf9WYw6wpnAAG6n+spDjNXWoQKDZsUw+5ZIiZrXtrHhvPXs72nnIxdLFZ1RbC6/zQAXWQr7G2iHKYwVj6I4QzfaUmxe6AhffZwdB04t89/1O/w1cDnyilFU="
  };
  let body = JSON.stringify({
    replyToken: bodyResponse.events[0].replyToken,
    messages: [
      {
        type: `text`,
        text: `การลงทะเบียนสำเร็จ ท่านสามารถรายงานผลคุณภาพเป็นตัวเลขตั่งแต่ (0-300) ได้แล้วครับ`
      }
    ]
  });
  request.post(
    {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: headers,
      body: body
    },
    (err, res, body) => {
      console.log("status = " + res.statusCode);
    }
  );
};

const replyException = bodyResponse => {
  let headers = {
    "Content-Type": "application/json",
    Authorization:
      "Bearer T9lDXjk9Hn7JIcIafSWNSasnnOcTWpZZziyQHO+91xhsw/6r3BQZkf9WYw6wpnAAG6n+spDjNXWoQKDZsUw+5ZIiZrXtrHhvPXs72nnIxdLFZ1RbC6/zQAXWQr7G2iHKYwVj6I4QzfaUmxe6AhffZwdB04t89/1O/w1cDnyilFU="
  };
  let body = JSON.stringify({
    replyToken: bodyResponse.events[0].replyToken,
    messages: [
      {
        type: `text`,
        text: `กรุณากรอกข้อมูลเป็นตัวเลข 0-300 (ค่า PM2.5)`
      }
    ]
  });
  request.post(
    {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: headers,
      body: body
    },
    (err, res, body) => {
      console.log("status = " + res.statusCode);
    }
  );
};

const replySummaryReport = (bodyResponse, columns) => {
  let headers = {
    "Content-Type": "application/json",
    Authorization:
      "Bearer T9lDXjk9Hn7JIcIafSWNSasnnOcTWpZZziyQHO+91xhsw/6r3BQZkf9WYw6wpnAAG6n+spDjNXWoQKDZsUw+5ZIiZrXtrHhvPXs72nnIxdLFZ1RbC6/zQAXWQr7G2iHKYwVj6I4QzfaUmxe6AhffZwdB04t89/1O/w1cDnyilFU="
  };
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
  });
  request.post(
    {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: headers,
      body: body
    },
    (err, res, body) => {
      console.log("status = " + res.statusCode);
    }
  );
};

const replyNotAuthorize = bodyResponse => {
  let headers = {
    "Content-Type": "application/json",
    Authorization:
      "Bearer T9lDXjk9Hn7JIcIafSWNSasnnOcTWpZZziyQHO+91xhsw/6r3BQZkf9WYw6wpnAAG6n+spDjNXWoQKDZsUw+5ZIiZrXtrHhvPXs72nnIxdLFZ1RbC6/zQAXWQr7G2iHKYwVj6I4QzfaUmxe6AhffZwdB04t89/1O/w1cDnyilFU="
  };
  // let body = JSON.stringify({
  //     replyToken: bodyResponse.events[0].replyToken,
  //     messages: [{
  //         type: `text`,
  //         text: `ท่านยังไม่ได้ลงทะเบียนกับผู้ดูแลระบบ โดยอ้างอิงเลขที่ : ${bodyResponse.events[0].source.userId}`
  //     }]
  // })
  let body = JSON.stringify({
    replyToken: bodyResponse.events[0].replyToken,
    messages: [
      {
        type: `text`,
        text: `กรุณาส่งพิกัด Location ที่ท่านตรวจวัด และ รายงานคุณภาพอากาศ`
      }
    ]
  });
  request.post(
    {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: headers,
      body: body
    },
    (err, res, body) => {
      console.log("status = " + res.statusCode);
    }
  );
};
