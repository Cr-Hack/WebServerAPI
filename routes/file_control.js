const { verify_existFile, connectionUsersFiles } = require("../utils/security")

exports.view = function (req, res){
    if (connectionUsersFiles() == -1){
        if (error) {
            console.log(error)
            console.log("Pas de fichier rattacher à l'utilisateur")
            res.status(500).send({message: erreur})
    }
    else if (connectionUsersFiles () == 1){
        if (verify_existFile() == -1){
            res.status(500).send({
                error : "Server fail"
            })
        }
        else if (verify_existFile() == 1 ){
            res.status(404).send({
                error : "La table est vide"
            })
        }
        else if (verify_existFile() == 0){
            pool_SQL.query(
                'SELECT f.name, f.path, f.type, f.size, f.datedeposite FROM have_acces h INNER JOIN Users u ON u.UsersID = h.UsersID INNER JOIN Files f ON f.FilesID = h.FilesID', req.name, req.path, req.type, req.size, req.datedeposite ,
                 (error, results) => {
                     if (error) {
                         console.log(error)
                         res.status(500).send({message: erreur})
                     } else {
                         console.log('-->results')
                         console.log(results)
                         res.json({message : "Voici la table files"})
                        }
                    }
                )
            }
        }
    }
}

exports.delete = function (req, res){
    if (connectionUsersFiles() == -1){
        if (error) {
            console.log(error)
            console.log("Pas de fichier rattacher à l'utilisateur")
            res.status(500).send({message: erreur})
    }
    else if (connectionUsersFiles () == 1){
        if (verify_existFile() == -1){
            res.status(500).send({
                error : "Server fail"
            })
        }
        else if (verify_existFile() == 1 ){
            res.status(404).send({
                error : "La table est vide"
            })
        }
        else if (verify_existFile() == 0){
            pool_SQL.query(
                'DELETE Files f FROM have_acces h INNER JOIN Users u ON u.UsersID = h.UsersID INNER JOIN Files f ON f.FilesID = h.FilesID', 
                 (error, results) => {
                     if (error) {
                         console.log(error)
                         res.status(500).send({message: erreur})
                     } else {
                         console.log('-->results')
                         console.log(results)
                         res.json({message : "Le fichier est supprimé"})
                        }
                    }
                )
            }
        }
    }
}
