class user {

    constructor(fisrtname="", lastname="", email="", password="", avattar="", token="" , expiration_date= new Date(), isverified = false, id = null){
      
        this.id = id;
        this.firstname = fisrtname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.avattar =avattar;
         this.token = token;
        this.expiration_date = expiration_date;
       
        this.isverified = isverified;
        
    
    }
}

exports.user =user;