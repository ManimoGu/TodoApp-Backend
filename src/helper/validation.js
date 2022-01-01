


 exports.validation = (element , resp) => {


     
        // FirstName
        if (element.firstname.length < 4 || element.firstname.length > 20) {
            return "<h1>firstname should contain from 4 to 20 caracters</h1>"
          }
      
          //LastName
          if (element.lastname.length < 4 || element.lastname.length > 20) {
            return "<h1>lastname should contain from 4 to 20 caracters</h1>"
            
          }
      
          //PassWord
          let pattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,12}$/
      
          if (
            pattern.test(element.password) === false
            
          ) {
              
            return "<h1>The password should contain minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character</h1>"
            
          }
      
          //Username Email
          let pattern_email = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
      
      
         if (
            pattern_email.test(element.email) === false
            
          ) {
              
                return "<h1>Email Should be like : Example@Example.com</h1>"
            
          }
      



}