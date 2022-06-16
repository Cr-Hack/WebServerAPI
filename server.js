'use strict';

const express = require("express");

const sql = require("mysql");

const jwt = require('jsonwebtoken');

// Do we need cors ?
//const cors = require("cors");

const mysql_config = require("./config/mysql_conf.js")

var pool_SQL = sql.createPool(mysql_config)

const app = express();

// If we use cors then:
/* 
var corsOptions = {
    origin: "https://HOSTNAME:8081"
};

const app = express();
app.use(cors(corsOptions));
*/

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const auth_config = require("./config/auth_conf.js")


/**
 * Default actions when a user use the API.
 */
app.use((req, res, next) => {
    if (req.headers && req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'JWT') {
        jwt.verify(
            req.headers.authorization.split(' ')[1],
            auth_config.secret,
            (err, decode) => {
                if (err) req.user = undefined;
                req.user = decode;
                req.pool_SQL = pool_SQL
                next();
            }
        );
    } else {
        req.user = undefined;
        req.pool_SQL = pool_SQL
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
app.listen(5000, () => {
    console.log("Server has started!")
})