const { verify_existFile, connectionUsersFiles } = require("../utils/security")

exports.view = function (req, res){
    connectionUsersFiles(req.pool_SQL, req.user, 
    (exists) => {
        if (exists == -1){
            if (error) {
                console.log(error)
                console.log("Pas de fichier rattacher à l'utilisateur")
                res.status(500).send({message: erreur})
            }
        }
        else if (exists == 1){    
            pool_SQL.query(
                'SELECT f.name, f.path, f.type, f.size, f.datedeposite FROM have_acces h INNER JOIN Users u ON u.UsersID = h.UsersID INNER JOIN Files f ON f.FilesID = h.FilesID where userID = ?', [user.userID],
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
    )
}

exports.delete = function (req, res){
    pool_SQL.query(
        'DELETE files f FROM have_acces h INNER JOIN users u ON u.userID = h.userID INNER JOIN files f ON f.fileID = h.fileID where fileID = ?', [file.fileID],
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

