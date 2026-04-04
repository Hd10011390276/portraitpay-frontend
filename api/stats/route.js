// Vercel serverless function for /api/stats
// Proxies to Railway Flask backend
export default async function handler(req, res) {
  try {
    const response = await fetch('https://portraitpay-api-production.up.railway.app/api/stats', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
