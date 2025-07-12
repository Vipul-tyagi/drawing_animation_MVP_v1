const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { addBalance } = require('./userService'); // Import addBalance

async function createCheckoutSession(amount, userEmail) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Wallet Top-up (${amount})`,
            },
            unit_amount: amount * 100, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&user_email=${userEmail}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
      metadata: { userEmail: userEmail, amount: amount },
    });
    return session.url;
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw new Error('Failed to create checkout session.');
  }
}

async function handleWebhookEvent(rawBody, signature, webhookSecret) {
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    throw new Error(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout session completed:', session.id);
      try {
        const userEmail = session.metadata.userEmail;
        const amount = parseFloat(session.metadata.amount); // Ensure amount is a number
        if (userEmail && !isNaN(amount)) {
          await addBalance(userEmail, amount);
          console.log(`User ${userEmail} topped up ${amount}`);
        } else {
          console.error('Missing userId or invalid amount in session metadata:', session.metadata);
        }
      } catch (balanceError) {
        console.error('Error updating user balance from webhook:', balanceError);
      }
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  return { received: true };
}

module.exports = {
  createCheckoutSession,
  handleWebhookEvent,
};
