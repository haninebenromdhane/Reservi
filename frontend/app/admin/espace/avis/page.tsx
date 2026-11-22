"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

type Review = {
  _id: string;
  rating: number;
  comment: string;
  visible: boolean;
  client?: { firstName: string; lastName: string };
  professional?: { displayName: string };
};

export default function ModerationAvisPage() {
  const { user, accessToken } = useAuth();

  const [items, setItems] = useState<Review[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Review | null>(null);

  const load = async () => {
    try {
      setItems(
        await apiFetch<Review[]>("/admin/reviews", {
          token: accessToken ?? undefined,
        }),
      );
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de charger les avis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") void load();
  }, [user, accessToken]);

  if (!user || user.role !== "ADMIN")
    return <main className="min-h-screen p-10 text-center">Accès refusé</main>;

  const publish = async (id: string) => {
    setBusyId(id);
    setError("");
    try {
      await apiFetch(`/admin/reviews/${id}/publish`, {
        method: "PATCH",
        token: accessToken ?? undefined,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de publier cet avis.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete._id);
    setError("");
    try {
      await apiFetch(`/admin/reviews/${confirmDelete._id}`, {
        method: "DELETE",
        token: accessToken ?? undefined,
      });
      setConfirmDelete(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de supprimer cet avis.");
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = items.filter((r) => !r.visible).length;

  return (
    <main className="max-w-5xl mx-auto p-6">
      <Link href="/admin/espace" className="text-sm text-gray-600">
        ← Retour
      </Link>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Modération des avis</h1>

        {pendingCount > 0 && (
          <div className="w-fit rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-800">
            {pendingCount} avis en attente de publication
          </div>
        )}
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Un avis déposé par un client doit être validé ici avant d&apos;apparaître sur la plateforme.
      </p>

      {error && (
        <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="bg-white border rounded-lg p-6 text-center text-gray-500">
            Chargement...
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border rounded-lg p-6 text-center text-gray-500">
            Aucun avis pour le moment.
          </div>
        ) : (
          items.map((r) => (
            <div
              key={r._id}
              className={`bg-white border rounded-lg p-4 shadow-sm ${
                r.visible ? "border-gray-200" : "border-yellow-300"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {r.client?.firstName} {r.client?.lastName} → {r.professional?.displayName}
                </p>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    r.visible
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {r.visible ? "Publié" : "En attente de publication"}
                </span>
              </div>

              <p className="text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
              <p className="text-gray-600 text-sm mt-2">{r.comment}</p>

              <div className="mt-4 flex gap-2">
                {!r.visible && (
                  <button
                    type="button"
                    onClick={() => publish(r._id)}
                    disabled={busyId === r._id}
                    className="px-3 py-1 bg-black text-white rounded text-sm disabled:opacity-50"
                  >
                    Publier
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setConfirmDelete(r)}
                  disabled={busyId === r._id}
                  className="px-3 py-1 border border-red-200 text-red-600 rounded text-sm disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        ouvert={!!confirmDelete}
        titre="Supprimer cet avis ?"
        message="Cette action est définitive. L'avis sera retiré et ne pourra plus être publié."
        labelConfirmer="Supprimer"
        chargement={busyId === confirmDelete?._id}
        onConfirmer={remove}
        onAnnuler={() => setConfirmDelete(null)}
      />
    </main>
  );
}
