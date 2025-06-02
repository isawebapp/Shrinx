import { withSessionRoute } from "../../../lib/session";

export default withSessionRoute(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  req.session.destroy();
  await req.session.save();

  res.status(200).json({ ok: true });
});
