'use strict';
var request = require('supertest'),
    assert = require('assert'),
    config = require('../../../config/config'),
    _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    mongoose = require('mongoose'),
    app = require('../../../config/express'),
    Pmreport = mongoose.model('Pmreport');

var credentials,
    token,
    mockup;

describe('Pmreport CRUD routes tests', function () {

    before(function (done) {
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
            .post('/webhook')
            .send({
                events: [
                    { message: { type: "text", text: "54" } }
                ]
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                assert.equal(resp.data.aqi, 54);
                done();
            });
    })


    afterEach(function (done) {
        Pmreport.remove().exec(done);
    });

});