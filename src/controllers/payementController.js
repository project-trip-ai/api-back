import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const stripe = require('stripe')(process.env.SECRET_KEY);
export async function checkout(req, res) {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: req.body.lineItems,
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: process.env.AI_PAGE,
      cancel_url: process.env.CANCEL_URL,
    });
    return res.status(201).json(session);
  } catch (error) {
    return res.status(500).json(error);
  }
}
export async function webhook(req, res) {
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
    case 'checkout.session.completed':
      var session = event.data.object;

      var customerEmail = session.customer_details.email;
      var customerName = session.customer_details.name;
      var total = session.amount_total / 100;
      var currency = session.currency;
      var session_id = session.id;

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

      console.log(`Customer Email: ${customerEmail}`);
      console.log(`Customer Name: ${customerName}`);
      console.log(`Total: ${total}`);
      console.log(`Currency: ${currency}`);
      console.log('Items: ', items);

      try {
        var paymentResponse = await axios.post(process.env.SEND_MAIL_INVOICE, {
          type: 'invoice',
          email: customerEmail,
          lastname: customerName,
          total,
          currency,
          items,
        });

        // var subResponse = await axios.post(process.env.CREATE_SUB, {
        //   username: customerEmail,
        //   items,
        // });

        if (paymentResponse.status !== 200) {
          throw new Error('Failed to send info payment');
        }
        // if (subResponse.status !== 200) {
        //   throw new Error('Failed to send info subscription');
        // }

        res.status(200).json({message: 'Info sent'});
      } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
      res.status(400).send(`Unhandled event type ${event.type}`);
  }
}
