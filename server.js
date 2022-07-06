'use strict';

const express = require("express");
const fileupload = require("express-fileupload");

const sql = require("mysql");

const jwt = require('jsonwebtoken');

// Do we need cors ?
const cors = require("cors");

const mysql_config = require("./config/mysql_conf.js")

var pool_SQL = sql.createPool(mysql_config)

const app = express();

// If we use cors then:

var corsOptions = {
    origin: ("https://localhost", "http://localhost", "*")
};
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json({ limit: '50Gb' }))

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: '50Gb' }))

// Enabeling file upload
app.use(fileupload({ createParentPath: true, limits: { fileSize: 1250000000 } }))

const auth_config = require("./config/auth_conf.js")

const bcrypt = require("./controller/bcrypt.js");

/**
 * Default actions when a user use the API.
 */
app.use((req, res, next) => {
    // Default distributed modules
    req.pool_SQL = pool_SQL
    req.bcrypt = bcrypt
    req.jwt = jwt
    if (req.headers && req.headers.token) {
        jwt.verify(
            req.headers.token,
            auth_config.secret,
            (err, decode) => {
                if (err) req.user = undefined;
                req.user = decode;
                next();
            }
        );
    } else {
        req.user = undefined;
        next();
    }
})

/**
 * Now we define all the rutes of the app.
 */
require('./routes/base_routes')(app);

/**
 * Method to start the server on port 5000.
 */
const mysql_init = require("./controller/mysqlInit.js");

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function initmysql() {
    var initialized = false
    while (!initialized) {
        await sleep(5000)
        try {
            mysql_init(pool_SQL)
            initialized = true
        } catch (error) {}
    }
}

app.listen(5000, () => {
    initmysql()
    console.log("Server has started!")
})