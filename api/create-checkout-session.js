const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { items } = req.body;

    const orderSummary = items
      .map((item) => `${item.quantity}x ${item.name} | Size: ${item.size}`)
      .join(" || ");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: items.map((item) => ({
        price: item.price,
        quantity: item.quantity,
      })),

      metadata: {
        order_summary: orderSummary,
      },

      payment_intent_data: {
        metadata: {
          order_summary: orderSummary,
        },
      },

      success_url: "https://austin-cyrus-racing.vercel.app/success",
      cancel_url: "https://austin-cyrus-racing.vercel.app",
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
