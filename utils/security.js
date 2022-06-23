exports.verify_injection = function(value) {
    var result = value.match(/(\s*([\0\b\'\"\n\r\t\%\_\\]*\s*(((select\s*.+\s*from\s*.+)|(insert\s*.+\s*into\s*.+)|(update\s*.+\s*set\s*.+)|(delete\s*.+\s*from\s*.+)|(drop\s*.+)|(truncate\s*.+)|(alter\s*.+)|(exec\s*.+)|(\s*(all|any|not|and|between|in|like|or|some|contains|containsall|containskey)\s*.+[\=\>\<=\!\~]+.+)|(let\s+.+[\=]\s*.*)|(begin\s*.*\s*end)|(\s*[\/\*]+\s*.*\s*[\*\/]+)|(\s*(\-\-)\s*.*\s+)|(\s*(contains|containsall|containskey)\s+.*)))(\s*[\;]\s*)*)+)/g)
    return result != null
}

exports.verify_length = function(value, max, min = 1){
    return value.length >= min && value.length <= max
}

exports.verify_email = function(value){
    var result = value.match(/^(?!\.)[\w_.-]*[^.]@\w+\.\w+(\.\w+)?[^.\W]$/g)
    return result != null && result.length == 1 && result[0] == value
}

exports.verify_existAccount = function(first_name,last_name,email){
    pool_SQL.query(
        'SELECT * FROM users WHERE UPPER(first_name) = UPPER(?) AND UPPER(last_name) = UPPER(?) AND UPPER(email) = UPPER(?)', [first_name, last_name, email], (error, results) =>{
            if(error){
                console.log("message : erreur")
                return -1
            }
            else if (results.length > 0){
                console.log("Results:")
                console.log(results);
                console.log("message : Utilisateur présent dans la base de donnée")
                return 0
            }
            else {
                console.log("results : ")
                console.log(results);
                console.log("message : L'utilisateur n'est pas présent dans la base de donnée")
                return 1
            }
        }
    )
}

exports.verify_space = function(first_name,last_name,email){
    // pool_SQL.query(
    //     'SELECT * FROM users WHERE UPPER(first_name) = UPPER(?) AND UPPER(last_name) = UPPER(?) AND UPPER(email) = UPPER(?)', first_name, last_name, email, (error, results) =>{
    first_name.replace(/^ *| *$|(  +)/g, '')        
    last_name.replace(/^ *| *$|(  +)/g, '')        
    email.replace(/^ *| *$|(  +)/g, '')          
}

exports.verify_existFile = function(){
    pool_SQL.query(
        'SELECT * FROM Files', (error, results) => {
            if(error){
                console.log("message : erreur")
                return -1
            }
            else if (results.length > 0){
                console.log("Results:")
                console.log(results);
                console.log("message : La table Files n'est pas vide")
                return 0
            }
            else {
                console.log(results);
                console.log("message : La table Files est vide")
                return 1
            }
        }
    )
}

exports.connectionUsersFiles = function (){
    pool_SQL.query(
        'SELECT * FROM have_acces h INNER JOIN Users u ON u.UsersID = h.UsersID INNER JOIN Files f ON f.FilesID = h.FilesID', (error, results) => {
            if(error){
                console.log("message : erreur")
                return -1
            }
            else{
                console.log("Succes")
                return 1
            }
        }
    )
}