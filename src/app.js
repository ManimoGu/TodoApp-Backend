const express = require("express");
const { API_URL } = require("./config/api");

const { user } = require("./models/user");


const { register, verify, resend, resetPass, login, forgot } = require("./API/user");
const cors = require("cors");
const bodyparser = require("body-parser")


//create our app
const app = express();

//enable Listening http server

app.listen("9000", (req, resp) => {
  console.log("Server is runing on port 9000...");
});

app.use(bodyparser.urlencoded({extended : true}))
//looks at requests where the content-type : application-json (header)
app.use(bodyparser.json())

app.use(cors())

//user api

/*app.get(API_URL.user, (httpReq,httpResp)=>{

    DB.query("SELECT * FROM Users", (err,resQ)=>{

        if(err) throw err
        else{

            console.log(resQ);
            httpResp.send("users Fetched...");
        }


    })


})*/

app.get(`${API_URL.user}/:userid/todos`, (httpReq, httpResp) => {
  let userId = httpReq.params.userid;

  let query = `SELECT * FROM TodoApp WHERE user = ${userId}`;
  let query_us = `SELECT ID FROM Users WHERE ID = ${userId}`;

  DB.query(query_us, (err, res) => {
    if (err) throw err;
    else {
      if (res.length === 0) {
        httpResp.send("User not Found");
      } else {
        DB.query(query, (err, res) => {
          if (err) throw err;
          else {
            if (res.length === 0) {
              httpResp.send("user doen't have any task yet");
            } else {
              console.log(res);
              httpResp.send("todos fetched");
            }
          }
        });
      }
    }
  });

  //const newLocal = "/api/auth/register";
  //user api for register


  /*DB.query(query, (err,resQ)=>{

        if(err) throw err
        else{

            console.log(resQ);
            httpResp.send("Todos Fetched...");
        }


    })*/
});

  app.post("/api/auth/register", register)

  // Email verification api

  app.get("/api/verify-email/:email/code/:token", verify)

  app.get("/api/resend/:email/code/:token", resend)

  app.post("/api/fogot_password/:email",forgot)

  app.post("/api/resetpassword/:email/code/:token",resetPass)
  
// login 
app.post("/api/Login/:email/pass/:password", login)