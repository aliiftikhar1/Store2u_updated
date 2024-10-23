import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
 const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.NODE_ENV !== 'development',
    auth:{
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    },
 } as SMTPTransport.Options)
 
 type SendEmailDto = {
    sender: Mail.Address,
    receipients: Mail.Address[],
    subject: String;
    message: String;
 }
 export const sendEmail = async (dto : SendEmailDto) => {
    const {sender, receipients, subject, message} = dto;
    return await transport.sendMail({
        from: sender, 
        to: receipients,
        subject,
        html: message,
        text: message,
    })
 }