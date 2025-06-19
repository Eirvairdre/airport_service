"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DashboardAdminButton() {
  const { data: session } = useSession();
  console.log("session", session);
  if (!session?.user || session.user.role !== "admin") return null;
  return (
    <Link
      href="/admin"
      className="block bg-yellow-100 border border-yellow-400 rounded shadow p-6 text-center hover:bg-yellow-200 transition"
    >
      <div className="text-2xl font-bold text-yellow-700 mb-2">Админ-панель</div>
      <div className="text-gray-800 text-lg">Инструменты администратора</div>
    </Link>
  );
} 