"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DirectoryFilters from "@/components/annuaire/DirectoryFilters";
import { apiFetch } from "@/lib/api";

type Professional = { _id: string; displayName: string; city: string; description?: string; imageUrl?: string; rating: number; reviews: number; profession?: { _id: string; name: string } | string };
type Filters = { profession: string; ville: string; keyword: string; sort: string };

function AnnuaireContent() {
  const searchParams = useSearchParams();
  const initialFilters = useMemo<Filters>(() => ({ profession: searchParams.get("profession") ?? searchParams.get("metier") ?? "", ville: searchParams.get("ville") ?? "", keyword: searchParams.get("keyword") ?? "", sort: "rating" }), [searchParams]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [agents, setAgents] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError("");
      try {
        const params = new URLSearchParams();
        if (filters.profession) params.set("profession", filters.profession);
        if (filters.ville) params.set("city", filters.ville);
        if (filters.keyword) params.set("keyword", filters.keyword);
        if (filters.sort) params.set("sort", filters.sort);
        params.set("page", "1"); params.set("pageSize", "20");
        const data = await apiFetch<{ items: Professional[]; total: number }>(`/professionals?${params.toString()}`);
        setAgents(data.items ?? []);
      } catch (err) { setError(err instanceof Error ? err.message : "Impossible de charger l'annuaire."); }
      finally { setLoading(false); }
    };
    void load();
  }, [filters]);

  return <main className="backdrop-blur-sm px-4 py-12 sm:py-16"><div className="mx-auto max-w-7xl">
    <div className="text-center"><h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Annuaire des professionnels</h1><p className="mx-auto mt-4 max-w-2xl text-gray-600">Trouvez un professionnel et consultez sa fiche pour découvrir ses informations et ses disponibilités.</p></div>
    <div className="mt-10"><DirectoryFilters onSearch={setFilters} /></div>
    {error && <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <div className="mt-10"><p className="mb-6 text-sm text-gray-600">{loading ? "Chargement..." : `${agents.length} professionnel${agents.length !== 1 ? "s" : ""} trouvé${agents.length !== 1 ? "s" : ""}`}</p>
      {loading ? <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">Chargement...</div> : agents.length === 0 ? <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center"><h2 className="text-lg font-semibold text-gray-900">Aucun professionnel trouvé</h2><p className="mt-2 text-sm text-gray-600">Essayez de modifier vos critères de recherche.</p></div> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{agents.map(agent => { const profession = typeof agent.profession === "string" ? agent.profession : agent.profession?.name ?? ""; return <article key={agent._id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-gray-900">{agent.displayName}</h2><p className="mt-2 text-sm text-gray-600">{profession}</p><p className="mt-1 text-sm text-gray-500">{agent.city}</p><div className="mt-4"><span className="text-sm font-semibold text-gray-900">⭐ {agent.rating.toFixed(1)}</span><span className="ml-2 text-sm text-gray-500">({agent.reviews} avis)</span></div><div className="mt-6 grid gap-2 sm:grid-cols-2"><Link href={`/professionnel/${agent._id}`} className="block rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-800 transition hover:bg-gray-50">Voir la fiche</Link><Link href={`/rendez-vous/${agent._id}`} className="block rounded-xl bg-black px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800">Prendre rendez-vous</Link></div></article>; })}</div>}
    </div></div></main>;
}
export default function AnnuairePage() { return <Suspense fallback={<div className="p-10 text-center text-gray-500">Chargement...</div>}><AnnuaireContent /></Suspense>; }
