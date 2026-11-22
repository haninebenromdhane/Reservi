"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { apiFetch } from "@/lib/api";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

type Booking = {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    client?: {
        firstName: string;
        lastName: string;
    };
    professional?: {
        displayName: string;
    };
};

export default function AdminAppointmentsPage() {
    const { user, accessToken } = useAuth();
    const [items, setItems] = useState<Booking[]>([]);
    const [confirmTarget, setConfirmTarget] = useState<Booking | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (user?.role === "ADMIN")
            void apiFetch<Booking[]>("/admin/bookings", {
                token: accessToken ?? undefined
            })
                .then(setItems)
                .catch(() => setItems([]));
    }, [user, accessToken]);

    if (!user || user.role !== "ADMIN")
        return (
            <main className="min-h-screen p-10 text-center">
                Accès refusé
            </main>
        );

    const cancel = async () => {
        if (!confirmTarget) return;

        setBusy(true);

        try {
            await apiFetch(
                `/admin/bookings/${confirmTarget._id}/cancel`,
                {
                    method: "PATCH",
                    token: accessToken ?? undefined
                }
            );

            setItems((x) =>
                x.map((b) =>
                    b._id === confirmTarget._id
                        ? { ...b, status: "CANCELLED" }
                        : b
                )
            );

            setConfirmTarget(null);
        } finally {
            setBusy(false);
        }
    };

    return (
        <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-12">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/admin/espace"
                    className="text-sm font-medium text-gray-600 hover:text-black"
                >
                    ← Retour au tableau de bord
                </Link>

                <h1 className="mt-6 text-3xl font-bold">
                    Rendez-vous
                </h1>

                <div className="mt-8 space-y-4">
                    {items.map((b) => (
                        <div
                            key={b._id}
                            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                        >
                            <p className="font-semibold">
                                {b.client?.firstName} {b.client?.lastName}
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                                {b.professional?.displayName}
                            </p>

                            <p className="mt-2 text-sm">
                                {new Date(b.date).toLocaleDateString("fr-FR")} ·{" "}
                                {b.startTime} → {b.endTime}
                            </p>

                            <p className="mt-2 text-sm font-medium">
                                {b.status}
                            </p>

                            {!["CANCELLED", "COMPLETED", "REJECTED"].includes(
                                b.status
                            ) && (
                                <button
                                    onClick={() => setConfirmTarget(b)}
                                    className="mt-4 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                                >
                                    Annuler
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <ConfirmDialog
                ouvert={!!confirmTarget}
                titre="Annuler ce rendez-vous ?"
                message="Le client et le professionnel seront informés de l'annulation forcée."
                labelConfirmer="Annuler le rendez-vous"
                chargement={busy}
                onConfirmer={cancel}
                onAnnuler={() => setConfirmTarget(null)}
            />
        </main>
    );
}