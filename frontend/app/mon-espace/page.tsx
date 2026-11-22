"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";

const reservations = [
  {
    id: "1",
    professional: "Dr. Amine Ben Salah",
    profession: "Médecin",
    service: "Consultation",
    date: "25 août 2026",
    time: "10:00",
    status: "CONFIRMED",
  },
  {
    id: "2",
    professional: "Nour Coiffure",
    profession: "Coiffeur",
    service: "Coiffure femme",
    date: "12 août 2026",
    time: "14:30",
    status: "COMPLETED",
  },
];

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
  NO_SHOW: "Absent",
};

export default function MonEspacePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Connexion nécessaire
          </h1>

          <p className="mt-3 text-gray-600">
            Connectez-vous pour accéder à votre espace personnel.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div>
          <p className="text-sm font-medium text-gray-500">
            Mon espace
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Bonjour {user.firstName}
          </h1>

          <p className="mt-2 text-gray-600">
            Retrouvez ici vos rendez-vous et votre activité sur Reservi.
          </p>
        </div>

        {/* User information */}
        <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Mes informations
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Nom
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
            </div>

            <div> 
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Type de compte
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {user.role === "CLIENT" ? "Client" : "Agent"}
              </p>
            </div>
          </div>
        </section>

        {/* Reservations */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Mes rendez-vous
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Consultez vos rendez-vous à venir et passés.
              </p>
            </div>

            <Link
              href="/annuaire"
              className="hidden rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 sm:inline-flex"
            >
              Trouver un professionnel
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reservation.professional}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {reservation.profession}
                    </p>

                    <p className="mt-3 text-sm text-gray-700">
                      {reservation.service}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {reservation.date} à {reservation.time}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                      {statusLabels[reservation.status]}
                    </span>
                  </div>

                </div>

                {/* Review available only after completed appointment */}
                {reservation.status === "COMPLETED" && (
                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <Link
                      href={`/avis/${reservation.id}`}
                      className="text-sm font-semibold text-gray-900 hover:underline"
                    >
                      Laisser un avis
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Mobile action */}
        <div className="mt-8 sm:hidden">
          <Link
            href="/annuaire"
            className="flex w-full justify-center rounded-xl bg-black px-5 py-3 font-semibold text-white"
          >
            Trouver un professionnel
          </Link>
        </div>

      </div>
    </main>
  );
}