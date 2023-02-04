const express = require('express');
const mongoose = require('mongoose')
const app = express()
var conn = mongoose.connection;

const state = {
    db: null
}

module.exports.connect = (done) => {

    const url = 'mongodb://localhost:27017'
    const dbname = 'shoppingCart'

    mongoose.set('strictQuery', true);
    mongoose.connect(url, {
        useNewUrlParser: true, useUnifiedTopology: true
    }, (err, client) => {
        if (err) return done(err)
        state.db = conn.client.db(dbname)
        done()
    })
}

module.exports.get=()=>{
    return state.db
}