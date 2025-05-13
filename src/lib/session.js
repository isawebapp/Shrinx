// src/lib/session.js
import { withIronSession } from "next-iron-session";

const sessionOptions = {
  password: process.env.SESSION_PASSWORD,
  cookieName: "shrinx_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export function withSessionRoute(handler) {
  return withIronSession(handler, sessionOptions);
}

export function withSessionSsr(handler) {
  return withIronSession(handler, sessionOptions);
}
