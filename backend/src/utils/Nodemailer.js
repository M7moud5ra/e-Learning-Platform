// Email functionality disabled - server not deployed yet
// import nodemailer from "nodemailer"

// Sendmail function disabled - email verification removed
export const Sendmail = async function (email, subject, message) {
  // Email sending functionality disabled
  console.log("Email sending disabled - would have sent:", { email, subject });
  return {
    success: false,
    message: "Email functionality disabled - server not deployed yet",
  };
};

/*
// Original email configuration (commented out)
const transporter = nodemailer.createTransporter({
  host:'smtp.gmail.com',
  secure: true,
  port:465,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

const receiver={
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: subject,
    html: message
}

try {
    const info = await transporter.sendMail(receiver);
    console.log('email sent:', info.response);
    return { success: true, message: 'Email sent successfully' };
} catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Error sending email' };
}
*/

//}
