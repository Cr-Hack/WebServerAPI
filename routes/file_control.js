const sec = require("../utils/security")

exports.view = function(req, res) {
    req.pool_SQL.query(
            'SELECT f.name, f.path, f.type, f.size, f.datedeposite FROM have_access h INNER JOIN users u ON u.userID = h.userID INNER JOIN files f ON f.fileID = h.fileID where u.userID = ?', [req.user.userID],
            (error, results) => {
                if (error) {
                    console.log(error)
                    res.status(500).send({ message: "Error when getting files from BDD." })
                } else {
                    if (results && results.length > 0) {
                        console.log('-->results')
                        console.log(results)
                        res.status(200).json({
                            message: "Voici la table files",
                            files: results
                        })
                    } else {
                        res.status(404).json({
                            message: "There is no file"
                        })
                    }
                }
            }
        )
        // connectionUsersFiles(req.pool_SQL, req.user,
        //     (exists) => {
        //         if (exists == -1) {
        //             if (error) {
        //                 console.log(error)
        //                 console.log("Pas de fichier rattacher à l'utilisateur")
        //                 res.status(500).send({ message: erreur })
        //             }
        //         } else if (exists == 1) {
        //             req.pool_SQL.query(
        //                 'SELECT f.name, f.path, f.type, f.size, f.datedeposite FROM have_acces h INNER JOIN users u ON u.userID = h.userID INNER JOIN files f ON f.fileID = h.fileID where u.userID = ?', [user.userID],
        //                 (error, results) => {
        //                     if (error) {
        //                         console.log(error)
        //                         res.status(500).send({ message: erreur })
        //                     } else {
        //                         console.log('-->results')
        //                         console.log(results)
        //                         res.json({ message: "Voici la table files" })
        //                     }
        //                 }
        //             )
        //         }
        //     }
        // )
}

exports.delete = function(req, res) {
    let body = req.body
    if (
        body.fileID == undefined ||
        sec.verify_injection(body.fileID)) {
        res.status(400).send({
            error: "Incorrect request input"
        })
    } else {
        req.pool_SQL.query(
            'delete f,h from files f inner join have_access h on h.fileID = f.fileID inner join users u on u.userID = h.userID where f.fileID = ?', [req.body.fileID],
            (error, results) => {
                if (error) {
                    console.log(error)
                    res.status(500).send({ message: error })
                } else {
                    if (results && results.affectedRows > 0) {
                        console.log('-->results')
                        console.log(results)
                        res.json({ message: "Le fichier est supprimé" })
                    } else {
                        console.log('-->results')
                        console.log(results)
                        res.json({ message: "Il n'y pas de fichier avec cet ID" })
                    }
                }
            }
        )
    }
}