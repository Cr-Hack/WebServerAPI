exports.register = function (req, res){
    if (verify_injection(req.last_name) ||
    verify_injection(req.first_name) ||
    verify_injection(req.email) ||
    verify_injection(req.hashpassword) ||
    verify_length(req.last_name, 50) ||
    verify_length(req.first_name, 50) ||
    verify_length(req.email, 250) ||
    verify_length(req.hashpassword, 4000) ||
    verify_email(req.email) ||
    verify_existAccount(req.email) == true){
        res.status(400).send({
            error: "Incorrect request input"
        })
    }
    else if (verify_existAccount(req.first_name, req.last_name, req.email) == -1){
        res.status(500).send({
            error : "Server fail"
        })
    }
    else if (verify_existAccount(req.first_name, req.last_name, req.email) == 0){
        res.status(409).send({
            error : "Le compte existe déjà"
        })
    }
    else if (verify_existAccount(req.first_name, req.last_name, req.email) == 1){ 
        pool_SQL.query(
            'INSERT INTO users SET ?', req.first_name, req.last_name,req.email,req.bcrypt.cryptPassword,
             (error, results) => {
                 if (error) {
                     console.log(error)
                     res.status(500).send({message: erreur})
                 } else {
                     console.log('-->results')
                     console.log(results)
                     res.json({message : "Utilisateur enregistré"})
                 }
             }           
        )
    }
}