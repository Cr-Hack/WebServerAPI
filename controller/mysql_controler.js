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

exports.findPath = function(mysql, id, callback) {
    mysql.query(
        "SELECT path FROM files WHERE fileID = ?", [id],
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

exports.findName = function(mysql, id, callback) {
    mysql.query(
        "SELECT name FROM files WHERE fileID = ?", [id],
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