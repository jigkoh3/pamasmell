'use strict';
// use model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var PmreportSchema = new Schema({
    name: {
        type: String,
        required: 'Please fill a Pmreport name',
    },
    aqi: {
        type: Number,
        required: 'Please fill a Pmreport aqi',
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date
    },
    createby: {
        _id: {
            type: String
        },
        username: {
            type: String
        },
        displayname: {
            type: String
        }
    },
    updateby: {
        _id: {
            type: String
        },
        username: {
            type: String
        },
        displayname: {
            type: String
        }
    }
});

var UserSchema = new Schema({
    name: {
        type: String,
        required: 'Please fill a User name',
    },
    userid: {
        type: String,
        required: 'Please fill a User ID',
    },
    stationgroup:{
        type: String,
        required: 'Please fill a Station Group',
    },
    devicename: String,
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date
    },
    createby: {
        _id: {
            type: String
        },
        username: {
            type: String
        },
        displayname: {
            type: String
        }
    },
    updateby: {
        _id: {
            type: String
        },
        username: {
            type: String
        },
        displayname: {
            type: String
        }
    }
});

mongoose.model("Pmreport", PmreportSchema);

mongoose.model("User", UserSchema);