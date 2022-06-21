const { password } = require("../config/mysql_conf");

module.exports = function(app) {
    //let controller = require('../controllers/controller');

    // test server
    app.get("/", (req, res) => {
        req.pool_SQL.query('SHOW TABLES;', function(error, results, fields) {
            if (error) {
                console.log(error);
                res.status(500).send("Error when connecting to database.");
            } else {
                res.status(200).send({
                    result: results,
                    fields: fields
                });
            }
        });
        //res.json({ message: "Server lives!!!" });
    });

    const auth_control = require("./auth_control")
    app.post("/auth/register", auth_control.register)
        
    // Other Routes

};