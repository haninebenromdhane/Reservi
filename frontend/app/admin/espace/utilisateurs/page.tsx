"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { apiFetch } from "@/lib/api";

type User = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
};

export default function AdminClientsPage() {
    const { user, accessToken } = useAuth();
    const [users, setUsers] = useState<User[]>([]);

    const load = async () => {
        try {
            setUsers(
                await apiFetch<User[]>("/admin/users", {
                    token: accessToken ?? undefined
                })
            );
        } catch {
            setUsers([]);
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

    const toggle = async (u: User) => {
        const status =
            u.status === "SUSPENDED"
                ? "ACTIVE"
                : "SUSPENDED";

        try {
            await apiFetch(`/admin/users/${u._id}/status`, {
                method: "PATCH",
                token: accessToken ?? undefined,
                body: JSON.stringify({ status })
            });

            await load();
        } catch {}
    };

    return (
        <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-12">
            <div className="mx-auto max-w-6xl">
                <Link
                    href="/admin/espace"
                    className="text-sm font-medium text-gray-600 hover:text-black"
                >
                    ← Retour au tableau de bord
                </Link>

                <h1 className="mt-8 text-3xl font-bold text-gray-900">
                    Utilisateurs
                </h1>

                <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                    <div className="divide-y divide-gray-100">
                        {users.map((u) => (
                            <div
                                key={u._id}
                                className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        {u.firstName} {u.lastName}
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-600">
                                        {u.email} · {u.role}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <span className="rounded-full bg-gray-100 px-4 py-2 text-sm">
                                        {u.status}
                                    </span>

                                    {u.role !== "ADMIN" && (
                                        <button
                                            onClick={() => toggle(u)}
                                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold"
                                        >
                                            {u.status === "SUSPENDED"
                                                ? "Réactiver"
                                                : "Suspendre"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}