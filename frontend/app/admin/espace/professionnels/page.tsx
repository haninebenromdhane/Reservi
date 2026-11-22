"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { apiFetch } from "@/lib/api";
type P = {
  _id: string;
  displayName: string;
  city: string;
  status: string;
  profession?: { name: string };
};
export default function AdminProfessionalsPage() {
  const { user, accessToken } = useAuth();
  const [items, setItems] = useState<P[]>([]);
  const load = async () => {
    try {
      setItems(
        await apiFetch<P[]>("/professionals/admin/all", {
          token: accessToken ?? undefined,
        }),
      );
    } catch {
      setItems([]);
    }
  };
  useEffect(() => {
    if (user?.role === "ADMIN") void load();
  }, [user, accessToken]);
  if (!user || user.role !== "ADMIN")
    return <main className="min-h-screen p-10 text-center">Accès refusé</main>;
  return (
    <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin/espace" className="text-sm text-gray-600">
          ← Retour
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Professionnels</h1>
        <div className="mt-8 space-y-4">
          {items.map((p) => (
            <div
              key={p._id}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="font-semibold">{p.displayName}</h2>
                <p className="mt-1 text-gray-600">
                  {p.profession?.name} · {p.city}
                </p>
                <p className="mt-2 text-sm">Statut : {p.status}</p>
              </div>
              <Link
                href={`/admin/espace/professionnels/${p._id}`}
                className="rounded-xl border px-4 py-2 text-sm font-semibold"
              >
                Voir la fiche
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
