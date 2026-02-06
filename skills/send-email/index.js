const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, text, html }) {
    // Check for credentials
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
        throw new Error("SMTP credentials not found. Please configure SMTP_USER and SMTP_PASS in .env file.");
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', // Default to Gmail for simplicity, can be configured
        auth: {
            user: user,
            pass: pass
        }
    });

    const mailOptions = {
        from: user,
        to,
        subject,
        text,
        html
    };

    const info = await transporter.sendMail(mailOptions);
    return `Email sent: ${info.messageId}`;
}

module.exports = sendEmail;

if (require.main === module) {
    // Test if run directly
    console.log("This is a module. Import it to use.");
}
