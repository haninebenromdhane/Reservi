"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { apiFetch } from "@/lib/api";
type Booking = {
  _id: string;
  date: string;
  professional?: {
    _id: string;
    displayName: string;
    profession?: { name: string };
  };
  status: string;
};
export default function LeaveReviewPage() {
  const { user, accessToken } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingId, setBookingId] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (user?.role !== "CLIENT") return;
    void apiFetch<Booking[]>("/bookings/me", {
      token: accessToken ?? undefined,
    })
      .then((x) => setBookings(x.filter((b) => b.status === "COMPLETED")))
      .catch((e) =>
        setError(
          e instanceof Error
            ? e.message
            : "Impossible de charger les rendez-vous.",
        ),
      );
  }, [user, accessToken]);
  if (!user || user.role !== "CLIENT")
    return <main className="min-h-screen p-10 text-center">Accès refusé</main>;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || rating < 1) return;
    setError("");
    try {
      await apiFetch(`/reviews/booking/${bookingId}`, {
        method: "POST",
        token: accessToken ?? undefined,
        body: JSON.stringify({ rating, comment }),
      });
      setSubmitted(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Impossible de publier l'avis.",
      );
    }
  };
  return (
    <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/client/espace"
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Retour à mon espace
        </Link>
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900">Laisser un avis</h1>
          <p className="mt-2 text-gray-600">
            Sélectionnez une prestation terminée.
          </p>
          {error && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          {submitted ? (
            <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5">
              <h2 className="font-semibold text-green-900">
                Merci pour votre avis !
              </h2>
              <Link
                href="/client/espace/avis"
                className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
              >
                Voir mes avis
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-6">
              <select
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
              >
                <option value="">Sélectionnez une prestation</option>
                {bookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.professional?.displayName ?? "Professionnel"} —{" "}
                    {new Date(b.date).toLocaleDateString("fr-FR")}
                  </option>
                ))}
              </select>
              <div>
                <p className="mb-3 text-sm font-medium text-gray-900">
                  Votre note
                </p>
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
              </div>
              <textarea
                required
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience..."
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
              />
              <button
                disabled={!bookingId || rating === 0}
                className="w-full rounded-xl bg-black px-5 py-3 font-semibold text-white disabled:bg-gray-300"
              >
                Publier mon avis
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
