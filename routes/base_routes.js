module.exports = function(app) {
    //let controller = require('../controllers/controller');

    // test server
    app.get("/", (req, res) => {
        req.pool_SQL.query('SHOW TABLES;', function(error, results, fields) {
            if (error) {
                console.log(error);
                res.status(500).send("Error when connecting to database.");
            } else {
                res.status(200).send({
                    result: results,
                    fields: fields
                });
            }
        });
        //res.json({ message: "Server lives!!!" });
    });

    app.post("/auth/register", (req, res) =>{
        if (verify_injection(req.last_name) ||
        verify_injection(req.first_name) ||
        verify_injection(req.email) ||
        verify_injection(req.hashpassword) ||
        verify_length(req.last_name, 50) ||
        verify_length(req.first_name, 50) ||
        verify_length(req.email, 250) ||
        verify_length(req.hashpassword, 4000) ||
        verify_email(req.email) ){
            res.status(400).send({
                error: "Incorrect request input"
            })
        }
        else if (){ 
            //verifier que sa exst sinon erreur

        }
        //sinon 
        //on créer => on appelle bcrypt pour le password
    })
    // Other Routes

    function verify_injection(value) {
        var result = value.match(/(\s*([\0\b\'\"\n\r\t\%\_\\]*\s*(((select\s*.+\s*from\s*.+)|(insert\s*.+\s*into\s*.+)|(update\s*.+\s*set\s*.+)|(delete\s*.+\s*from\s*.+)|(drop\s*.+)|(truncate\s*.+)|(alter\s*.+)|(exec\s*.+)|(\s*(all|any|not|and|between|in|like|or|some|contains|containsall|containskey)\s*.+[\=\>\<=\!\~]+.+)|(let\s+.+[\=]\s*.*)|(begin\s*.*\s*end)|(\s*[\/\*]+\s*.*\s*[\*\/]+)|(\s*(\-\-)\s*.*\s+)|(\s*(contains|containsall|containskey)\s+.*)))(\s*[\;]\s*)*)+)/g)
        return result != null
    }

    function verify_length(value, max, min = 1){
        return value.length >= min && value.length <= max
    }

    function verify_email(value){
        var result = value.match(/^(?!\.)[\w_.-]*[^.]@\w+\.\w+(\.\w+)?[^.\W]$/g)
        return result != null && result.length == 1 && result[0] == value
    }

    //verifier que ce compte n'existe pas déjà (a partir du prénom, nom, email)
    //Passer outre les majuscules (en SQL = WHERE UPPER (COL_NAME) = UPPER(Input))
    // /^ *| *$|(  +)/gm => replace les matches str.replace (/^ *| *$|(  +)/g, '')

};