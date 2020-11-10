const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlTotext = require('html-to-text');


module.exports = class Email {
    constructor(user, url){
        this.to = user.email;
        this.firstName = user.name.split('')[0]
        this.url = url
        this.from = `${process.env.EMAIL_FROM}`
    }

    newTransport(){
        if(process.env.NODE_ENV === 'production'){

            return nodemailer.createTransport({
                service : 'SendGrid',
                auth : {
                    user : process.env.SENDGRID_USERNAME,
                    pass : process.env.SENDGRID_PASSWORD,
                }
            })
        }


        return nodemailer.createTransport({
            service : 'SendGrid',
            auth : {
                user : process.env.SENDGRID_USERNAME,
                pass : process.env.SENDGRID_PASSWORD,
            }
        })

        // development settings
        // return nodemailer.createTransport({
        //     host: process.env.EMAIL_HOST,
        //     port: process.env.EMAIL_PORT,
        //     auth: {
        //         user: process.env.EMAIL_USERNAME,
        //         pass: process.env.EMAIL_PASSWORD
        //     },
        // })
    }

    //send the actual email
    async send(template, subject) {
        //1. Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName : this.firstName,
            url : this.url,
            subject
        })

        //2. define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlTotext.fromString(html)
        }

        //3. create a transport and send email
        await this.newTransport().sendMail(mailOptions)
    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to the Natours Family')
    }

    async sendPasswordReset(){
        await this.send('passwordReset', 'Your password reset token. Valid for only 10mins')
    }

}

const sendEmail = async options => {

    //2. Define the email options
    const mailOptions = {
        from: 'Lystun  <lystun@test.me>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    //3. Send the mail
    await transport.sendMail(mailOptions)
};


// module.exports = sendEmail