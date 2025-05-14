// src/pages/index.js

import Head from "next/head";
import dynamic from "next/dynamic";
import { useState } from "react";

const Turnstile = dynamic(
  () =>
    import("@marsidev/react-turnstile").then((mod) => mod.Turnstile),
  { ssr: false }
);

export default function Home({ domains: initialDomains }) {
  const [domains] = useState(initialDomains);
  const [form, setForm] = useState({ url: "", domain: "", alias: "" });
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Please complete the captcha.");
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: form.alias.trim(),
          domain: form.domain,
          redirectUrl: form.url.trim(),
          turnstileResponse: token,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.message || "Failed to shorten URL.");
      } else {
        window.location.href = `/success?path=${encodeURIComponent(
          form.alias
        )}&domain=${encodeURIComponent(form.domain)}`;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Shrinx · URL Shortener</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-4 py-8">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Shorten a long URL
            </h2>
            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Enter long link here
                </label>
                <input
                  id="url"
                  name="url"
                  type="url"
                  placeholder="https://example.com/very/long/url"
                  value={form.url}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  Customize your link
                </h3>
                <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                  <select
                    name="domain"
                    value={form.domain}
                    onChange={handleChange}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      choose a domain
                    </option>
                    {domains.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <input
                    name="alias"
                    type="text"
                    placeholder="Enter alias"
                    value={form.alias}
                    onChange={handleChange}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                  onSuccess={(t) => setToken(t)}
                  onExpire={() => setToken("")}
                  onError={() =>
                    setError("Captcha failed, please try again.")
                  }
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Shortening..." : "Shorten URL"}
              </button>
            </form>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-700 to-blue-500 text-white px-6 py-8 md:p-12 flex items-start justify-center">
          <div className="max-w-md space-y-6">
            <h1 className="text-2xl md:text-4xl font-bold">
              Shrinx - URL Shortener
            </h1>
            <p className="text-base md:text-lg">
              Create with Next.js, TailWindCSS and SQLite3.
            </p>
            <p className="text-sm md:text-base">
              A modern, minimalistic URL shortener that transforms long,
              complex links into clean, concise URLs. Shrinx is designed for
              simplicity, speed, and seamless integration.
            </p>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
              <a
                href="https://github.com/isawebapp/Shrinx"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="px-6 py-2 border border-white rounded hover:bg-white hover:text-blue-700 transition">
                  View Github Repository
                </button>
              </a>
              <a
                href="https://tonyliu.cloud"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="px-6 py-2 bg-white text-blue-700 rounded hover:bg-gray-100 transition">
                  by TonyLiu.cloud
                </button>
              </a>
            </div>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>🌐 Instant URL Shortening: Quickly shorten long URLs.</li>
              <li>📊 Analytics: Track click counts and link performance.</li>
              <li>🔒 Secure: Protect your data with encrypted storage.</li>
              <li>🔗 Custom Short URLs: Create custom alias links.</li>
              <li>⚡ RESTful API: Integrate Shrinx with other applications.</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  const domains = process.env.DOMAINS?.split(",") || [];
  return {
    props: {
      domains,
    },
  };
}
