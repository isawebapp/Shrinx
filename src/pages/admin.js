import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { withSessionSsr } from "../lib/session";
import { openDB } from "../lib/db";

export const getServerSideProps = withSessionSsr(async ({ req }) => {
  const user = req.session.get("user");
  if (!user?.isLoggedIn) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const db = await openDB();
  await db.run(`
    CREATE TABLE IF NOT EXISTS paths (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT,
      domain TEXT,
      redirect_url TEXT
    )
  `);
  return { props: {} };
});

export default function Admin() {
  const router = useRouter();
  const [form, setForm] = useState({
    path: "",
    domain: "",
    redirectUrl: "",
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Add failed: ${res.status}`);
      
      setSuccess(true);
      setForm({ path: "", domain: "", redirectUrl: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to add redirect:", err);
    }
  };

  const handleLogout = async () => {
    const res = await fetch("/api/admin/logout", { method: "POST" });
    if (res.ok) {
      router.push("/login");
    } else {
      console.error("Logout failed:", await res.text());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleAdd} className="bg-white p-6 mb-8 shadow rounded">
        <h2 className="text-xl font-medium mb-4">Add Redirect</h2>
        
        {success && (
          <div className="bg-green-100 text-green-700 p-4 mb-4 rounded">
            Redirect added successfully!
          </div>
        )}

        <label className="block text-sm font-semibold mb-1">Path</label>
        <input
          name="path"
          value={form.path}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        <label className="block text-sm font-semibold mb-1">Domain</label>
        <input
          name="domain"
          value={form.domain}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        <label className="block text-sm font-semibold mb-1">
          Redirect URL
        </label>
        <input
          name="redirectUrl"
          value={form.redirectUrl}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded mb-6"
        />

        <button className="px-4 py-2 border border-black uppercase text-sm font-medium rounded hover:bg-black hover:text-white">
          Add
        </button>
      </form>

      <div className="bg-white p-6 shadow rounded">
        <Link 
          href="/admin/redirects" 
          className="text-blue-600 hover:underline text-lg font-medium"
        >
          View All Redirects →
        </Link>
      </div>
    </div>
  );
}
