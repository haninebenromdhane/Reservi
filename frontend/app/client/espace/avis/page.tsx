"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";
type Review = {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  visible?: boolean;
  professional?: { displayName: string };
};
export default function ClientReviewsPage() {
  const { user, accessToken } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user?.role !== "CLIENT") {
      setLoading(false);
      return;
    }
    void apiFetch<Review[]>("/reviews/me/client", {
      token: accessToken ?? undefined,
    })
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [user, accessToken]);
  if (!user || user.role !== "CLIENT")
    return (
      <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Accès refusé</h1>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 font-semibold text-white"
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  return (
    <main className="min-h-screen backdrop-blur-sm rounded-3xl px-4 py-12 sm:p-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/client/espace"
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Retour à mon espace
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-gray-900">Mes avis</h1>
        {loading ? (
          <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-8">
            Chargement...
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-8 text-center">
            Aucun avis publié.
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {reviews.map((r) => (
              <article
                key={r._id}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {r.professional?.displayName ?? "Professionnel"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                    {r.visible === false && (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                        En attente de publication
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-2xl">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>
                <p className="mt-4 text-gray-600">{r.comment}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
