const sec = require("../utils/security")
const mysql_controller = require("../controller/mysql_controller")

exports.getPublicKey = function(req, res) {
    let body = req.body
    if (!body.userID ||
        sec.verify_injection(body.id)
    ) {
        mysql_controller.getUserById(req.pool_SQL, body.id,
            (error, results) => {
                if (error || !results) {
                    console.log(error)
                    res.status(400).send({
                        error: "The user does not exists"
                    })
                } else {
                    sec.status(200).send({
                        publickey: results.publickey
                    })
                }
            }
        )
    }
}

exports.getId = function(req, res) {
    let body = req.body
    if (!body.email ||
        sec.verify_injection(body.email) ||
        !sec.verify_email(body.email)
    ) {
        res.status(400).send({
            error: "Inputs are invalid"
        })
    } else {
        mysql_controller.getUserByEmail(req.pool_SQL, body.email,
            (error, results) => {
                if (error || !results) {
                    res.status(400).send({
                        error: "There is no user with this email"
                    })
                } else {
                    res.status(200).send({
                        userId: results.userID
                    })
                }
            }
        )
    }
}