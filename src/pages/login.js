import { useState } from "react";
import { useRouter } from "next/router";
import { withSessionSsr } from "../lib/session";

export const getServerSideProps = withSessionSsr(async ({ req }) => {
  const user = req.session.get("user");
  if (user?.isLoggedIn) {
    return { redirect: { destination: "/admin", permanent: false } };
  }
  return { props: {} };
});

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.message || "Login failed");
      return;
    }

    router.push("/admin");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 border border-gray-300 rounded-lg w-full max-w-sm shadow-md"
      >
        <h1 className="text-center text-2xl mb-4">Admin Login</h1>

        {error && (
          <p className="text-red-500 text-sm mb-3" role="alert">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-semibold mb-1">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-2 border border-gray-400 rounded"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-semibold mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-400 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white uppercase text-sm font-medium py-2 rounded hover:bg-gray-800"
        >
          Login
        </button>
      </form>
    </div>
  );
}
