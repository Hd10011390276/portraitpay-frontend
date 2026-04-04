// Vercel serverless function for /api/register
export default async function handler(req, res) {
  try {
    const response = await fetch('https://portraitpay-api-production.up.railway.app/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: req.body,
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
