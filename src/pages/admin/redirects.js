import { useState } from "react";
import { useRouter } from "next/router";
import { withSessionSsr } from "../../lib/session";
import { openDB } from "../../lib/db";

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
  const redirects = await db.all("SELECT * FROM paths");

  return {
    props: { initialRedirects: redirects },
  };
});

export default function RedirectsPage({ initialRedirects }) {
  const router = useRouter();
  const [list, setList] = useState(initialRedirects);

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
        <div>
          <h1 className="text-3xl font-semibold">Redirect Manager</h1>
          <a 
            href="/admin" 
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            &larr; Back to Dashboard
          </a>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
        >
          Logout
        </button>
      </div>

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
