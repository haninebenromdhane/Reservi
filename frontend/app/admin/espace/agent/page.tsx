"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

type Agent = {
  _id: string;
  displayName: string;
  city: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isVisible?: boolean;
  rejectionReason?: string;
  profession?: { name: string };
  user?: { firstName: string; lastName: string; email: string; status: string };
  documents?: { _id: string; name: string; url: string }[];
};

type EffectiveState = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";

function effectiveState(agent: Agent): EffectiveState {
  if (agent.status === "PENDING") return "PENDING";
  if (agent.status === "REJECTED") return "REJECTED";
  if (agent.user?.status === "SUSPENDED" || agent.isVisible === false) {
    return "SUSPENDED";
  }
  return "ACTIVE";
}

const stateLabels: Record<EffectiveState, string> = {
  PENDING: "En attente de validation",
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
  REJECTED: "Refusé",
};

const stateColors: Record<EffectiveState, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-green-100 text-green-800",
  SUSPENDED: "bg-orange-100 text-orange-800",
  REJECTED: "bg-red-100 text-red-800",
};

type PendingAction =
  | { kind: "REJECT"; agent: Agent }
  | { kind: "SUSPEND"; agent: Agent }
  | { kind: "REACTIVATE"; agent: Agent }
  | { kind: "DELETE"; agent: Agent };

export default function AdminAgentsPage() {
  const { user, accessToken } = useAuth();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | EffectiveState>("ALL");

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const load = async () => {
    try {
      setAgents(await apiFetch<Agent[]>("/admin/agents", { token: accessToken ?? undefined }));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de charger les agents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") void load();
  }, [user, accessToken]);

  if (!user || user.role !== "ADMIN")
    return <main className="min-h-screen p-10 text-center">Accès refusé</main>;

  const approve = async (id: string) => {
    setBusyId(id);
    setError("");
    try {
      await apiFetch(`/admin/agents/${id}/validate`, {
        method: "PATCH",
        token: accessToken ?? undefined,
        body: JSON.stringify({ action: "APPROVE" }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action impossible.");
    } finally {
      setBusyId(null);
    }
  };

  const runPendingAction = async () => {
    if (!pendingAction) return;
    const { kind, agent } = pendingAction;
    setBusyId(agent._id);
    setError("");

    try {
      if (kind === "REJECT") {
        await apiFetch(`/admin/agents/${agent._id}/validate`, {
          method: "PATCH",
          token: accessToken ?? undefined,
          body: JSON.stringify({
            action: "REJECT",
            reason: "Dossier rejeté par l'administrateur.",
          }),
        });
      } else if (kind === "SUSPEND") {
        await apiFetch(`/admin/agents/${agent._id}/suspend`, {
          method: "PATCH",
          token: accessToken ?? undefined,
        });
      } else if (kind === "REACTIVATE") {
        await apiFetch(`/admin/agents/${agent._id}/reactivate`, {
          method: "PATCH",
          token: accessToken ?? undefined,
        });
      } else if (kind === "DELETE") {
        await apiFetch(`/admin/agents/${agent._id}`, {
          method: "DELETE",
          token: accessToken ?? undefined,
        });
      }

      setPendingAction(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action impossible.");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = filter === "ALL" ? agents : agents.filter((a) => effectiveState(a) === filter);

  const confirmCopy: Record<
    PendingAction["kind"],
    { titre: string; message: string; label: string }
  > = {
    REJECT: {
      titre: "Rejeter cette fiche ?",
      message:
        "L'agent ne sera pas visible sur la plateforme. Vous pourrez revenir sur ce refus plus tard.",
      label: "Rejeter",
    },
    SUSPEND: {
      titre: "Suspendre cet agent ?",
      message:
        "Son compte et sa fiche seront masqués de la plateforme jusqu'à réactivation.",
      label: "Suspendre",
    },
    REACTIVATE: {
      titre: "Réactiver cet agent ?",
      message: "L'agent redeviendra actif et visible sur la plateforme.",
      label: "Réactiver",
    },
    DELETE: {
      titre: "Supprimer définitivement cette fiche ?",
      message: "Cette action est irréversible et supprimera la fiche professionnelle.",
      label: "Supprimer",
    },
  };

  return (
    <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/espace" className="text-sm font-medium text-gray-600 hover:text-black">
          ← Retour au tableau de bord
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-gray-900">Gestion des agents</h1>
        <p className="mt-2 text-gray-600">
          Validez les nouvelles inscriptions, suspendez ou réactivez les comptes agents.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["ALL", "PENDING", "ACTIVE", "SUSPENDED", "REJECTED"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                filter === key ? "bg-black text-white" : "border border-gray-300 text-gray-700"
              }`}
            >
              {key === "ALL" ? "Tous" : stateLabels[key]}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <section className="mt-8 space-y-5">
          {loading ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-8">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-8">Aucun agent.</div>
          ) : (
            filtered.map((a) => {
              const state = effectiveState(a);
              const isBusy = busyId === a._id;

              return (
                <div key={a._id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{a.displayName}</h2>
                      <p className="mt-1 text-gray-600">
                        {a.profession?.name ?? ""} · {a.city}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">{a.user?.email ?? ""}</p>

                      {state === "REJECTED" && a.rejectionReason && (
                        <p className="mt-2 text-sm text-red-600">Motif : {a.rejectionReason}</p>
                      )}

                      <Link
                        href={`/admin/espace/professionnels/${a._id}`}
                        className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:underline"
                      >
                        Voir la fiche complète →
                      </Link>
                    </div>

                    <span className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${stateColors[state]}`}>
                      {stateLabels[state]}
                    </span>
                  </div>

                  {a.documents?.length ? (
                    <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                      <p className="text-sm font-semibold text-gray-900">Documents du dossier</p>
                      <div className="mt-2 space-y-1">
                        {a.documents.map((d) => (
                          <a
                            key={d._id}
                            href={`http://localhost:4000${d.url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-sm text-blue-600 hover:underline"
                          >
                            {d.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-wrap gap-3">
                    {state === "PENDING" && (
                      <>
                        <button
                          type="button"
                          onClick={() => approve(a._id)}
                          disabled={isBusy}
                          className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Valider
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingAction({ kind: "REJECT", agent: a })}
                          disabled={isBusy}
                          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                        >
                          Rejeter
                        </button>
                      </>
                    )}

                    {state === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => setPendingAction({ kind: "SUSPEND", agent: a })}
                        disabled={isBusy}
                        className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 disabled:opacity-50"
                      >
                        Suspendre
                      </button>
                    )}

                    {(state === "SUSPENDED" || state === "REJECTED") && (
                      <button
                        type="button"
                        onClick={() => setPendingAction({ kind: "REACTIVATE", agent: a })}
                        disabled={isBusy}
                        className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Réactiver
                      </button>
                    )}

                    {state !== "PENDING" && (
                      <button
                        type="button"
                        onClick={() => setPendingAction({ kind: "DELETE", agent: a })}
                        disabled={isBusy}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>

      <ConfirmDialog
        ouvert={!!pendingAction}
        titre={pendingAction ? confirmCopy[pendingAction.kind].titre : ""}
        message={pendingAction ? confirmCopy[pendingAction.kind].message : ""}
        labelConfirmer={pendingAction ? confirmCopy[pendingAction.kind].label : "Confirmer"}
        danger={pendingAction?.kind !== "REACTIVATE"}
        chargement={busyId === pendingAction?.agent._id}
        onConfirmer={runPendingAction}
        onAnnuler={() => setPendingAction(null)}
      />
    </main>
  );
}
