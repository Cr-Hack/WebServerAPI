exports.getUser = function(mysql, email, callback) {
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

exports.insertNewFile = function(mysql, receiverID, senderID, name, path, type, size, receiverKey, senderKey, callback) {
    mysql.getConnection(function(err, connection) {
        if (err) {
            callback(error, null)
        }
        try {
            connection.beginTransaction()
            connection.query(
                "INSERT INTO files (name, path, type, size, datedeposite) VALUES (?,?,?,?,now())", [name, path, type, size],
                (err, results) => {
                    if (err || !results) {
                        connection.rollback()
                        connection.release();
                        callback(err, null)
                    } else {
                        console.log(results)
                        let fileID = results.insertId
                        connection.query(
                            "INSERT INTO have_access (userID, fileID, sender, publickey) VALUES (?,?,?,?)", [senderID, fileID, true, senderKey],
                            (err, results) => {
                                if (err || !results) {
                                    connection.rollback()
                                    connection.release();
                                    callback(err, null)
                                } else {
                                    connection.query(
                                        "INSERT INTO have_access (userID, fileID, sender, publickey) VALUES (?,?,?,?)", [receiverID, fileID, false, receiverKey],
                                        (err, results) => {
                                            if (err || !results) {
                                                connection.rollback()
                                                connection.release();
                                                callback(err, null)
                                            } else {
                                                connection.commit()
                                                connection.release();
                                                callback(null, { fileID: fileID })
                                            }
                                        }
                                    )
                                }
                            }
                        )
                    }
                }
            )
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

exports.getFileById = function(mysql, fileID, userID, callback) {
    mysql.query(
        "SELECT f.fileID, f.name, f.path, f.type, f.size, f.datedeposite FROM files f INNER JOIN have_access h on h.fileID = f.fileID WHERE h.userID = ? and f.fileID = ?", [userID, fileID],
        (error, results) => {
            if (error) {
                console.log(error)
                callback(error, null)
            } else if (results && results.length > 0) {
                callback(null, results[0])
            } else {
                callback(null, null)
            }
        }
    )
}