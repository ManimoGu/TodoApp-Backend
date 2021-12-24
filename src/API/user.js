
const { user } = require("../models/user");
const { DB } = require("../config/mysql");
const randomstring = require("randomstring");
const { mailgun } = require("../config/mail");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");


      exports.register = (req, resp) => {

        
        //fetch data
        let newuser = new user(
          req.body.firstname,
          req.body.lastname,
          req.body.email,
                req.body.password,
        );
       
    
        //validation des données
    
        // FirstName
        if (newuser.firstname.length < 4 || newuser.firstname.length > 20) {
          resp.status(403).json({message :"<h1>firstname should contain from 4 to 20 caracters</h1>"});
          return;
        }
    
        //LastName
        if (newuser.lastname.length < 4 || newuser.lastname.length > 20) {
          resp.status(403).json({message :"<h1>lastname should contain from 4 to 20 caracters</h1>"});
          return;
        }
    
        //PassWord
        let pattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,12}$/
    
        if (
          pattern.test(newuser.password) === false
          
        ) {
            
          resp.status(403).json({message :"<h1>The password should contain minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character</h1>"});
          return;
        }
    
        //Username Email
        let pattern_email = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
    
    
       if (
          pattern_email.test(newuser.email) === false
          
        ) {
            
          resp.status(403).json({message :"<h1>Email Should be like : Example@Example.com</h1>"});
          return;
        }
    
    
        // Avatar
        /*if (
          newuser.avattar.startsWith("https://") === false
          
        ) {
            
          resp.send("<h1>The avatar should be a secure link</h1>");
          return;
        }*/
    
    
         DB.query(`SELECT *  FROM Users WHERE EMAIL = '${newuser.email}'`, (err,res)=>{
    
          if (err) throw err
          else {
    
           if(res.length === 0){
    
              newuser.isverified = false;
              newuser.expiration_date = new Date(Date.now() + 24*60*60*1000)
              newuser.token = randomstring.generate({
    
                length : 4,
                charset : 'numeric'
    
              })
    
              //create de endpoint of the api 
              let endpoint = `http://localhost:9000/api/verify-email/${newuser.email}/code/${newuser.token}`
    
              //send the mail
    
              let transporter = nodemailer.createTransport({
                host: "smtp.mailgun.org",
                port: 587,
                secure : false, // true for 465, false for other ports
                auth: {
                  user: mailgun.usename, // generated ethereal user
                  pass: mailgun.password, // generated ethereal password
                },
              });
    
              let message = {
                from: ' <support.imane@gmail.com>', // sender address
                to: newuser.email, // list of receivers
                subject: "email verification ✔", // Subject line
                html: `<h1>thanks for your registration</h1>
                Click the link below to verify your email
                <a href=${endpoint}>Verify</a>
                the link will be expired after 24 hours 
                `// html body
                ,
                tls:{ 
                  rejectUnauthorized:false
                }
              };
    
              //send the email
    
              transporter.sendMail(message, (err,info)=>{
    
                if(err) console.log(err.message)
                else{
                  console.log(info)
                }
    
    
              })
    
              //insert user 
               
              bcrypt.hash(newuser.password, 10, (err , str)=>{
    
                newuser.password = str;
                console.log(newuser.password)
                
                let query = `INSERT INTO Users Set ?`
    
              DB.query(query, newuser, (err,res)=>{
    
    
                if(err) throw err
                else{
    
                  resp.send("user added succesfully");
                }
    
    
              })
    
                        })
          
              
            }else{
    
              if(res[0].isverified){
    
                resp.status(201).json({message :"<h1>username already exists</h1>"})
    
              }else{
    
                resp.status(201).json({message :"<h1>You should verify your account, an mail was sent to your email adress</h1>"})
              }          
    
            }
    
          }
    
         })
        
        //console.log("add user to database");
    
      }

     exports.verify = (Req, Resp)=>{

       const front = () =>{

         Axios.get('http://localhost:3000/api/login')
        .then(data=>console.log(data))
        .catch(err=>console.log(err))


       }

        let email = Req.params.email;
        let Token = Req.params.token;
   
        DB.query(`SELECT  EXPIRATION_DATE FROM Users WHERE EMAIL ='${email}' and TOKEN=${Token} `,(err, res)=>{
   
         if(err) throw err
         else{
      
         if(res.length === 0){
   
           Req.send("Token or Email are unvalid");
           console.log("Token or Email are unvalid");
   
         }else{
   
           if(Date.now()> res[0].EXPIRATION_DATE){
             
             Resp.send("Token has already expired");
   
   
           }else{
           
              DB.query(`UPDATE Users SET ISVERIFIED = "1" , TOKEN = "" WHERE EMAIL ='${email}'`, (err, res)=>{
               
               if(err) throw err
               else{
   
                 Resp.send(`
                 
                 <h1>You account has been verified</h1>
                 <button>Login in</button>
                 
                 `)
               }
   
   
              })
              
   
           }
         }
       }
   
        })
    
   
     }

     exports.resend = (Req, Resp)=>{

        let email = Req.params.email;
        let Token = Req.params.token;

        DB.query(`SELECT  EXPIRATION_DATE FROM Users WHERE EMAIL ='${email}' and TOKEN='${Token}' `,(err, res)=>{

           if(err) throw err
           else{

              if(res.length === 0){
                
               Resp.send("<h1>The email doesn't exists</h1>")


              }else{
               

               let date = new Date (Date.now() + 24 *60 *60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
               
        
    
               
                  
       DB.query(`UPDATE Users SET  EXPIRATION_DATE = '${date}' WHERE EMAIL ='${email}'`, (err, res)=>{
           
           if(err) throw err
           else{

             console.log("Expiration date updated")
           }


          })

           //create de endpoint of the api 
         let endpoint = `http://localhost:9000/api/resend/${email}/code/${Token}`

         //send the mail

         let transporter = nodemailer.createTransport({
           host: "smtp.mailgun.org",
           port: 587,
           secure : false, // true for 465, false for other ports
           auth: {
             user: mailgun.usename, // generated ethereal user
             pass: mailgun.password, // generated ethereal password
           },
            tls:{ 
             rejectUnauthorized:false
           }
         });

         let message = {
           from: ' <support.imane@gmail.com>', // sender address
           to: email, // list of receivers
           subject: "email verification ✔", // Subject line
           html: `<h1>thanks for your registration</h1>
           Click the link below to verify your email
           <a href=${endpoint}>Verify</a>
           the link will be expired after 24 hours 
           `// html body
           ,
          
         };

         //send the email

         transporter.sendMail(message, (err,info)=>{

           if(err) console.log(err.message)
           else{
             console.log(info)
           }


         })

              }
        }
 })
     }   

     exports.forgot = (Req, Resp)=>{

        let email = Req.params.email
        DB.query(`SELECT ISVERIFIED FROM Users WHERE EMAIL ='${email}'`,(err, res)=>{
     
         if(err) throw err
         else{
       
           if(res.length === 0){
     
               Resp.send("<h1>Email not found</h1>")
     
           }else {
           
             if(!res[0].ISVERIFIED){
     
               Resp.send("<h1>you should verify your account </h1>")
             }
     
             else{
     
               let date = Date.now() + 24 * 60 * 60 * 1000
               let token = randomstring.generate();
                  
               DB.query(`UPDATE Users SET TOKEN = ${token} EXPIRATION_DATE = ${date}   WHERE EMAIL =${email}`, (err, res)=>{
                 
                 if(err) throw err
                 else{
     
                   console.log("Data Updated")
                 }
     
     
                })
     
                //create de endpoint of the api 
               let endpoint = `http://localhost:9000/api/resetpassword/${email}/code/${token}`
     
               //send the mail
     
               let transporter = nodemailer.createTransport({
                 host: "smtp.mailgun.org",
                 port: 587,
                 secure : false, // true for 465, false for other ports
                 auth: {
                   user: mailgun.usename, // generated ethereal user
                   pass: mailgun.password, // generated ethereal password
                 },
                  tls:{ 
                   rejectUnauthorized:false
                 }
               });
     
               let message = {
                 from: ' <support.imane@gmail.com>', // sender address
                 to: newuser.email, // list of receivers
                 subject: "email verification ✔", // Subject line
                 html: `<h1>thanks for your registration</h1>
                 Click the link below to verify your email
                 <a href=${endpoint}>Verify</a>
                 the link will be expired after 24 hours 
                 `// html body
                 
                
               };
     
               //send the email
     
               transporter.sendMail(message, (err,info)=>{
     
                 if(err) console.log(err.message)
                 else{
                   console.log(info)
                 }
     
     
               })
     
     
     
     
             }
     
     
           }
     
         }
     
        })
     
     }

     exports.resetPass = (Req, Resp)=>{

        let email = Req.params.email;
        let Token = Req.params.token;
    
        DB.query(`SELECT  EXPIRATION_DATE FROM Users WHERE EMAIL =${email} and TOKEN=${Token} `,(err, res)=>{
    
            if(err) throw err
            else{
            
              if(res.length === 0){
    
                Resp.send("<h1>Invalid Token</h1>")
              }else{
    
                if(res[0].EXPIRATION_DATE< Date.now()){
    
                   Resp.send("<h1>Token has already expired</h1>")
    
                }else {
    
                DB.query(`UPDATE Users SET PASSWORD ='Newpass' WHERE EMAIL =${email}`, (err, res)=>{
                
                if(err) throw err
                else{
    
                  console.log("Data Updated")
                }
    
    
               })
    
                   Resp.send("Password changes successfully ")
    
    
    
    
                }
    
    
    
              }
    
    
            }
    
    
        })
    
    
    
    
    }

    exports.login = (Req, Resp)=>{

let email = Req.params.email;
let pass = Req.params.password;

DB.query(` Select * from Users where EMAIL = '${email}'`, (err,res)=>{

if (err) throw  err 
else{
 
  if(res.length === 0){

    Resp.send("<h1>Invalid Email</h1>")

  }else{

    let Bool = false;

    bcrypt.compare(pass,res[0].PASSWORD , function(err, result) {
    
      console.log(result)
        if(!result) Resp.send("<h1>incorrect password</h1>")
    else{
     
      Resp.send("<h1>You are loged in </h1>")


    }
      });
      

   

  }


}


})

     }
