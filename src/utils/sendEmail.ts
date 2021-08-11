import nodemailer from "nodemailer"

export async function sendEmail(to: string, body: string) {
    
    // NodeMailer test account (after try to switch to google)
    let testAccount = await nodemailer.createTestAccount()

    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 456, false for other ports
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    })

    let info = await transporter.sendMail({
        from: '"Fred foo" <foo@example.com>', // sender address
        to: to,
        subject: "Change Password",
        //text: body,
        html: body
    })

    console.log("Message sent %s", info.messageId)
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
}