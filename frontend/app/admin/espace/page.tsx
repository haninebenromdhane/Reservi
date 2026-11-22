"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { apiFetch } from "@/lib/api";

type Stats = {
    users: number;
    clients: number;
    agents: number;
    pendingAgents: number;
    approvedAgents: number;
    bookings: number;
    bookingsThisMonth: number;
    reviews: number;
    openReclamations: number;
};

export default function AdminSpacePage() {
    const { user, accessToken } = useAuth();

    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        if (user?.role === "ADMIN")
            void apiFetch<Stats>("/admin/stats", {
                token: accessToken ?? undefined
            })
                .then(setStats)
                .catch(() => {});
    }, [user, accessToken]);

    if (!user || user.role !== "ADMIN")
        return (
            <main className="min-h-screen p-10 text-center">
                Accès refusé
            </main>
        );

    return (
        <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-12">
            <div className="mx-auto max-w-6xl">
                <p className="text-sm font-medium text-gray-500">
                    Administration
                </p>

                <h1 className="mt-1 text-3xl font-bold text-gray-900">
                    Tableau de bord administrateur
                </h1>

                <p className="mt-2 text-gray-600">
                    Supervisez l&apos;activité de Reservi.
                </p>

                <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ["Utilisateurs", stats?.users ?? "—"],
                        ["Agents en attente", stats?.pendingAgents ?? "—"],
                        ["Réservations du mois", stats?.bookingsThisMonth ?? "—"],
                        ["Réclamations ouvertes", stats?.openReclamations ?? "—"]
                    ].map(([label, value]) => (
                        <div
                            key={String(label)}
                            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                        >
                            <p className="text-sm text-gray-500">{label}</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {value}
                            </p>
                        </div>
                    ))}
                </section>

                <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        ["Gestion agents", "/admin/espace/agent"],
                        ["Gestion clients", "/admin/espace/client"],
                        ["Professions", "/admin/espace/professions"],
                        ["Rendez-vous", "/admin/espace/rendez-vous"],
                        ["Avis", "/admin/espace/avis"],
                        ["Réclamations", "/admin/espace/reclamations"],
                        ["Journal d'audit", "/admin/espace/audit"]
                    ].map(([label, href]) => (
                        <Link
                            key={href}
                            href={href}
                            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-black"
                        >
                            <h2 className="font-semibold text-gray-900">
                                {label}
                            </h2>

                            <p className="mt-2 text-sm text-gray-600">
                                Ouvrir la gestion
                            </p>
                        </Link>
                    ))}
                </section>
            </div>
        </main>
    );
}