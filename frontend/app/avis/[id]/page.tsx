"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
export default function LegacyReviewPage() {
  const { id } = useParams();
  const { accessToken, user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!user?.id) return;
  }, [user]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(`/reviews/booking/${String(id)}`, {
        method: "POST",
        token: accessToken ?? undefined,
        body: JSON.stringify({ rating, comment }),
      });
      setMessage("Votre avis a été publié.");
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Impossible de publier l'avis.",
      );
    }
  };
  return (
    <main className="min-h-screen p-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-8">
        <Link
          href="/client/espace/rendez-vous"
          className="text-sm text-gray-600"
        >
          ← Retour
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Laisser un avis</h1>
        {message && <p className="mt-4 text-sm">{message}</p>}
        <form onSubmit={submit} className="mt-8 space-y-5">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setRating(s)}
                className="text-4xl"
              >
                {s <= rating ? "★" : "☆"}
              </button>
            ))}
          </div>
          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={6}
            className="w-full rounded-xl border p-3"
          />
          <button className="w-full rounded-xl bg-black px-5 py-3 font-semibold text-white">
            Publier
          </button>
        </form>
      </div>
    </main>
  );
}
