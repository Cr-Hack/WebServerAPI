module.exports = function(mysql) {
    mysql.query(
        `CREATE TABLE if not exists users(
            userID INT NOT NULL AUTO_INCREMENT,
            firstname VARCHAR(50) NOT NULL,
            lastname VARCHAR(50) NOT NULL,
            email VARCHAR(250) NOT NULL,
            hashed_pass VARCHAR(4000) NOT NULL,
            privatekey TEXT NOT NULL,
            publickey TEXT NOT NULL,
            iv TEXT NOT NULL,
            salt TEXT NOT NULL,
            PRIMARY KEY(userID) 
         );`,
        function(err, result) {
            if (err) throw err;
            if (result.warningCount == 0) console.log("Table users created!");
        }
    )

    mysql.query(
        `CREATE TABLE if not exists files(
            fileID INT NOT NULL AUTO_INCREMENT,
            part_number INT NOT NULL,
            total_parts INT NOT NULL,
            name VARCHAR(250) NOT NULL,
            path VARCHAR(250) NOT NULL,
            type VARCHAR(250) NOT NULL,
            size DECIMAL(15,2) NOT NULL,
            datedeposite DATETIME NOT NULL,
            PRIMARY KEY(fileID, part_number)
         );`,
        function(err, result) {
            if (err) throw err;
            if (result.warningCount == 0) console.log("Table files created!");
        }
    )
    mysql.query(
        `CREATE TABLE if not exists have_access(
            userID INT NOT NULL,
            fileID INT NOT NULL,
            part_number INT NOT NULL,
            sender VARCHAR(250) NOT NULL,
            aeskey TEXT NOT NULL,
            iv TEXT NOT NULL,
            PRIMARY KEY(userID, fileID, part_number),
            FOREIGN KEY(userID) REFERENCES users(userID),
            FOREIGN KEY(fileID, part_number) REFERENCES files(fileID, part_number) ON DELETE CASCADE
         );`,
        function(err, result) {
            if (err) throw err;
            if (result.warningCount == 0) console.log("Table have_access created!");
        }
    )
}