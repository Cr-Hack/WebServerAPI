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

    // Authentification

    const auth_control = require("./auth_control")
    app.post("/auth/register", auth_control.register)
    app.post("/auth/login", auth_control.login)


    // Files Operation
    const sec = require("../utils/security")
    const file_control = require("./file_control")
    app.post("/file/view", sec.verify_auth, file_control.view)
    app.post("/file/delete", sec.verify_auth, file_control.delete)
    app.post("/file/upload", sec.verify_auth, file_control.upload)
    app.post("/file/download", sec.verify_auth, file_control.download)

    const user_control = require("./user_control")
    app.post("/users/publickey", sec.verify_auth, user_control.getPublicKey)
    app.post("/users/getid", sec.verify_auth, user_control.getId)
};