const {createTransport} = require('nodemailer');

const transporter = createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: 'kejsiegro@gmail.com',
    pass: 'xsmtpsib-e6f042551cfd9ace4c333110f4a2402c34406da1317f1853bdc762cffc0a2d34-tS684EFzRqrOXsAQ',
  },
  debug: true,
});

const sendEmail = async (req, res) => {
  const {
    email,
    lastname,
    type,
    code,
    currency,
    items,
    total,
    subject,
    message,
  } = req.body;
  try {
    let emailSubject, htmlContent;
    switch (type) {
      case 'verification':
        emailSubject = 'Welcome to Our Application!';
        htmlContent = `
          <html>
            <head>
              <style>
     body {
        font-family: 'Arial', sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #6a1b9a;
        padding: 30px;
        text-align: center;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 28px;
        font-weight: bold;
      }
      .content {
        padding: 30px;
      }
      h2 {
        color: #6a1b9a;
        margin-top: 0;
      }
      p {
        color: #333333;
        line-height: 1.6;
      }
      .button {
        display: inline-block;
        background-color: #6a1b9a;
        color: #ffffff;
        text-decoration: none;
        padding: 12px 25px;
        border-radius: 5px;
        font-weight: bold;
        margin-top: 20px;
      }
      .footer {
        background-color: #f0f0f0;
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #666666;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 12px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
        font-weight: bold;
        color: #6a1b9a;
      }
    </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Wizard Planner</h1>
                </div>
                <div class="content">
                  <h2>Welcome to Wizard Planner, ${lastname}!</h2>
                  <p>Thank you for joining us. Your account has been successfully created.</p>
                  <p>We're excited to have you on board. Feel free to explore our application and discover all the magical features we offer.</p>
                  <p>If you have any questions or need assistance, don't hesitate to contact our support wizards.</p>
                </div>
                <div class="footer">
                  &copy; 2024 Wizard Planner. All rights reserved.
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case 'resetPassword':
        emailSubject = 'Reset Your Password';
        htmlContent = `
          <html>
            <head>
               <style>
     body {
        font-family: 'Arial', sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #6a1b9a;
        padding: 30px;
        text-align: center;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 28px;
        font-weight: bold;
      }
      .content {
        padding: 30px;
      }
      h2 {
        color: #6a1b9a;
        margin-top: 0;
      }
      p {
        color: #333333;
        line-height: 1.6;
      }
      .footer {
        background-color: #f0f0f0;
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #666666;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 12px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
        font-weight: bold;
        color: #6a1b9a;
      }
    </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Wizard Planner</h1>
                </div>
                <div class="content">
                  <h2>Password Reset Request</h2>
                  <p>We received a request to reset your password. If you did not make this request, please ignore this email.</p>
                  <p>To reset your password, please click the following magical link:</p>
                  <a href="${process.env.FRONT}/auth/resetPassword?code=${code}&email=${email}" style="display: inline-block; background-color: #6a1b9a; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; margin-top: 20px;">Reset Password</a>
                  <p>This enchanted link will expire in 1 hour for security reasons.</p>
                </div>
                <div class="footer">
                  &copy; 2024 Wizard Planner. All rights reserved.
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case 'invoice':
        emailSubject = 'Payment Invoice for Your Purchase';
        htmlContent = `
          <html>
            <head>
               <style>
     body {
        font-family: 'Arial', sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #6a1b9a;
        padding: 30px;
        text-align: center;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 28px;
        font-weight: bold;
      }
      .content {
        padding: 30px;
      }
      h2 {
        color: #6a1b9a;
        margin-top: 0;
      }
      p {
        color: #333333;
        line-height: 1.6;
      }
      .button {
        display: inline-block;
        background-color: #6a1b9a;
        color: #ffffff;
        text-decoration: none;
        padding: 12px 25px;
        border-radius: 5px;
        font-weight: bold;
        margin-top: 20px;
      }
      .footer {
        background-color: #f0f0f0;
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #666666;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 12px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
        font-weight: bold;
        color: #6a1b9a;
      }
    </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Wizard Planner</h1>
                </div>
                <div class="content">
                  <h2>Payment Invoice for Your Magical Purchase</h2>
                  <p>Dear ${lastname},</p>
                  <p>Thank you for your purchase. Here are the magical details of your invoice:</p>
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit Price (${currency})</th>
                        <th>Total (${currency})</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${items
                        .map(
                          item => `
                        <tr>
                          <td>${item.name}</td>
                          <td>${item.quantity}</td>
                          <td>${(parseInt(item.price) / 100).toFixed(2)}</td>
                          <td>${((parseInt(item.price) * item.quantity) / 100).toFixed(2)}</td>
                        </tr>
                      `,
                        )
                        .join('')}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="3"><strong>Total:</strong></td>
                        <td><strong>${total}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                  <p>Thank you for your payment. May your planning be ever magical!</p>
                </div>
                <div class="footer">
                  &copy; 2024 Wizard Planner. All rights reserved.
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case 'contactConfirmation':
        emailSubject = 'We received your message';
        htmlContent = `
          <html>
            <head>
               <style>
     body {
        font-family: 'Arial', sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #6a1b9a;
        padding: 30px;
        text-align: center;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 28px;
        font-weight: bold;
      }
      .content {
        padding: 30px;
      }
      h2 {
        color: #6a1b9a;
        margin-top: 0;
      }
      p {
        color: #333333;
        line-height: 1.6;
      }
      .button {
        display: inline-block;
        background-color: #6a1b9a;
        color: #ffffff;
        text-decoration: none;
        padding: 12px 25px;
        border-radius: 5px;
        font-weight: bold;
        margin-top: 20px;
      }
      .footer {
        background-color: #f0f0f0;
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #666666;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 12px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
        font-weight: bold;
        color: #6a1b9a;
      }
    </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Wizard Planner</h1>
                </div>
                <div class="content">
                  <h2>Thank you for contacting us!</h2>
                  <p>Hello,</p>
                  <p>We have received your message regarding "${subject}". Our team will review it and get back to you as soon as possible.</p>
                  <p>Thank you for your patience and for using Wizard Planner!</p>
                </div>
                <div class="footer">
                  &copy; 2024 Wizard Planner. All rights reserved.
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case 'newContactNotification': {
        emailSubject = 'New Contact Form Submission';
        htmlContent = `
          <html>
            <head>
              <style>
     body {
        font-family: 'Arial', sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #6a1b9a;
        padding: 30px;
        text-align: center;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 28px;
        font-weight: bold;
      }
      .content {
        padding: 30px;
      }
      h2 {
        color: #6a1b9a;
        margin-top: 0;
      }
      p {
        color: #333333;
        line-height: 1.6;
      }
      .button {
        display: inline-block;
        background-color: #6a1b9a;
        color: #ffffff;
        text-decoration: none;
        padding: 12px 25px;
        border-radius: 5px;
        font-weight: bold;
        margin-top: 20px;
      }
      .footer {
        background-color: #f0f0f0;
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #666666;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 12px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
        font-weight: bold;
        color: #6a1b9a;
      }
    </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Wizard Planner</h1>
                </div>
                <div class="content">
                  <h2>New Contact Form Submission</h2>
                  <p><strong>From:</strong> ${email}</p>
                  <p><strong>Subject:</strong> ${subject}</p>
                  <p><strong>Message:</strong></p>
                  <p>${message}</p>
                </div>
                <div class="footer">
                  &copy; 2024 Wizard Planner. All rights reserved.
                </div>
              </div>
            </body>
          </html>
        `;

        const adminMailOptions = {
          from: email,
          to: 'kejsiegro@gmail.com',
          subject: 'New Contact Form Submission',
          html: htmlContent,
        };

        await transporter.sendMail(adminMailOptions);
        break;
      }

      default:
        throw new Error('Invalid email type');
    }

    const userMailOptions = {
      from: 'kejsiegro@gmail.com',
      to: email,
      subject: emailSubject,
      html: htmlContent,
    };

    await transporter.sendMail(userMailOptions);

    res.status(200).send('Email sent successfully');
  } catch (error) {
    res.status(500).send('Failed to send email');
    return {status: 500, message: 'Failed to send email'};
  }
};

module.exports = {
  sendEmail,
};
