'use strict';
var controller = require('../controllers/controller'),
    policy = require('../policy/policy');
module.exports = function (app) {
    var url = '/api/pmreports';
    var urlWithParam = '/api/pmreports/:pmreportId';

    app.route('/webhook').post(controller.getUserProfile
        , controller.updateNews
        , controller.getReport
        , controller.replyException);

    app.route('/api/users')
    .get(controller.Users)
    .post(controller.createUser);

    app.route('/api/users/:userId').get(controller.userById)

    app.route(url).all(policy.isAllowed)
        .get(controller.getList)
        .post(controller.create);

    app.route(urlWithParam).all(policy.isAllowed)
        .get(controller.read)
        .put(controller.update)
        .delete(controller.delete);

    app.param('pmreportId', controller.getByID);
    app.param('userId', controller.getByUserID);
}