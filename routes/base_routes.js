module.exports = function(app) {
    //let controller = require('../controllers/controller');

    // test server
    app.get("/", (req, res) => {
        res.json({ message: "Server lives!!!" });
    });

    // Other Routes

};