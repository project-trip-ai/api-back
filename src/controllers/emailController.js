const {createTransport} = require('nodemailer');

const transporter = createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: 'kejsiegro@gmail.com',
    pass: 'xsmtpsib-e6f042551cfd9ace4c333110f4a2402c34406da1317f1853bdc762cffc0a2d34-IY1sQN24fBUp0TxC',
  },
});

const sendEmail = async (req, res) => {
  const {email, lastname, type, code, currency, items, total} = req.body;
  try {
    let subject, htmlContent;

    if (type === 'verification') {
      subject = 'Welcome to Our Application!';
      htmlContent = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #333333;
              }
              p {
                color: #666666;
                line-height: 1.6;
              }
              a {
                color: #007bff;
                text-decoration: none;
                cursor: pointer;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Welcome to Our Application, ${lastname}!</h1>
              <p>Thank you for joining us. Your account has been successfully created.</p>
              <p>We're excited to have you on board. Feel free to explore our application and discover all the features we offer.</p>
              <p>If you have any questions or need assistance, don't hesitate to contact our support team.</p>
              <p>Happy exploring!</p>
            </div>
          </body>
        </html>
      `;
    } else if (type === 'resetPassword') {
      subject = 'Reset Your Password';
      htmlContent = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #333333;
              }
              p {
                color: #666666;
                line-height: 1.6;
              }
              a {
                color: #007bff;
                text-decoration: none;
                cursor: pointer;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Password Reset Request</h1>
              <p>We received a request to reset your password. If you did not make this request, please ignore this email.</p>
              <p>To reset your password, please click the following link:</p>
              <p><a href="${process.env.FRONT}/auth/resetPassword?code=${code}&email=${email}" target="_blank">Reset Password</a></p>
              <p>This link will expire in 1 hour for security reasons.</p>
            </div>
          </body>
        </html>
      `;
    } else if (type === 'invoice') {
      subject = 'Payment Invoice for Your Purchase';
      htmlContent = `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f5f5f5;
                  padding: 20px;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  padding: 30px;
                  border-radius: 10px;
                  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                h1 {
                  color: #333333;
                }
                p {
                  color: #666666;
                  line-height: 1.6;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                th, td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
                }
                th {
                  background-color: #f2f2f2;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Hi ${lastname},</h1>
                <p>Thank you for your purchase. Below is the invoice details:</p>
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
                      </tr>
                    `,
                      )
                      .join('')}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3"><strong>Total:</strong></td>
                      <td>${total}</td>
                    </tr>
                  </tfoot>
                </table>
                <p>Thank you for your payment .</p>
              </div>
            </body>
          </html>
        `;
    }

    const mailOptions = {
      from: 'kejsiegro@gmail.com',
      to: email,
      subject: subject,
      html: htmlContent,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        res.status(500).send('Failed to send email');
      } else {
        console.log('Email sent:', info.response);
        res.status(200).send('Email sent successfully');
      }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Failed to send email');
  }
};

module.exports = {
  sendEmail,
};
