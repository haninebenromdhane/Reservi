"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
type Professional = {
  _id: string;
  displayName: string;
  city: string;
  rating: number;
  reviews: number;
  profession?: { name: string };
};
export default function BestRatedSection() {
  const [agents, setAgents] = useState<Professional[]>([]);
  useEffect(() => {
    void apiFetch<{ items: Professional[] }>(
      "/professionals?page=1&pageSize=3&sort=rating",
    )
      .then((d) => setAgents(d.items ?? []))
      .catch(() => setAgents([]));
  }, []);
  return (
    <section className="backdrop-blur-sm p-10 rounded-3xlpx-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Les mieux notés
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Best Rated
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Découvrez les professionnels les mieux évalués par nos utilisateurs.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <article
              key={agent._id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {agent.displayName}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {agent.profession?.name ?? ""}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{agent.city}</p>
                  </div>
                  <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-900">
                    ⭐ {agent.rating.toFixed(1)}
                  </div>
                </div>
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500">{agent.reviews} avis</p>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  href={`/professionnel/${agent._id}`}
                  className="mt-4 block w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                >
                  Voir la fiche
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
