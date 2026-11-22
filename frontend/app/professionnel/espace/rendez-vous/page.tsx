"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiFetch } from "@/lib/api";
import ModalReclamation from "@/components/shared/ModalReclamation";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import AgendaCalendar from "@/components/professionnel/AgendaCalendar";
import { useAuth } from "@/components/auth/AuthContext";

type Booking = {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;

  clientMessage?: string;
  clientNote?: string;

  serviceName?: string;
  servicePrice?: number;

  client?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
};

const statusLabels: Record<
  string,
  string
> = {
  PENDING: "En attente",
  CONFIRMED: "Accepté",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
  NO_SHOW: "Client absent",
};

type PendingConfirmation =
  | { kind: "REFUSE"; booking: Booking }
  | null;

export default function ProfessionalRendezVousPage() {
  const {
    accessToken,
  } = useAuth();

  const [
    bookings,
    setBookings,
  ] = useState<Booking[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    reportBooking,
    setReportBooking,
  ] =
    useState<Booking | null>(
      null,
    );

  const [
    pendingConfirmation,
    setPendingConfirmation,
  ] = useState<PendingConfirmation>(null);

  const [
    confirmationBusy,
    setConfirmationBusy,
  ] = useState(false);

  const [
    selectedDate,
    setSelectedDate,
  ] = useState<string | null>(null);

  const load =
    useCallback(async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const data =
          await apiFetch<Booking[]>(
            "/bookings/professional/me",
            {
              token:
                accessToken,
            },
          );

        /*
         * Rejected requests are not shown
         * in the professional's active agenda.
         */
        setBookings(
          data.filter(
            (booking) =>
              booking.status !==
              "REJECTED",
          ),
        );

        setError("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les rendez-vous.",
        );
      } finally {
        setLoading(false);
      }
    }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  /*
   * New client requests appear automatically.
   */
  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          void load();
        },
        5000,
      );

    return () =>
      window.clearInterval(
        interval,
      );
  }, [
    accessToken,
    load,
  ]);

  const updateStatus =
    async (
      id: string,
      status:
        | "CONFIRMED"
        | "REJECTED"
        | "COMPLETED"
        | "NO_SHOW",
    ) => {
      setError("");

      try {
        await apiFetch(
          `/bookings/${id}/status`,
          {
            method: "PATCH",
            token:
              accessToken ??
              undefined,
            body: JSON.stringify({
              status,
            }),
          },
        );

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de modifier le rendez-vous.",
        );
      }
    };

  const confirmRefuse = async () => {
    if (!pendingConfirmation) return;
    setConfirmationBusy(true);
    await updateStatus(pendingConfirmation.booking._id, "REJECTED");
    setConfirmationBusy(false);
    setPendingConfirmation(null);
  };

  const pendingCount =
    bookings.filter(
      (booking) =>
        booking.status ===
        "PENDING",
    ).length;

  const calendarBookings = useMemo(
    () =>
      bookings.map((booking) => ({
        id: booking._id,
        date: booking.date,
        status: booking.status,
      })),
    [bookings],
  );

  const visibleBookings = useMemo(() => {
    if (!selectedDate) return bookings;
    return bookings.filter(
      (booking) => booking.date.slice(0, 10) === selectedDate,
    );
  }, [bookings, selectedDate]);

  return (
    <main className="min-h-screen backdrop-blur-sm rounded-3xl px-4 py-12 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/professionnel/espace"
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Retour à mon espace professionnel
        </Link>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mon agenda
            </h1>

            <p className="mt-2 text-gray-600">
              Gérez les demandes et rendez-vous de vos clients.
            </p>
          </div>

          {pendingCount >
            0 && (
            <div className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-800">
              {pendingCount} demande
              {pendingCount >
              1
                ? "s"
                : ""}{" "}
              en attente
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="mt-8">
            <AgendaCalendar
              bookings={calendarBookings}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-8">
            Chargement...
          </div>
        ) : bookings.length ===
          0 ? (
          <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-8 text-center">
            Aucun rendez-vous.
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {selectedDate && visibleBookings.length === 0 && (
              <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center text-gray-500">
                Aucun rendez-vous ce jour-là.
              </div>
            )}

            {visibleBookings.map(
              (booking) => (
                <article
                  key={
                    booking._id
                  }
                  className={`rounded-3xl border bg-white p-6 shadow-sm ${
                    booking.status ===
                    "PENDING"
                      ? "border-yellow-300"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {new Date(
                          booking.date,
                        ).toLocaleDateString(
                          "fr-FR",
                        )}
                      </p>

                      <h2 className="mt-1 text-xl font-semibold text-gray-900">
                        {booking
                          .client
                          ?.firstName}{" "}
                        {booking
                          .client
                          ?.lastName}
                      </h2>

                      <p className="mt-2 text-sm text-gray-600">
                        {booking
                          .client
                          ?.email}
                      </p>

                      {booking
                        .client
                        ?.phone && (
                        <p className="text-sm text-gray-600">
                          {
                            booking
                              .client
                              .phone
                          }
                        </p>
                      )}

                      <p className="mt-3 text-sm font-medium text-gray-900">
                        {
                          booking.startTime
                        }{" "}
                        →{" "}
                        {
                          booking.endTime
                        }
                      </p>

                      {booking.serviceName && (
                        <p className="mt-2 text-sm text-gray-600">
                          Service :{" "}
                          <span className="font-medium text-gray-900">
                            {
                              booking.serviceName
                            }
                          </span>
                        </p>
                      )}

                      {typeof booking.servicePrice ===
                        "number" && (
                        <p className="text-sm text-gray-600">
                          Tarif :{" "}
                          <span className="font-medium text-gray-900">
                            {
                              booking.servicePrice
                            }{" "}
                            DT
                          </span>
                        </p>
                      )}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        booking.status ===
                        "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status ===
                              "CONFIRMED"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {statusLabels[
                        booking.status
                      ] ??
                        booking.status}
                    </span>
                  </div>

                  {booking.clientMessage && (
                    <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                      <p className="text-sm font-medium text-gray-900">
                        Message du client
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {
                          booking.clientMessage
                        }
                      </p>
                    </div>
                  )}

                  {booking.clientNote && (
                    <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                      <p className="text-sm font-medium text-gray-900">
                        Note du client
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {
                          booking.clientNote
                        }
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    {booking.status ===
                      "PENDING" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(
                              booking._id,
                              "CONFIRMED",
                            )
                          }
                          className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
                        >
                          Accepter
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setPendingConfirmation({
                              kind: "REFUSE",
                              booking,
                            })
                          }
                          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                        >
                          Refuser
                        </button>
                      </>
                    )}

                    {booking.status ===
                      "CONFIRMED" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(
                            booking._id,
                            "COMPLETED",
                          )
                        }
                        className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
                      >
                        Marquer comme terminé
                      </button>
                    )}

                    {booking.status ===
                      "COMPLETED" &&
                      booking.client && (
                        <button
                          type="button"
                          onClick={() =>
                            setReportBooking(
                              booking,
                            )
                          }
                          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                        >
                          Signaler le client
                        </button>
                      )}
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </div>

      {reportBooking?.client && (
        <ModalReclamation
          utilisateurCibleId={
            reportBooking
              .client
              ._id
          }
          nomCible={`${reportBooking.client.firstName} ${reportBooking.client.lastName}`}
          bookingId={
            reportBooking._id
          }
          type="AGENT_REPORT_CLIENT"
          estOuvert={true}
          onFermer={() =>
            setReportBooking(null)
          }
        />
      )}

      <ConfirmDialog
        ouvert={!!pendingConfirmation}
        titre="Refuser cette demande ?"
        message="Le client sera informé que sa demande de rendez-vous n'a pas été acceptée."
        labelConfirmer="Refuser"
        chargement={confirmationBusy}
        onConfirmer={confirmRefuse}
        onAnnuler={() => setPendingConfirmation(null)}
      />
    </main>
  );
}
