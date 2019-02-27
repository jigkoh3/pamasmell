'use strict';
var request = require('supertest'),
    assert = require('assert'),
    config = require('../../../config/config'),
    _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    mongoose = require('mongoose'),
    app = require('../../../config/express'),
    Pmreport = mongoose.model('Pmreport'),
    User = mongoose.model('User');
var timeAgo = require('node-time-ago');
var moment = require('moment');
var user,
    token,
    mockup;

describe('Pmreport CRUD routes tests', function () {

    before(function (done) {
        user = {
            name: 'name2',
            userid: 'U19947b3363cd6f914e292d4c45cb0558',
            stationgroup: 'วราบดินทร์',
            devicename: 'sony xx',
            lat: '13',
            lng: '100'
        };

        let _user = new User(user);
        _user.save();
        mockup = {
            name: 'name',
            aqi: 34,
            createby: {
                _id: '1234',
                username: 'jigkoh',
                displayname: 'theera'
            }
        };
        done();
        // User.remove().exec(done);
    });

    it('should be Pmreport get use token', (done) => {
        request(app)
            .get('/api/pmreports')
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                done();
            });
    });

    it('should be Pmreport get by id', function (done) {

        request(app)
            .post('/api/pmreports')
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                request(app)
                    .get('/api/pmreports/' + resp.data._id)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        var resp = res.body;
                        assert.equal(resp.status, 200);
                        assert.equal(resp.data.name, mockup.name);
                        assert.equal(resp.data.aqi, mockup.aqi);
                        assert.equal(resp.data.createby._id, mockup.createby._id);
                        done();
                    });
            });

    });

    it('should be Pmreport post use token', (done) => {
        request(app)
            .post('/api/pmreports')
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                assert.equal(resp.data.name, mockup.name);
                done();
            });
    });

    it('should be pmreport put use token', function (done) {

        request(app)
            .post('/api/pmreports')
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                var update = {
                    name: 'name update'
                }
                request(app)
                    .put('/api/pmreports/' + resp.data._id)
                    .send(update)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        var resp = res.body;
                        assert.equal(resp.data.name, update.name);
                        done();
                    });
            });

    });

    it('should be pmreport delete use token', function (done) {

        request(app)
            .post('/api/pmreports')
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                request(app)
                    .delete('/api/pmreports/' + resp.data._id)
                    // .set('Authorization', 'Bearer ' + token)
                    .expect(200)
                    .end(done);
            });

    });

    it('should be line bot connect to auto reply message', (done) => {

        request(app)
            .post('/api/users')
            .send(user)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                request(app)
                    .post('/webhook')
                    .send({
                        "events": [{
                            type: "message",
                            replyToken: "240eb82ca256405b9295d3d94fb3e47a",
                            source: { userId: "U19947b3363cd6f914e292d4c45cb0558", type: "user" },
                            timestamp: 1548975245547,
                            message: { type: "text", id: "9279140114603", text: "72" }
                        }],
                        destination: "Uff875d88b89f51a8bf83d2b4e04b4067"
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        var resp = res.body;
                        assert.equal(resp.data.name, 'วราบดินทร์')
                        assert.equal(resp.data.aqi, 72);
                        assert.equal(resp.data.createby._id, 'U19947b3363cd6f914e292d4c45cb0558');
                        assert.equal(resp.data.createby.username, 'name2')
                        done();
                    });
            });
    })

    it('should be line bot connect to auto reply exception message', (done) => {
        request(app)
            .post('/webhook')
            .send({
                "events": [{
                    type: "message",
                    replyToken: "240eb82ca256405b9295d3d94fb3e47a",
                    source: { userId: "U19947b3363cd6f914e292d4c45cb0558", type: "user" },
                    timestamp: 1548975245547,
                    message: { type: "text", id: "9279140114603", text: "xxx" }
                }],
                destination: "Uff875d88b89f51a8bf83d2b4e04b4067"
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                assert.equal(resp.data.message, 'กรุณากรอกข้อมูลเป็นตัวเลข 0-300 (ค่า AQI)');

                done();
            });
    })

    it('should be line bot connect to auto reply template message', (done) => {
        request(app)
            .post('/api/users')
            .send(user)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                request(app)
                    .post('/webhook')
                    .send({
                        "events": [{
                            type: "message",
                            replyToken: "240eb82ca256405b9295d3d94fb3e47a",
                            source: { userId: "U19947b3363cd6f914e292d4c45cb0558", type: "user" },
                            timestamp: 1548975245547,
                            message: { type: "text", id: "9279140114603", text: "72" }
                        }],
                        destination: "Uff875d88b89f51a8bf83d2b4e04b4067"
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        request(app)
                            .post('/webhook')
                            .send({
                                "events": [{
                                    type: "message",
                                    replyToken: "240eb82ca256405b9295d3d94fb3e47a",
                                    source: { userId: "U19947b3363cd6f914e292d4c45cb0558", type: "user" },
                                    timestamp: 1548975245547,
                                    message: { type: "text", id: "9279140114603", text: "?" }
                                }],
                                destination: "Uff875d88b89f51a8bf83d2b4e04b4067"
                            })
                            .expect(200)
                            .end(function (err, res) {
                                if (err) {
                                    return done(err);
                                }
                                var resp = res.body;
                                assert.equal(resp.data.length, 1);
                                done();
                            });
                    });
            });

    })

    //user
    it('should be Users get use token', (done) => {
        request(app)
            .get('/api/users')
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                done();
            });
    });

    it('time ago test', (done) => {
        var aaa = timeAgo(Date.now() + 35 * 1000);
        assert.equal(aaa, "35 second ago");
        assert.equal(moment(new Date("2017-03-16T17:46:53.677")).format('DD/MM/YYYY h:mm'), "16/03/2017 5:46");
        done();
    })

    it('should be User report pm2.5 with location', (done) => {
        request(app)
            .get('/api/reports')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                done();
            });
    })









    afterEach(function (done) {
        User.remove().exec(() => {
            Pmreport.remove().exec(done);
        });

    });

});