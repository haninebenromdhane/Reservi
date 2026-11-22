"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";

interface AuditLog {
  _id: string;
  createdAt: string;
  actorLabel?: string;
  actorRole?: string;
  actor?: { firstName?: string; lastName?: string; email?: string; role?: string };
  action: string;
  details?: string;
  targetType?: string;
  targetId?: string;
  level: "INFO" | "WARNING" | "ERROR";
}

interface AuditResponse {
  items: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function JournalAuditPage() {
  const { user, accessToken } = useAuth();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const load = useCallback(
    async (targetPage: number) => {
      if (user?.role !== "ADMIN") {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (selectedLevel !== "ALL") params.set("level", selectedLevel);
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        params.set("page", String(targetPage));
        params.set("pageSize", "20");

        const data = await apiFetch<AuditResponse>(
          `/admin/audit?${params.toString()}`,
          { token: accessToken ?? undefined },
        );

        setLogs(data.items);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger le journal d'audit.",
        );
      } finally {
        setLoading(false);
      }
    },
    [user, accessToken, selectedLevel, searchQuery],
  );

  useEffect(() => {
    void load(1);
  }, [selectedLevel, searchQuery, user, accessToken]);

  if (!user || user.role !== "ADMIN") {
    return <main className="min-h-screen p-10 text-center">Accès refusé</main>;
  }

  const actorDisplay = (log: AuditLog) => {
    if (log.actorLabel) {
      return log.actorRole ? `${log.actorLabel} (${log.actorRole})` : log.actorLabel;
    }

    if (log.actor) {
      const name = [log.actor.firstName, log.actor.lastName]
        .filter(Boolean)
        .join(" ");
      return name || log.actor.email || "Système";
    }

    return "Système";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-slide-up">
      <Link
        href="/admin/espace"
        className="text-sm font-medium text-gray-600 hover:text-black"
      >
        ← Retour au tableau de bord
      </Link>

      {/* En-tete */}
      <div className="mb-8 mt-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Console d&apos;Audit Système (Logs)</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Traçabilité en temps réel et sécurisée des actions effectuées sur la plateforme.
        </p>
      </div>

      {/* Barre de filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        
        {/* Recherche */}
        <input
          type="text"
          placeholder="Rechercher par action, utilisateur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-80 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        {/* Filtres par niveau */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["ALL", "INFO", "WARNING", "ERROR"].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedLevel === level
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {level === "ALL" ? "Tous" : level}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tableau des logs au design Console Moderne */}
      <div className=" bg-white rounded-2xl p-6  text-sm overflow-x-auto border border-slate-gray shadow-xl backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-900 text-xs uppercase tracking-wider">
              <th className="p-3">Horodatage</th>
              <th className="p-3">Niveau</th>
              <th className="p-3">Utilisateur</th>
              <th className="p-3">Action</th>
              <th className="p-3">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  Chargement du journal d&apos;audit...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  Aucun journal d&apos;audit ne correspond à vos critères.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-200 transition-colors">
                  <td className="p-3 text-slate-900 font-medium whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("fr-FR")}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-lg font-bold tracking-wide ${
                        log.level === "INFO"
                          ? " text-blue-700 border border-blue-700"
                          : log.level === "WARNING"
                          ? "text-green-700 border border-green-700"
                          : " text-rose-700 border border-rose-700"
                      }`}
                    >
                      {log.level}
                    </span>
                  </td>
                  <td className="p-3 text-slate-900 font-medium">{actorDisplay(log)}</td>
                  <td className="p-3 text-slate-900 font-medium">{log.action}</td>
                  <td className="p-3 text-slate-900 font-medium">{log.details ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <span>
            Page {page} sur {totalPages} · {total} entrée{total > 1 ? "s" : ""}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => void load(page - 1)}
              className="rounded-xl border border-slate-300 px-3 py-1.5 font-medium disabled:opacity-40"
            >
              Précédent
            </button>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => void load(page + 1)}
              className="rounded-xl border border-slate-300 px-3 py-1.5 font-medium disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
