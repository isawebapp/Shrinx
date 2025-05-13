import { withSessionRoute } from "../../../lib/session";

export default withSessionRoute(async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.set("user", { isLoggedIn: true });
    await req.session.save();
    return res.status(200).json({ ok: true });
  }

  res.status(401).json({ message: "Invalid credentials" });
});
