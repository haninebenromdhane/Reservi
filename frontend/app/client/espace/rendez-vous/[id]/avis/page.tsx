"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";

export default function LaisserAvisPage() {
  const params = useParams();
  const router = useRouter();

  const { accessToken } = useAuth();

  const bookingId = params.id as string;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (rating < 1 || rating > 5) {
      setError(
        "Veuillez sélectionner une note.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetch(
        `/reviews/booking/${bookingId}`,
        {
          method: "POST",
          token: accessToken ?? undefined,
          body: JSON.stringify({
            rating,
            comment,
          }),
        },
      );

      setSuccess(true);

      setTimeout(() => {
        router.push(
          "/client/espace/rendez-vous",
        );
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de publier l'avis.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen backdrop-blur-sm rounded-3xl px-4 py-12 sm:p-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/client/espace/rendez-vous"
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Retour à mes rendez-vous
        </Link>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Laisser un avis
          </h1>

          <p className="mt-2 text-gray-600">
            Votre avis doit concerner une prestation terminée.
          </p>

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-700">
              Votre avis a été publié avec succès.
            </div>
          )}

          <form
            onSubmit={submit}
            className="mt-8 space-y-6"
          >
            <div>
              <p className="mb-3 text-sm font-medium text-gray-900">
                Votre note
              </p>

              <div
                className="flex gap-2"
                role="radiogroup"
                aria-label="Note"
              >
                {[1, 2, 3, 4, 5].map(
                  (value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setRating(value)
                      }
                      aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                      className="text-3xl"
                    >
                      {value <= rating
                        ? "★"
                        : "☆"}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="comment"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Commentaire
              </label>

              <textarea
                id="comment"
                rows={6}
                value={comment}
                onChange={(event) =>
                  setComment(
                    event.target.value,
                  )
                }
                placeholder="Partagez votre expérience..."
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading
                ? "Publication..."
                : "Publier mon avis"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}