
const { user } = require("../models/user");
const { DB } = require("../config/mysql");
const randomstring = require("randomstring");
const { mailgun } = require("../config/mail");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const {sqlQuery }= require("../helper/Promesse")
const {validation} = require("../helper/validation")
const {Email} = require("../models/Email");
const { SendEmail } = require("../helper/Email");


      exports.register = async (req, resp) => {

        //fetch data
        let newuser = new user(
          req.body.firstname,
          req.body.lastname,
          req.body.email,
                req.body.password,
        );

        //validation des données
       
        if(validation(newuser)) resp.status(403).json({message : validation(newuser)})

        else {
    
         try{
    
         let res = await sqlQuery(`SELECT *  FROM Users WHERE EMAIL = '${newuser.email}'`)
          console.log(res)
    
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

              let userInfo = new Email(

                'imane@support.com',
                newuser.email,
                "email verification ✔",
                `<h1>thanks for your registration</h1>
                Click the link below to verify your email
                <a href=${endpoint}>Verify</a>
                the link will be expired after 24 hours 
                `,
                endpoint

              )

              //insert user 
               
              let result = await bcrypt.hash(newuser.password, 10 )
                newuser.password = result;

                
                let query = `INSERT INTO Users Set ?`
    
                  if(sqlQuery(query, newuser)) SendEmail(userInfo)      
              
            }else{
             
              if(res[0].ISVERIFIED){
    
                resp.status(201).json({message :"<h1>username already exists</h1>"})
    
              }else{
    
                resp.status(201).json({message :"<h1>You should verify your account, an mail was sent to your email adress</h1>"})
              }          
    
            }
    
         }catch(err){

          console.log(err.message)


         }
        }
         
        }
    
     exports.verify = async (Req, Resp)=>{

    
        let email = Req.params.email;
        let Token = Req.params.token;
   
        let res = await sqlQuery(`SELECT  EXPIRATION_DATE FROM Users WHERE EMAIL ='${email}' and TOKEN='${Token}' `)
   
         if(res.length === 0){
   
           Resp.status(201).json({message :"Token or Email are unvalid"})
   
         }else{
   
           if(Date.now()> res[0].EXPIRATION_DATE){

            let link = `http://localhost:9000/api/resend/${email}/code/${Token}`
             
            Resp.send(`
                 
                 <h1>This link has already expired</h1>
                 <h5>Click on <a href= ${link}> resend </a>to get a valid link </h5>       
                 `)     
   
           }else{
           
              let rest = await sqlQuery(`UPDATE Users SET ISVERIFIED = "1" , TOKEN = "" WHERE EMAIL ='${email}'`)
               
               
                 Resp.send(`
                 
                 <h1>You account has been verified</h1>
                 <a href= "http://localhost:3000/Login">Login in</a>
                 
                 `)     
   
           }
         }
       
   
        
    
   
     }

     exports.resend = async (Req, Resp)=>{

        let email = Req.params.email;
        let Token = Req.params.token;

        let res = await sqlQuery(`SELECT  EXPIRATION_DATE FROM Users WHERE EMAIL ='${email}' and TOKEN='${Token}' `)
            if(res.length === 0){
                
               Resp.send("<h1>The email doesn't exists</h1>")


              }else{
               

      let date = new Date (Date.now() + 24 *60 *60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

   
           //create de endpoint of the api 
         let endpoint = `http://localhost:9000/api/resend/${email}/code/${Token}`

         //send the mail


         let userInfo = new Email(

          'imane@support.com',
          email,
          "email verification ✔",
          `<h1>thanks for your registration</h1>
          Click the link below to verify your email
          <a href=${endpoint}>Verify</a>
          the link will be expired after 24 hours 
          `,
          endpoint

        )

                        
        if(sqlQuery(`UPDATE Users SET  EXPIRATION_DATE = '${date}' WHERE EMAIL ='${email}'`)){
          
          SendEmail(userInfo)
         
          Resp.send("<h1> Check your email to verify your account </h1>")
        
              }
        
 
     }   
    }

     exports.forgot = async (Req, Resp)=>{

        let email = Req.params.email

        let res = await sqlQuery(`SELECT ISVERIFIED FROM Users WHERE EMAIL ='${email}'`)
     
           if(res.length === 0){
    
               Resp.status(201).json({message :"Email not found"})
     
           }else {
           
             if(!res[0].ISVERIFIED){
    
               Resp.status(201).json({message :"You account is not verified"})
             }
            
     
             else{
     
              let date = new Date (Date.now() + 24 *60 *60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
               let token = randomstring.generate();
                
                //create de endpoint of the api 
               let endpoint = `http://localhost:3000/ResetPass/${email}/code/${token}`
     
               //send the mail
     
       let userinfo = new Email(
                 ' <support.imane@gmail.com>', 
                 email,
                 "Reset your password ✔",
                 `<h1>You requested to reset your password</h1>
                 Click the link below to change the password
                (<a href=${endpoint}>reset password</a>)
                 the link will be expired after 24 hours 
                 `, 
                 endpoint

       )

         
       if(sqlQuery(` UPDATE Users SET TOKEN = '${token}', EXPIRATION_DATE = '${date}'  WHERE EMAIL ='${email}'`)){

         SendEmail(userinfo)

         Resp.send(`
                 
                 <h1> Please check your email  </h1>
                 
                 `) 
             }
     
     
           }

          }
     }

     exports.resetPass = async(Req, Resp)=>{

        let email = Req.params.email;
        let Token = Req.params.token;

        let pass = Req.body

        console.log(pass)
    
        let res = await sqlQuery(`SELECT  EXPIRATION_DATE FROM Users WHERE EMAIL ='${email}' and TOKEN='${Token}' `)
     
              if(res.length === 0){
  
                Resp.status(201).json({message :"Invalid Token"})
                
              }else{
    
                if(res[0].EXPIRATION_DATE< Date.now()){
    
                  Resp.send(`
                 
                  <h1>This link has already expired</h1>
                  <h5>Click on <a href=""> resend </a>to get a valid link </h5>       
                  `)     
    
                }else {

                  let result = await bcrypt.hash(pass.password, 10)

                if (sqlQuery(`UPDATE Users SET PASSWORD = '${result}' WHERE EMAIL ='${email}'`))
               
                Resp.send(`
                 
                <h1> Password changed successfully </h1>
                <a href= "http://localhost:3000/Login">Login in to your account</a>
                
                `)     

    
              }
    
              }
    
    
            
    
    
        
    
    
    
    
    }

    exports.login = async (Req, Resp)=>{

let email = Req.params.email;
let pass = Req.params.password;

let res = await sqlQuery(` Select * from Users where EMAIL = '${email}'`)

  if(res.length === 0){

    Resp.status(201).json({message :"Invalid Email"})

  }else{

   bcrypt.compare(pass,res[0].PASSWORD, (err, result)=>{
     console.log(result)

    if(!result)
   Resp.status(201).json({message :"Incorrect password"})
    else{
    
      Resp.status(201).json({message :"You are loged in"})
    }

   })
  

  }

     }
