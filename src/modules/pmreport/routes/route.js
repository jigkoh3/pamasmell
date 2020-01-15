"use strict";
var controller = require("../controllers/controller"),
  policy = require("../policy/policy");
module.exports = function(app) {
  var url = "/api/pmreports";
  var urlWithParam = "/api/pmreports/:pmreportId";

  app
    .route("/webhook")
    .post(
      controller.getUserProfile,
      controller.updateNews,
      controller.getPMData,
      controller.cookTemplateData,
      controller.getReport,
      controller.replyException
    );

  app
    .route("/api/users")
    .get(controller.Users)
    .post(controller.createUser);

  app.route("/api/users/:userId").get(controller.userById);

  app
    .route(url)
    .all(policy.isAllowed)
    .get(controller.getList)
    .post(controller.create);

  app
    .route(urlWithParam)
    .all(policy.isAllowed)
    .get(controller.read)
    .put(controller.update)
    .delete(controller.delete);
  app
    .route("/api/reports")
    .get(
      controller.getUser,
      controller.getPMData2,
      controller.cookTemplateData,
      controller.forUserAndCookdata,
      controller.getReport2
    );

  app.route("/api/iotreport").get(controller.iotCreate);

  app
    .route("/api/excelreports/:startdate/:enddate")
    .get(controller.excelreports);

  app.route("/api/aqi").get(controller.aqi);

  app.param("pmreportId", controller.getByID);
  app.param("userId", controller.getByUserID);

  app.param('startdate', function (req, res, next, startdate) {
    req.startdate = startdate;
    next();
  });

  app.param('enddate', controller.startdate);
};
