const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

const privateKey = 'xxx';
const publicKey = 'xxx';


const stripe = require('stripe')(privateKey);

const app = express();


app.use(cors({ origin: true }));

app.get('/hello-world', (req, res) => {
  console.log('go here');
  return res.status(200).send('Hello World!');
});

app.post('/create-payment-intent', async (req, res) => {
  console.log('create payment intent with');
  
  const data = req.body;
  // const amount = calculateOrderAmount(data.items)

  await stripe.paymentIntents.create({
    amount: 2500,
    // currency: data.currency,
    payment_method_types: ['card'],
    currency: 'cad',
    application_fee_amount: 123,
    transfer_data: {
      // destination: data.account,
      destination: 'acct_1GfpWxJ09jdByCCH', //<-- Fred Pizza
    },
  }).then((paymentIntent) => {
    try {
      return res.send({
        publishableKey: publicKey,
        clientSecret: paymentIntent.client_secret
      });
    } catch (err) {
      return res.status(500).send({
        error: err.message
      });
    }
  });
});

app.get('/recent-accounts', async (_, res) => {
  stripe.accounts.list(
    {limit: 10},
    (err, accounts) => {
      if (err) {
        return res.status(500).send({
          error: err.message
        });
      }
      return res.send({accounts});
    }
  );
});

app.get('/recent-payment-intents', async (req, res) => {
  const limit = req.query.limit || 3;
  console.log('limit is', limit);
  stripe.paymentIntents.list(
    {limit}, 
    (err, paymentIntents) => {
      if (err) {
        return res.status(500).send({
          error: err.message
        });
      }
      return res.send({paymentIntents})
    }
  );
})

exports.app = functions.https.onRequest(app);