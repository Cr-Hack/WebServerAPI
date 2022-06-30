const sec = require("../utils/security")
const mysql_controller = require("../controller/mysql_controller")
const auth_config = require("../config/auth_conf")

exports.register = function(req, res) {
    let body = req.body
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
        sec.verify_injection(body.privatekey) ||
        sec.verify_injection(body.publickey) ||
        sec.verify_injection(body.iv) ||
        sec.verify_injection(body.salt) ||
        sec.verify_injection(body.hashpassword) ||
        !sec.verify_length(body.last_name, 50) ||
        !sec.verify_length(body.first_name, 50) ||
        !sec.verify_length(body.email, 250) ||
        !sec.verify_length(body.hashpassword, 4000) ||
        !sec.verify_length(body.privatekey, 4500) ||
        !sec.verify_length(body.publickey, 4500) ||
        !sec.verify_length(body.iv, 4500) ||
        !sec.verify_length(body.salt, 4500) ||
        !sec.verify_email(body.email)) {
        res.status(400).send({
            error: "Incorrect request input"
        })
    } else {
        sec.verify_existAccount(req.pool_SQL, body.email,
            (exists) => {
                if (exists == -1) {
                    console.log("server fail retreive user")
                    res.status(500).send({
                        error: "Server fail"
                    })
                } else if (exists == 0) {
                    console.log("User already exists")
                    res.status(409).send({
                        error: "Le compte existe déjà"
                    })
                } else if (exists == 1) {
                    req.bcrypt.cryptPassword(body.hashpassword,
                        (err, bcryptedPass) => {
                            if (bcryptedPass) {
                                req.pool_SQL.query(
                                    'INSERT INTO users (firstname, lastname, email, hashed_pass, privatekey, publickey, iv, salt) VALUES (?,?,?,?,?,?,?,?)', [body.first_name, body.last_name, body.email, bcryptedPass, body.privatekey, body.publickey, body.iv, body.salt],
                                    (error, results) => {
                                        if (error) {
                                            console.log(error)
                                            res.status(500).send({ error: "Erreur réessayer dans quelques instants." })
                                        } else {
                                            res.status(202).json({ message: "Utilisateur enregistré" })
                                        }
                                    }
                                )
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

exports.login = function(req, res) {
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
        mysql_controller.getUser(req.pool_SQL, body.email,
            (error, result) => {
                if (error) {
                    res.status(500).send({ error: "Error with mysql database." })
                } else if (result) {
                    req.bcrypt.comparePassword(body.hashpassword, result.hashed_pass,
                        (err, isPasswordMatch) => {
                            if (err) {
                                console.log('Error when hashing password')
                                res.status(400).send({ error: "Error when hashing password" })
                            } else if (isPasswordMatch) {
                                result
                                let token = req.jwt.sign({
                                        userID: result.userID,
                                        email: result.email,
                                        privatekey: result.privatekey,
                                        publickey: result.publickey,
                                        iv: result.iv,
                                        salt: result.salt
                                    },
                                    auth_config.secret, { expiresIn: 86400 } // expires in 24 hours
                                );
                                res.status(202).send({ token: token, publicKey: result.publickey, privateKey: result.privatekey, iv: result.iv, salt: result.salt })
                            } else {
                                console.log('User and pass no match. aborting.')
                                res.status(400).send({ error: "User and password doesn't match." })
                            }
                        }
                    )
                } else {
                    console.log('There is no user with this auth (login)')
                    res.status(400).send({ error: "User and password doesn't match." })
                }
            }
        )
    }
}