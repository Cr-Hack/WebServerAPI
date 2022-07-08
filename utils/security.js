exports.verify_injection = function(value) {
    var result = value.toString().match(/(\s*([\0\b\'\"\n\r\t\%\_\\]*\s*(((select\s*.+\s*from\s*.+)|(insert\s*.+\s*into\s*.+)|(update\s*.+\s*set\s*.+)|(delete\s*.+\s*from\s*.+)|(drop\s*.+)|(truncate\s*.+)|(alter\s*.+)|(exec\s*.+)|(\s*(all|any|not|and|between|in|like|or|some|contains|containsall|containskey)\s*.+[\=\>\<=\!\~]+.+)|(let\s+.+[\=]\s*.*)|(begin\s*.*\s*end)|(\s*[\/\*]+\s*.*\s*[\*\/]+)|(\s*(\-\-)\s*.*\s+)|(\s*(contains|containsall|containskey)\s+.*)))(\s*[\;]\s*)*)+)/g)
    return result != null
}

exports.verify_length = function(value, max, min = 1) {
    return value.length >= min && value.length <= max
}

exports.verify_email = function(value) {
    var result = value.toString().match(/^(?!\.)[\w_.-]*[^.]@\w+\.\w+(\.\w+)?[^.\W]$/g)
    return result != null && result.length == 1 && result[0] == value
}

// exports.verify_existAccount = async function(mysql, email) {
//     mysql.query(
//         'SELECT * FROM users WHERE UPPER(email) = UPPER(?)', [email], (error, results) => {
//             if (error) {
//                 console.log(error)
//                 callback(-1)
//             } else if (results.length > 0) {
//                 console.log("message : Utilisateur présent dans la base de donnée")
//                 callback(0)
//             } else {
//                 console.log("message : L'utilisateur n'est pas présent dans la base de donnée")
//                 callback(1)
//             }
//         }
//     )
// }

exports.verify_space = function(first_name, last_name, email) {
    first_name.replace(/^ *| *$|(  +)/g, '')
    last_name.replace(/^ *| *$|(  +)/g, '')
    email.replace(/^ *| *$|(  +)/g, '')

}

exports.verify_auth = function(req, res, next) {
    if (req.user != undefined) {
        next()
    } else {
        res.status(400).send({
            error: "Your are not authentificated !"
        })
    }
}