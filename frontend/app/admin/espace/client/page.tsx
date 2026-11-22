"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

type Client = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
};

export default function AdminClientsPage() {
  const { user, accessToken } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [confirmTarget, setConfirmTarget] = useState<Client | null>(null);

  const load = async () => {
    try {
      setClients(
        await apiFetch<Client[]>("/admin/clients", { token: accessToken ?? undefined }),
      );
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de charger les clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") void load();
  }, [user, accessToken]);

  if (!user || user.role !== "ADMIN")
    return <main className="min-h-screen p-10 text-center">Accès refusé</main>;

  const toggleStatus = async () => {
    if (!confirmTarget) return;
    const nextStatus = confirmTarget.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";

    setBusyId(confirmTarget._id);
    setError("");

    try {
      await apiFetch(`/admin/users/${confirmTarget._id}/status`, {
        method: "PATCH",
        token: accessToken ?? undefined,
        body: JSON.stringify({ status: nextStatus }),
      });
      setConfirmTarget(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action impossible.");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = clients.filter((c) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin/espace" className="text-sm font-medium text-gray-600 hover:text-black">
          ← Retour au tableau de bord
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-gray-900">Gestion des clients</h1>
        <p className="mt-2 text-gray-600">
          Liste des comptes clients de la plateforme. Un compte suspendu perd l&apos;accès à son
          espace.
        </p>

        <div className="mt-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client par nom ou e-mail..."
            className="w-full max-w-md rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
          />
        </div>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Aucun client trouvé.</div>
            ) : (
              filtered.map((c) => (
                <div
                  key={c._id}
                  className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {c.firstName} {c.lastName}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">{c.email}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-medium ${
                        c.status === "SUSPENDED"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {c.status === "SUSPENDED" ? "Suspendu" : "Actif"}
                    </span>

                    <button
                      type="button"
                      onClick={() => setConfirmTarget(c)}
                      disabled={busyId === c._id}
                      className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold disabled:opacity-50"
                    >
                      {c.status === "SUSPENDED" ? "Réactiver" : "Suspendre"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <ConfirmDialog
        ouvert={!!confirmTarget}
        titre={
          confirmTarget?.status === "SUSPENDED"
            ? "Réactiver ce client ?"
            : "Suspendre ce client ?"
        }
        message={
          confirmTarget?.status === "SUSPENDED"
            ? "Le client retrouvera l'accès à son compte."
            : "Le client n'aura plus accès à son compte tant qu'il n'est pas réactivé."
        }
        labelConfirmer={confirmTarget?.status === "SUSPENDED" ? "Réactiver" : "Suspendre"}
        danger={confirmTarget?.status !== "SUSPENDED"}
        chargement={busyId === confirmTarget?._id}
        onConfirmer={toggleStatus}
        onAnnuler={() => setConfirmTarget(null)}
      />
    </main>
  );
}
