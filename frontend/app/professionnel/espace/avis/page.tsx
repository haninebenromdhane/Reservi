"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";

type Review = {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  client?: {
    firstName: string;
    lastName: string;
  };
};

export default function ProfessionalAvisPage() {
  const { accessToken } = useAuth();

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const profile =
          await apiFetch<{
            _id: string;
          }>(
            "/professionals/me",
            {
              token:
                accessToken ?? undefined,
            },
          );

        const data =
          await apiFetch<Review[]>(
            `/reviews/professional/${profile._id}`,
          );

        setReviews(data);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [accessToken]);

  const average =
    reviews.length === 0
      ? 0
      : reviews.reduce(
          (sum, review) =>
            sum + review.rating,
          0,
        ) / reviews.length;

  return (
    <main className="min-h-screen backdrop-blur-sm rounded-3xl px-4 py-12 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/professionnel/espace"
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Retour à mon espace professionnel
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-500">
            Espace professionnel
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Mes avis
          </h1>
        </div>

        <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm text-gray-500">
            Note moyenne
          </p>

          <div className="mt-2 flex items-center gap-4">
            <span className="text-4xl font-bold">
              {average.toFixed(1)}
            </span>

            <div>
              <div className="text-xl">
                {"★".repeat(
                  Math.round(average),
                )}
                {"☆".repeat(
                  5 - Math.round(average),
                )}
              </div>

              <p className="text-sm text-gray-500">
                {reviews.length} avis
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          {loading ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-8">
              Chargement...
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center">
              Aucun avis pour le moment.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <article
                  key={review._id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {review.client?.firstName}{" "}
                        {review.client?.lastName}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(
                          review.createdAt,
                        ).toLocaleDateString(
                          "fr-FR",
                        )}
                      </p>
                    </div>

                    <div className="text-lg">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(
                        5 - review.rating,
                      )}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="mt-5 leading-7 text-gray-600">
                      {review.comment}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}