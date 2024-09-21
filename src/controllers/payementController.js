const dotenv = require('dotenv');
const axios = require('axios');
const {sendEmail} = require('./emailController');
dotenv.config();
const stripe = require('stripe')(process.env.SECRET_KEY);
async function checkout(req, res) {
  const {secretCode, emailUser} = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: req.body.lineItems,
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: process.env.FRONT + '/plan-trip',
      cancel_url: process.env.FRONT + '/subscription',
      metadata: {
        secretCode: secretCode,
        emailUser: emailUser,
      },
    });
    return res.status(201).json(session);
  } catch (error) {
    return res.status(500).json(error);
  }
}
async function webhook(req, res) {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.ENDPOINT_SECRET,
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      var session = event.data.object;

      var customerEmail = session.customer_details.email;
      var customerName = session.customer_details.name;
      var total = session.amount_total / 100;
      var currency = session.currency;
      var session_id = session.id;
      var secretCode = session.metadata.secretCode;
      var emailUser = session.metadata.emailUser;

      try {
        var sessionWithLineItems = await stripe.checkout.sessions.retrieve(
          session_id,
          {
            expand: ['line_items'],
          },
        );

        var items = sessionWithLineItems.line_items.data.map(item => {
          return {
            name: item.description,
            quantity: item.quantity,
            price: item.price.unit_amount,
          };
        });

        const paymentResponse = await sendEmail({
          body: {
            type: 'invoice',
            email: customerEmail,
            lastname: customerName,
            total,
            currency,
            items,
          },
        });

        if (paymentResponse.status !== 200) {
          throw new Error('Failed to send info payment');
        }

        var subResponse = await axios.post(process.env.API_BDD + '/createSub', {
          email: emailUser,
          items,
          secretCode,
        });

        if (subResponse.status !== 200) {
          throw new Error('Failed to send info subscription');
        }

        return res.status(200).json({message: 'Info sent'});
      } catch (error) {
        return res.status(500).send(`Error: ${error.message}`);
      }
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
      return res.status(400).send(`Unhandled event type ${event.type}`);
  }
}
module.exports = {
  checkout,
  webhook,
};
