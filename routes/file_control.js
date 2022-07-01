const sec = require("../utils/security")
const uuid = require("uuid")
const mysql_controller = require("../controller/mysql_controller")

exports.view = async function(req, res) {
    try {
        let files = await mysql_controller.getFiles(req.pool_SQL, req.user.userID)
        res.status(200).json({
            files: files
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            message: "There is no file"
        })
    }
}

const fs = require('fs')

exports.delete = async function(req, res) {
    let body = req.body
    if (
        body.fileID == undefined ||
        sec.verify_injection(body.fileID)) {
        res.status(400).send({
            error: "Incorrect request input"
        })
    } else {
        try {
            console.log("trying...")
            let file = await mysql_controller.getFileById(req.pool_SQL, body.fileID, req.user.userID)
            let path = file.path
            let isdeleted = await mysql_controller.deleteFile(req.pool_SQL, body.fileID, req.user.userID)
            if (!isdeleted) throw "Il n'y pas de fichier avec cet ID"
            fs.unlink(path, (err) => {
                if (err) {
                    console.error(err)
                    return
                }
            })
            res.status(200).send({ message: "Le fichier est supprimé" })
        } catch (error) {
            console.log(error)
            res.status(400).send({
                message: "Il n'y pas de fichier avec cet ID"
            })
        }
    }
}

exports.upload = async function(req, res) {
    try {
        let body = req.body
        if (!body.receiverID ||
            !body.name ||
            !body.type ||
            !body.size ||
            !body.receiverkey ||
            !body.senderkey ||
            !body.receiverIV ||
            !body.senderIV ||
            sec.verify_injection(body.receiverID) ||
            sec.verify_injection(body.name) ||
            sec.verify_injection(body.type) ||
            sec.verify_injection(body.size) ||
            sec.verify_injection(body.receiverkey) ||
            sec.verify_injection(body.senderkey) ||
            sec.verify_injection(body.receiverIV) ||
            sec.verify_injection(body.senderIV) ||
            !sec.verify_length(body.name, 250) ||
            !sec.verify_length(body.type, 50) ||
            !sec.verify_length(body.receiverkey, 4500) ||
            !sec.verify_length(body.senderkey, 4500) ||
            !sec.verify_length(body.receiverIV, 4500) ||
            !sec.verify_length(body.senderIV, 4500)
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
                        let id = uuid.v4()
                        let path = "/var/node/files/" + id + ".encrypted"
                        fs.writeFile(path, body.data, function(err) {
                            if (err) {
                                res.status(500).send({
                                    error: "Error when storing the data."
                                })
                            } else {
                                console.log('File is created successfully.');
                                mysql_controller.insertNewFile(
                                    req.pool_SQL, body.receiverID, req.user.userID, body.name, path, body.type,
                                    body.size, body.receiverkey, body.senderkey, body.receiverIV, body.senderIV,
                                    (error) => {
                                        if (error) {
                                            console.log(error)
                                            res.status(500).send({
                                                error: "Error when getting files from BDD"
                                            })
                                        } else {
                                            res.status(200).send({
                                                message: "File uploaded !"
                                            })
                                        }
                                    }
                                )
                            }
                        });
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

function bufferToString(arrayBuf) {
    return String.fromCharCode.apply(null, new Uint8Array(arrayBuf));
}

exports.download = async function(req, res) {
    try {
        let body = req.body
        if (
            body.fileID == undefined ||
            sec.verify_injection(body.fileID)) {
            res.status(400).send({
                error: "Incorrect request input"
            })
        } else {
            let file = await mysql_controller.getFileById(req.pool_SQL, body.fileID, req.user.userID)
            const data = bufferToString(fs.readFileSync(file.path))
            res.status(200).send({
                data: data,
                name: file.name,
                type: file.type,
                size: file.size,
                datedeposite: file.datedeposite,
                sender: file.sender,
                publickey: file.publickey,
                iv: file.iv
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({
            error: "Error when downloding file"
        })
    }
}