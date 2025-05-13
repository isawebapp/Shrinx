export default function handler(req, res) {
  const domains = process.env.DOMAINS?.split(",") || [];
  res.status(200).json({ domains });
}
