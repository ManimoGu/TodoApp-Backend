
const mysql = require("mysql");

//create mysql connection
const CNX = mysql.createConnection({
       
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'Todo'

})

//connect to dababase
CNX.connect((err,res)=>{

if(err) throw err
console.log("my sql is runing")

})

exports.DB = CNX;