class Email {


    constructor(from = '', to='', subject='', message='', endpoint=''){

        this.from = from,
        this.to = to,
        this.subject = subject,
        this.message = message,
        this.endpoint = endpoint
    }


}

exports.Email = Email