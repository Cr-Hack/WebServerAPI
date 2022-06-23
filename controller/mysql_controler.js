exports.getUser = function(mysql, first_name, last_name, email, callback) {
    mysql.query(
        "SELECT * FROM users WHERE UPPER(first_name) = UPPER(?) AND UPPER(last_name) = UPPER(?) AND UPPER(email) = UPPER(?)", [first_name, last_name, email],
        (error, results) => {
            if (error) {
                console.log("Error with database.", error)
                callback(error, null)
            } else {
                if (results != null || results.length == 0) {
                    callback(null, null)
                } else {
                    callback(null, results[0])
                }
            }
        }
    )
}