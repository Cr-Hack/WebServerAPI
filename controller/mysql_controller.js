function query(mysql, sqlQuery, sqlQueryValues) {
    return new Promise(function(resolve, reject) {
        mysql.query(sqlQuery, sqlQueryValues, function(err, results) {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}

exports.getUser = function(mysql, email) {
    return new Promise(async function(resolve, reject) {
        try {
            let result = await query(
                mysql,
                "SELECT * FROM users WHERE UPPER(email) = UPPER(?)", [email]
            )
            if (!result || result.length == 0) throw "There is no user with this name."
            resolve(result[0])
        } catch (error) {
            reject(error)
        }
    })
}

exports.getUserById = function(mysql, id, callback) {
    mysql.query(
        "SELECT * FROM users WHERE userID = ?", [id],
        (error, results) => {
            if (error) {
                console.log("Error with database.", error)
                callback(error, null)
            } else {
                if (results == null || results.length == 0) {
                    callback(null, null)
                } else {
                    callback(null, results[0])
                }
            }
        }
    )
}

exports.getUserByEmail = function(mysql, email, callback) {
    mysql.query(
        "SELECT * FROM users WHERE UPPER(email) = UPPER(?)", [email],
        (error, results) => {
            if (error) {
                console.log("Error with database.", error)
                callback(error, null)
            } else {
                if (results == null || results.length == 0) {
                    callback(null, null)
                } else {
                    callback(null, results[0])
                }
            }
        }
    )
}

exports.insertNewUser = function(mysql, first_name, last_name, email, bcryptedPass, privatekey, publickey, iv, salt) {
    return new Promise(async function(resolve, reject) {
        try {
            await query(
                mysql,
                "INSERT INTO users (firstname, lastname, email, hashed_pass, privatekey, publickey, iv, salt) VALUES (?,?,?,?,?,?,?,?)", [first_name, last_name, email, bcryptedPass, privatekey, publickey, iv, salt]
            )
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

exports.insertNewFile = function(mysql, part_number, total_parts, receiverID, senderID, name, path, type, size, receiverKey, senderKey, receiverIV, senderIV, callback) {
    mysql.getConnection(async function(err, connection) {
        if (err) {
            callback(error, null)
        }
        try {
            connection.beginTransaction()
            try {
                let result_insert_file = await query(
                    mysql,
                    "INSERT INTO files (part_number, total_parts, name, path, type, size, datedeposite) VALUES (?,?,?,?,?,?,now())", [part_number, total_parts, name, path, type, size]
                )
                if (!result_insert_file) throw "Error with database"
                let fileID = result_insert_file.insertId
                let result_insert_sender = await query(
                    mysql,
                    "INSERT INTO have_access (userID, fileID, part_number, sender, aeskey, iv) VALUES (?,?,?,?,?,?)", [senderID, fileID, part_number, true, senderKey, senderIV]
                )
                if (!result_insert_sender) throw "Error with database"
                let result_insert_receiver = await query(
                    mysql,
                    "INSERT INTO have_access (userID, fileID, part_number, sender, aeskey, iv) VALUES (?,?,?,?,?,?)", [receiverID, fileID, part_number, false, receiverKey, receiverIV]
                )
                if (!result_insert_receiver) throw "Error with database"
                connection.commit()
                connection.release()
                callback(null, { fileID: fileID })
            } catch (error) {
                connection.rollback()
                connection.release();
                callback(error, null)
            }
        } catch (err) {
            connection.rollback()
            connection.detroy();
            callback(err)
        }
    });
}

exports.insertPartFile = function(mysql, fileID, part_number, total_parts, receiverID, senderID, name, path, type, size, receiverKey, senderKey, receiverIV, senderIV, callback) {
    mysql.getConnection(async function(err, connection) {
        if (err) {
            callback(error, null)
        }
        try {
            connection.beginTransaction()
            try {
                let result_insert_file = await query(
                    mysql,
                    "INSERT INTO files (fileID, part_number, total_parts, name, path, type, size, datedeposite) VALUES (?,?,?,?,?,?,?,now())", [fileID, part_number, total_parts, name, path, type, size]
                )
                if (!result_insert_file) throw "Error with database"
                let result_insert_sender = await query(
                    mysql,
                    "INSERT INTO have_access (userID, fileID, part_number, sender, aeskey, iv) VALUES (?,?,?,?,?,?)", [senderID, fileID, part_number, true, senderKey, senderIV]
                )
                if (!result_insert_sender) throw "Error with database"
                let result_insert_receiver = await query(
                    mysql,
                    "INSERT INTO have_access (userID, fileID, part_number, sender, aeskey, iv) VALUES (?,?,?,?,?,?)", [receiverID, fileID, part_number, false, receiverKey, receiverIV]
                )
                if (!result_insert_receiver) throw "Error with database"
                connection.commit()
                connection.release()
                callback(null, { fileID: fileID })
            } catch (error) {
                connection.rollback()
                connection.release();
                callback(error, null)
            }
        } catch (err) {
            connection.rollback()
            connection.detroy();
            callback(err)
        }
    });
}

exports.findPath = function(mysql, fileID, userID, callback) {
    mysql.query(
        "SELECT f.path FROM files f INNER JOIN have_access h on h.fileID = f.fileID WHERE h.userID = ? and f.fileID = ?", [userID, fileID],
        (error, results) => {
            if (error) {
                console.log("Error with database.", error)
                callback(error, null)
            } else {
                if (results == null || results.length == 0) {
                    callback(null, null)
                } else {
                    callback(null, results[0])
                }
            }
        }
    )
}

exports.getFileById = function(mysql, fileID, partNumber, userID) {
    return new Promise(async function(resolve, reject) {
        try {
            let result = await query(
                mysql,
                "SELECT f.fileID, f.name, f.path, f.part_number, f.total_parts, f.type, f.size, f.datedeposite, h.sender, h.aeskey, h.iv FROM files f INNER JOIN have_access h on h.fileID = f.fileID WHERE h.userID = ? and f.fileID = ? and f.part_number = ?", [userID, fileID, partNumber]
            )
            if (!result || result.length == 0) throw "Il n'y a pas de fichier avec cet ID"
            resolve(result[0])
        } catch (error) {
            reject(error)
        }
    })
}

exports.getAllFilePartById = function(mysql, fileID, userID) {
    return new Promise(async function(resolve, reject) {
        try {
            let result = await query(
                mysql,
                "SELECT f.fileID, f.name, f.path, f.part_number, f.total_parts, f.type, f.size, f.datedeposite, h.sender, h.aeskey, h.iv FROM files f INNER JOIN have_access h on h.fileID = f.fileID WHERE h.userID = ? and f.fileID = ?", [userID, fileID]
            )
            if (!result || result.length == 0) throw "Il n'y a pas de fichier avec cet ID"
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

exports.getFiles = function(mysql, userID) {
    return new Promise(async function(resolve, reject) {
        try {
            let result = await query(
                mysql,
                'SELECT f.fileID, f.name, f.type, f.size, f.datedeposite, us.email as sender, us2.email as other FROM have_access h INNER JOIN users u ON u.userID = h.userID AND h.part_number = 0 INNER JOIN files f ON f.fileID = h.fileID and f.part_number = 0 INNER JOIN have_access has ON has.fileID = f.fileID AND has.sender = true AND has.part_number = 0 INNER JOIN users us ON us.userID = has.userID INNER JOIN have_access has2 ON has2.fileID = f.fileID AND has2.userID != u.userID AND has2.part_number = 0 INNER JOIN users us2 ON us2.userID = has2.userID where u.userID = ?', [userID]
            )
            if (!result || result.length == 0) throw "There is no file."
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

exports.deleteFilePart = function(mysql, fileID, part_number, userID) {
    return new Promise(async function(resolve, reject) {
        try {
            let result = await query(
                mysql,
                'delete f from have_access h inner join files f on h.fileID = f.fileID inner join users u on u.userID = h.userID where f.fileID = ? and u.userID = ? and f.part_number = ?', [fileID, userID, part_number]
            )
            if (!result || result.affectedRows == 0) throw "Il n'y pas de fichier avec cet ID"
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}