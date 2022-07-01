const sec = require("../utils/security")
const mysql_controller = require("../controller/mysql_controller")
const auth_config = require("../config/auth_conf")

exports.register = async function(req, res) {
    let body = req.body
    console.log(body)
    if (
        body.last_name == undefined ||
        body.first_name == undefined ||
        body.email == undefined ||
        body.hashpassword == undefined ||
        body.privatekey == undefined ||
        body.publickey == undefined ||
        body.iv == undefined ||
        body.salt == undefined ||
        sec.verify_injection(body.last_name) ||
        sec.verify_injection(body.first_name) ||
        sec.verify_injection(body.email) ||
        sec.verify_injection(body.hashpassword) ||
        !sec.verify_length(body.last_name, 50) ||
        !sec.verify_length(body.first_name, 50) ||
        !sec.verify_length(body.email, 250) ||
        !sec.verify_length(body.hashpassword, 4000) ||
        !sec.verify_length(body.privatekey, 10000) ||
        !sec.verify_length(body.publickey, 10000) ||
        !sec.verify_length(body.iv, 4500) ||
        !sec.verify_length(body.salt, 4500) ||
        !sec.verify_email(body.email)) {
        res.status(400).send({
            error: "Incorrect request input"
        })
    } else {
        mysql_controller.getUserByEmail(req.pool_SQL, body.email,
            (error, result) => {
                if (error) {
                    console.log(error)
                    res.status(500).send({
                        error: "Server fail."
                    })
                } else if (result) {
                    res.status(409).send({
                        error: "Le compte existe déjà"
                    })
                } else {
                    req.bcrypt.cryptPassword(body.hashpassword,
                        async function(err, bcryptedPass) {
                            if (bcryptedPass) {
                                try {
                                    await mysql_controller.insertNewUser(req.pool_SQL, body.first_name, body.last_name, body.email, bcryptedPass, body.privatekey, body.publickey, body.iv, body.salt)
                                    res.status(202).json({ message: "Utilisateur enregistré" })
                                } catch (error) {
                                    console.log(error)
                                    res.status(500).send({ error: "Erreur réessayer dans quelques instants." })
                                }
                            } else {
                                console.log("error when hashing password with bcrypt", err)
                                res.status(500).send({
                                    error: "Error occured while adding to the database"
                                })
                            }
                        }
                    )
                }
            }
        )
    }
}

exports.login = async function(req, res) {
    let body = req.body
    if (
        body.email == undefined || body.hashpassword == undefined ||
        sec.verify_injection(body.email) ||
        sec.verify_injection(body.hashpassword) ||
        !sec.verify_length(body.email, 250) ||
        !sec.verify_email(body.email)
    ) {
        console.log('User has bad request variables (login)')
        res.status(400).send({ error: "Incorrect request input" })
    } else {
        try {
            let user = await mysql_controller.getUser(req.pool_SQL, body.email)
            req.bcrypt.comparePassword(body.hashpassword, user.hashed_pass,
                (err, isPasswordMatch) => {
                    if (err) {
                        console.log('Error when hashing password')
                        res.status(400).send({
                            error: "Error when hashing password"
                        })
                    } else if (isPasswordMatch) {
                        let token = req.jwt.sign({
                                userID: user.userID,
                                email: user.email,
                                privatekey: user.privatekey,
                                publickey: user.publickey,
                                iv: user.iv,
                                salt: user.salt
                            },
                            auth_config.secret, { expiresIn: 86400 } // expires in 24 hours
                        );
                        res.status(202).send({
                            userID: user.userID,
                            token: token,
                            publicKey: user.publickey,
                            privateKey: user.privatekey,
                            iv: user.iv,
                            salt: user.salt
                        })
                    } else {
                        console.log('User and pass no match. aborting.')
                        res.status(400).send({
                            error: "User and password doesn't match."
                        })
                    }
                }
            )
        } catch (error) {
            console.log('error with database')
            console.log(error)
            res.status(400).send({
                error: "User and password doesn't match."
            })
        }
    }
}