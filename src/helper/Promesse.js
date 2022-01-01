
const { DB } = require("../config/mysql");

exports.sqlQuery = (sql,insertedData=null) => new Promise((resolve, reject) => {

    //in case of insert query
    if(insertedData)
    DB.query(sql,insertedData,(err, res) => {
        if (err) reject(err)
        else { resolve(res) }
    })
    else
    DB.query(sql,(err, res) => {
        if (err) reject(err)
        else { resolve(res) }
    })
})
