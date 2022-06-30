const sec = require("../utils/security")
const uuid = require("uuid")
const mysql_controller = require("../controller/mysql_controller")

exports.view = function(req, res) {
    req.pool_SQL.query(
            'SELECT f.fileID, f.name, f.type, f.size, f.datedeposite FROM have_access h INNER JOIN users u ON u.userID = h.userID INNER JOIN files f ON f.fileID = h.fileID where u.userID = ?', [req.user.userID],
            (error, results) => {
                if (error) {
                    console.log(error)
                    res.status(500).send({ message: "Error when getting files from BDD." })
                } else {
                    if (results && results.length > 0) {
                        console.log(results)
                        res.status(200).json({
                            message: "Voici la table files",
                            files: results
                        })
                    } else {
                        res.status(404).json({
                            message: "There is no file"
                        })
                    }
                }
            }
        )
        // connectionUsersFiles(req.pool_SQL, req.user,
        //     (exists) => {
        //         if (exists == -1) {
        //             if (error) {
        //                 console.log(error)
        //                 console.log("Pas de fichier rattacher à l'utilisateur")
        //                 res.status(500).send({ message: erreur })
        //             }
        //         } else if (exists == 1) {
        //             req.pool_SQL.query(
        //                 'SELECT f.name, f.path, f.type, f.size, f.datedeposite FROM have_acces h INNER JOIN users u ON u.userID = h.userID INNER JOIN files f ON f.fileID = h.fileID where u.userID = ?', [user.userID],
        //                 (error, results) => {
        //                     if (error) {
        //                         console.log(error)
        //                         res.status(500).send({ message: erreur })
        //                     } else {
        //                         console.log('-->results')
        //                         console.log(results)
        //                         res.json({ message: "Voici la table files" })
        //                     }
        //                 }
        //             )
        //         }
        //     }
        // )
}

const fs = require('fs')

exports.delete = function(req, res) {
    let body = req.body
    if (
        body.fileID == undefined ||
        sec.verify_injection(body.fileID)) {
        res.status(400).send({
            error: "Incorrect request input"
        })
    } else {
        mysql_controller.getFileById(req.pool_SQL, body.fileID, req.user.userID,
            (error, results) => {
                console.log(error, results)
                if (error || !results) {
                    res.status(400).send({
                        error: "Il n'y a pas de fichier avec cet ID"
                    })
                } else {
                    let path = results.path
                    req.pool_SQL.query(
                        'delete f from have_access h inner join files f on h.fileID = f.fileID inner join users u on u.userID = h.userID where f.fileID = ? and u.userID = ?', [req.body.fileID, req.user.userID],
                        (error, results) => {
                            if (error) {
                                console.log(error)
                                res.status(500).send({ message: error })
                            } else {
                                if (results && results.affectedRows > 0) {
                                    fs.unlink(path, (err) => {
                                        if (err) {
                                            console.error(err)
                                            return
                                        }
                                    })
                                    console.log(results)
                                    res.json({ message: "Le fichier est supprimé" })
                                } else {
                                    console.log('-->results')
                                    console.log(results)
                                    res.json({ message: "Il n'y pas de fichier avec cet ID" })
                                }
                            }
                        }
                    )
                }
            }
        )
    }
}

exports.upload = async function(req, res) {
    try {
        let body = req.body
        if (!req.files) {
            res.status(400).send({
                error: "No file uploaded"
            })
        } else if (!body.receiverID ||
            !body.name ||
            !body.type ||
            !body.size ||
            sec.verify_injection(body.receiverID) ||
            sec.verify_injection(body.name) ||
            sec.verify_injection(body.type) ||
            sec.verify_injection(body.size)
        ) {
            res.status(400).send({
                error: "Incorrect request input"
            })
        } else {
            mysql_controller.getUserById(req.pool_SQL, body.receiverID,
                (error, results) => {
                    if (error) {
                        res.status(500).send({
                            error: "Error when trying to get the receiver"
                        })
                    } else if (!results || results.length == 0) {
                        res.status(400).send({
                            error: "There is no user with id" + body.receiverID
                        })
                    } else {
                        let encryptedFile = req.files.encryptedFile
                        let id = uuid.v4()
                        let path = "/var/node/files/" + id + ".encrypted"
                        encryptedFile.mv(path)
                        console.log(encryptedFile)
                        mysql_controller.insertNewFile(req.pool_SQL, body.receiverID, req.user.userID, body.name, path, body.type, body.size, "Receiver key lol", "Sender key lol",
                            (error) => {
                                if (error) {
                                    console.log(error)
                                    res.status(500).send({
                                        error: "Error when getting files from BDD"
                                    })
                                } else {
                                    res.status(200).send({
                                        message: "Yes !"
                                    })
                                }
                            }
                        )
                    }
                }
            )
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({
            error: "Error when uploading file"
        })
    }
}

exports.download = async function(req, res){
    try {
        let body = req.body
        if (
            body.fileID == undefined ||
            sec.verify_injection(body.fileID)) {
            res.status(400).send({
                error: "Incorrect request input"
            })
        } else {
                mysql_controller.findPath(req.pool_SQL, body.fileID, 
                (error, results) => {
                    if (error || !results) {
                        res.status(400).send({
                            error: "Error with database."
                        })
                    } else {
                        res.download(results.path, function(error) {
                            if (error) {
                                console.log(error)
                                // res.status(500).send({
                                //     error: "Error when getting files to BDD"
                                // })
                            } else {
                                console.log("Yes download")
                                // res.status(200).send({
                                //     message: "Yes download !"
                                // })
                            }
                        })
                    }
                }
            )
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({
            error: "Error when downloding file"
        })
    }
}