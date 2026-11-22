"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { apiFetch } from "@/lib/api";

type Booking = {
  status: string;
};

export default function ClientEspacePage() {
  const { user, accessToken } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (user?.role !== "CLIENT") return;

    const loadBookings = async () => {
      try {
        const bookings = await apiFetch<Booking[]>("/bookings/me", {
          token: accessToken ?? undefined,
        });

        setCount(
          bookings.filter((booking) =>
            ["PENDING", "CONFIRMED"].includes(booking.status),
          ).length,
        );
      } catch {
        // Keep the dashboard usable if bookings cannot be loaded.
      }
    };

    void loadBookings();
  }, [user, accessToken]);

  if (!user) {
    return (
      <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Connexion nécessaire
          </h1>

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

  return (
    <main className="min-h-screen backdrop-blur-sm px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-medium text-gray-500">Mon espace</p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Bonjour {user.firstName}
        </h1>

        <p className="mt-2 text-gray-600">
          Retrouvez ici vos rendez-vous et votre activité sur Reservi.
        </p>

        <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Mes informations
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Nom</p>
              <p className="mt-1 font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="mt-1 font-medium text-gray-900">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Rendez-vous à venir
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {count}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/annuaire"
            className="rounded-xl bg-black px-5 py-3 font-semibold text-white"
          >
            Trouver un professionnel
          </Link>

          <Link
            href="/client/espace/rendez-vous"
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-800"
          >
            Mes rendez-vous
          </Link>

          <Link
            href="/client/espace/profil"
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-800"
          >
            Mon profil
          </Link>
        </div>
      </div>
    </main>
  );
}