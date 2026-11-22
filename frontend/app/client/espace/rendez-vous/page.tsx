"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

type Booking = {
  _id: string;

  client?: string | {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };

  professional?: {
    _id?: string;
    displayName?: string;
    profession?: {
      _id?: string;
      name?: string;
    };
    city?: string;
    imageUrl?: string;
    rating?: number;
    reviews?: number;
  };

  date: string;
  startTime: string;
  endTime: string;
  status: string;

  reason?: string;
  clientNote?: string;
  serviceName?: string;
  servicePrice?: number;
  serviceDuration?: number;
};

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Accepté",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
  NO_SHOW: "Client absent",
};

export default function ClientRendezVousPage() {
  const { user, accessToken } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    const loadBookings = useCallback(async () => {
      if (!accessToken || user?.role !== "CLIENT") {
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch<Booking[]>("/bookings/me", {
          method: "GET",
          token: accessToken,
        });

        /*
         * The backend already excludes REJECTED bookings.
         * Do not filter anything else on the frontend.
         */
        setBookings(data);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger vos rendez-vous.",
        );
      } finally {
        setLoading(false);
      }
    }, [accessToken, user?.role, user?.id]);

    useEffect(() => {
      void loadBookings();
    }, [loadBookings]);

  /*
   * Refresh every 5 seconds.
   *
   * This allows the client page to automatically detect:
   *
   * PENDING -> CONFIRMED
   *
   * when the professional accepts the request.
   */
  useEffect(() => {
    if (!accessToken || user?.role !== "CLIENT") {
      return;
    }

    const interval = window.setInterval(() => {
      void loadBookings();
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [accessToken, user?.role, loadBookings]);

  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const cancelBooking = async () => {
    if (!accessToken || !cancelTarget) {
      return;
    }

    setError("");
    setCancelling(true);

    try {
      await apiFetch(`/bookings/${cancelTarget}/status`, {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify({
          status: "CANCELLED",
        }),
      });

      setCancelTarget(null);
      await loadBookings();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'annuler le rendez-vous.",
      );
    } finally {
      setCancelling(false);
    }
  };

  if (!user || user.role !== "CLIENT") {
    return (
      <main className="min-h-screen backdrop-blur-sm px-4 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Connexion nécessaire
          </h1>

          <p className="mt-2 text-gray-600">
            Connectez-vous avec un compte client pour consulter vos
            rendez-vous.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 font-semibold text-white"
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen backdrop-blur-sm rounded-3xl px-4 py-12 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/client/espace"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Retour à mon espace
          </Link>

          <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-8">
            Chargement de vos rendez-vous...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen backdrop-blur-sm rounded-3xl px-4 py-12 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/client/espace"
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Retour à mon espace
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Mes rendez-vous
          </h1>

          <p className="mt-2 text-gray-600">
            Retrouvez vos réservations à venir et passées.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Aucun rendez-vous
            </h2>

            <p className="mt-2 text-gray-600">
              Vous n&apos;avez actuellement aucun rendez-vous.
            </p>

            <Link
              href="/annuaire"
              className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 font-semibold text-white"
            >
              Trouver un professionnel
            </Link>
          </div>
        ) : (
          <section className="mt-8 space-y-4">
            {bookings.map((booking) => {
              const isPending = booking.status === "PENDING";
              const isConfirmed = booking.status === "CONFIRMED";
              const isCompleted = booking.status === "COMPLETED";
              const isCancelled = booking.status === "CANCELLED";
              const isNoShow = booking.status === "NO_SHOW";

              return (
                <article
                  key={booking._id}
                  className={`rounded-3xl border bg-white p-6 shadow-sm ${
                    isConfirmed
                      ? "border-green-300"
                      : isPending
                        ? "border-yellow-300"
                        : "border-gray-200"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {booking.professional?.displayName ??
                          "Professionnel"}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {booking.professional?.profession?.name ?? ""}
                        {booking.professional?.profession?.name &&
                        booking.professional?.city
                          ? " · "
                          : ""}
                        {booking.professional?.city ?? ""}
                      </p>

                      {booking.serviceName && (
                        <p className="mt-3 text-sm text-gray-700">
                          Service :{" "}
                          <span className="font-medium text-gray-900">
                            {booking.serviceName}
                          </span>
                        </p>
                      )}

                      {typeof booking.servicePrice === "number" && (
                        <p className="mt-1 text-sm text-gray-600">
                          Tarif :{" "}
                          <span className="font-medium text-gray-900">
                            {booking.servicePrice} DT
                          </span>
                        </p>
                      )}

                      {booking.reason && (
                        <p className="mt-3 text-sm text-gray-700">
                          {booking.reason}
                        </p>
                      )}

                      <p className="mt-3 text-sm text-gray-600">
                        {new Date(booking.date).toLocaleDateString("fr-FR")}{" "}
                        · {booking.startTime} → {booking.endTime}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-4 py-2 text-sm font-medium ${
                        isPending
                          ? "bg-yellow-100 text-yellow-800"
                          : isConfirmed
                            ? "bg-green-100 text-green-800"
                            : isCompleted
                              ? "bg-gray-100 text-gray-700"
                              : isCancelled
                                ? "bg-red-100 text-red-700"
                                : isNoShow
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {statusLabels[booking.status] ?? booking.status}
                    </span>
                  </div>

                  {/* PENDING */}
                  {isPending && (
                    <div className="mt-5 rounded-2xl bg-yellow-50 p-4">
                      <p className="text-sm font-medium text-yellow-900">
                        Demande en attente
                      </p>

                      <p className="mt-1 text-sm text-yellow-800">
                        Le professionnel doit encore accepter ou refuser
                        votre demande.
                      </p>
                    </div>
                  )}

                  {/* CONFIRMED */}
                  {isConfirmed && (
                    <div className="mt-5 rounded-2xl bg-green-50 p-4">
                      <p className="text-sm font-medium text-green-900">
                        Rendez-vous accepté
                      </p>

                      <p className="mt-1 text-sm text-green-800">
                        Votre rendez-vous a été accepté par le professionnel.
                      </p>
                    </div>
                  )}

                  {/* CANCEL BUTTON */}
                  {(isPending || isConfirmed) && (
                    <button
                      type="button"
                      onClick={() => setCancelTarget(booking._id)}
                      className="mt-5 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:border-red-400"
                    >
                      Annuler le rendez-vous
                    </button>
                  )}

                  {/* COMPLETED */}
                  {isCompleted && (
                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <p className="mb-3 text-sm text-gray-600">
                        Ce rendez-vous est terminé. Vous pouvez maintenant
                        laisser un avis au professionnel.
                      </p>

                      <Link
                        href={`/client/espace/rendez-vous/${booking._id}/avis`}
                        className="inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                      >
                        Laisser un avis
                      </Link>
                    </div>
                  )}

                  {/* CANCELLED */}
                  {isCancelled && (
                    <div className="mt-5 rounded-2xl bg-red-50 p-4">
                      <p className="text-sm font-medium text-red-900">
                        Rendez-vous annulé
                      </p>

                      <p className="mt-1 text-sm text-red-800">
                        Ce rendez-vous a été annulé.
                      </p>
                    </div>
                  )}

                  {/* NO SHOW */}
                  {isNoShow && (
                    <div className="mt-5 rounded-2xl bg-orange-50 p-4">
                      <p className="text-sm font-medium text-orange-900">
                        Client absent
                      </p>

                      <p className="mt-1 text-sm text-orange-800">
                        Le rendez-vous a été marqué comme absence.
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>

      <ConfirmDialog
        ouvert={!!cancelTarget}
        titre="Annuler ce rendez-vous ?"
        message="Le professionnel sera informé de l'annulation. Cette action ne peut pas être annulée."
        labelConfirmer="Annuler le rendez-vous"
        labelAnnuler="Retour"
        chargement={cancelling}
        onConfirmer={cancelBooking}
        onAnnuler={() => setCancelTarget(null)}
      />
    </main>
  );
}