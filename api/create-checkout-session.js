const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY || process.env.Stripe_Secret_Key;
const stripe = require("stripe")(stripeSecretKey);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { items } = req.body;
    const origin =
      req.headers.origin ||
      `https://${req.headers["x-forwarded-host"] || req.headers.host}`;

    if (!stripeSecretKey) {
      return res.status(500).json({ error: "Stripe is not configured." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: items.map((item) => ({
        price: item.price,
        quantity: item.quantity,
      })),

      metadata: {
        order: JSON.stringify(
          items.map((item) => ({
            name: item.name,
            size: item.size,
            quantity: item.quantity,
          }))
        ),
      },
    success_url: "https://austin-cyrus-racing.vercel.app/success",
cancel_url: "https://austin-cyrus-racing.vercel.app",
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
