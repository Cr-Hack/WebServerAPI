module.exports = function(mysql) {
   mysql.query( `CREATE TABLE if not exists Users(UserID INT NOT NULL AUTO_INCREMENT,firstname VARCHAR(50) NOT NULL,lastname VARCHAR(50) NOT NULL,email VARCHAR(250) NOT NULL,hashed_pass VARCHAR(4000) NOT NULL,privatekey VARCHAR(4500) NOT NULL,PRIMARY KEY(UserID) );`, 
      function (err, result) {
         if (err) throw err;
         console.log("Table Users created!");
      }
   )
    
   mysql.query( `CREATE TABLE if not exists Files(fileID INT NOT NULL AUTO_INCREMENT,name VARCHAR(250) NOT NULL,path VARCHAR(250) NOT NULL,type VARCHAR(50) NOT NULL,size DECIMAL(15,2) NOT NULL,datedeposite DATE NOT NULL,PRIMARY KEY(fileID));`, 
      function (err, result) {
         if (err) throw err;
         console.log("Table Files created!");
      }
   )
   mysql.query( `CREATE TABLE if not exists have_access(UserID INT,fileID INT,sender VARCHAR(250) NOT NULL,publickey VARCHAR(4500) NOT NULL,PRIMARY KEY(UserID, fileID),FOREIGN KEY(UserID) REFERENCES Users(UserID),FOREIGN KEY(fileID) REFERENCES Files(fileID));`, 
      function (err, result) {
         if (err) throw err;
         console.log("Table have_access created!");
      }
   ) 
}