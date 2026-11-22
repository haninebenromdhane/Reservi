"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { apiFetch } from "@/lib/api";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
type Profession = {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  active: boolean;
};
export default function AdminProfessionsPage() {
  const { user, accessToken } = useAuth();
  const [items, setItems] = useState<Profession[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<Profession | null>(null);
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      setItems(
        await apiFetch<Profession[]>("/professions/admin/all", {
          token: accessToken ?? undefined,
        }),
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Impossible de charger les professions.",
      );
    }
  };
  useEffect(() => {
    if (user?.role === "ADMIN") void load();
  }, [user, accessToken]);
  if (!user || user.role !== "ADMIN")
    return <main className="min-h-screen p-10 text-center">Accès refusé</main>;
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await apiFetch("/professions", {
        method: "POST",
        token: accessToken ?? undefined,
        body: JSON.stringify({ name: name.trim() }),
      });
      setName("");
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Impossible d'ajouter la profession.",
      );
    }
  };
  const remove = async () => {
    if (!confirmTarget) return;
    setBusy(true);
    try {
      await apiFetch(`/professions/${confirmTarget._id}`, {
        method: "DELETE",
        token: accessToken ?? undefined,
      });
      setConfirmTarget(null);
      await load();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Impossible de supprimer la profession.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin/espace"
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Retour à l&apos;administration
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Gérer le référentiel des professions
        </h1>
        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={add} className="flex flex-col gap-3 sm:flex-row">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Exemple : Kinésithérapeute"
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
            />
            <button className="rounded-xl bg-black px-5 py-3 font-semibold text-white">
              Ajouter
            </button>
          </form>
        </section>
        <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            {items.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between rounded-2xl border border-gray-200 px-5 py-4"
              >
                <p className="font-medium text-gray-900">{p.name}</p>
                <button
                  onClick={() => setConfirmTarget(p)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
      <ConfirmDialog
        ouvert={!!confirmTarget}
        titre="Supprimer cette profession ?"
        message={`"${confirmTarget?.name ?? ""}" sera retirée du référentiel. Cette action est irréversible.`}
        labelConfirmer="Supprimer"
        chargement={busy}
        onConfirmer={remove}
        onAnnuler={() => setConfirmTarget(null)}
      />
    </main>
  );
}
