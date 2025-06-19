"use client";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace('/dashboard');
    }
  }, [session, status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else if (res?.ok) {
      router.push('/dashboard');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Вход в систему</h1>
        <label className="block mb-2 text-gray-800">Email</label>
        <input
          type="email"
          className="w-full px-3 py-2 border rounded mb-4 text-gray-900 placeholder:text-gray-400"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <label className="block mb-2 text-gray-800">Пароль</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded mb-4 text-gray-900 placeholder:text-gray-400"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {(!session && error) && <div className="text-red-600 mb-4 text-center">{error}</div>}
        {(!session && searchParams.get("error")) && (
          <div className="text-red-600 mb-4 text-center">Ошибка авторизации</div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
} 