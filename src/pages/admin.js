import { useState } from "react";
import { useRouter } from "next/router";
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
  const initialRedirects = await db.all("SELECT * FROM paths");

  return {
    props: { initialRedirects },
  };
});

export default function Admin({ initialRedirects }) {
  const router = useRouter();
  const [list, setList] = useState(initialRedirects);
  const [form, setForm] = useState({
    path: "",
    domain: "",
    redirectUrl: "",
  });

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

      const updatedRes = await fetch("/api/admin/redirects");
      const updatedJson = await updatedRes.json();
      const updatedList = Array.isArray(updatedJson)
        ? updatedJson
        : updatedJson.redirects ?? updatedJson.rows ?? [];
      setList(updatedList);
      setForm({ path: "", domain: "", redirectUrl: "" });
    } catch (err) {
      console.error("Failed to add redirect:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/delete?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      setList((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to delete redirect:", err);
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

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Path</th>
              <th className="p-2 text-left">Domain</th>
              <th className="p-2 text-left">Redirect URL</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.path}</td>
                <td className="p-2">{r.domain}</td>
                <td className="p-2 break-all">{r.redirect_url}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No redirects defined yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
