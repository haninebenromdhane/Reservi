"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { apiFetch } from "@/lib/api";

type Rec = {
    _id: string;
    subject: string;
    message: string;
    status: string;
    createdAt: string;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
    };
};

export default function ModerationReclamationsPage() {
    const { user, accessToken } = useAuth();
    const [items, setItems] = useState<Rec[]>([]);

    const load = async () => {
        try {
            setItems(
                await apiFetch<Rec[]>("/reclamations/admin/all", {
                    token: accessToken ?? undefined
                })
            );
        } catch {
            setItems([]);
        }
    };

    useEffect(() => {
        if (user?.role === "ADMIN")
            void load();
    }, [user, accessToken]);

    if (!user || user.role !== "ADMIN")
        return (
            <main className="min-h-screen p-10 text-center">
                Accès refusé
            </main>
        );

    const update = async (id: string, status: string) => {
        await apiFetch(`/reclamations/admin/${id}`, {
            method: "PATCH",
            token: accessToken ?? undefined,
            body: JSON.stringify({
                status,
                adminResponse: "Traitée par l'administrateur."
            })
        });

        await load();
    };

    return (
        <main className="max-w-5xl mx-auto p-6">
            <Link
                href="/admin/espace"
                className="text-sm text-gray-600"
            >
                ← Retour
            </Link>

            <h1 className="text-2xl font-bold mb-6 mt-6">
                Gestion des Signalements & Réclamations
            </h1>

            <div className="space-y-4">
                {items.map((r) => (
                    <div
                        key={r._id}
                        className="bg-white border rounded-lg p-4 shadow-sm"
                    >
                        <p className="font-semibold">
                            {r.subject}
                        </p>

                        <p className="text-sm text-gray-500">
                            {r.user?.firstName} {r.user?.lastName} ·{" "}
                            {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                        </p>

                        <p className="mt-2 text-gray-600">
                            {r.message}
                        </p>

                        <p className="mt-2 text-sm font-medium">
                            {r.status}
                        </p>

                        {r.status !== "RESOLVED" &&
                            r.status !== "CLOSED" && (
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() =>
                                            update(r._id, "RESOLVED")
                                        }
                                        className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                                    >
                                        Traiter
                                    </button>

                                    <button
                                        onClick={() =>
                                            update(r._id, "CLOSED")
                                        }
                                        className="px-3 py-1 bg-gray-400 text-white rounded text-sm"
                                    >
                                        Clôturer
                                    </button>
                                </div>
                            )}
                    </div>
                ))}
            </div>
        </main>
    );
}