"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { apiFetch } from "@/lib/api";

type Service = {
  _id?: string;
  name: string;
  duration: number;
  price: number;
  currency?: string;
};
type Professional = {
  _id: string;
  displayName: string;
  city: string;
  description?: string;
  imageUrl?: string;
  rating: number;
  reviews: number;
  services?: Service[];
  profession?: { _id: string; name: string } | string;
};
export default function ProfessionalPage() {
  const params = useParams();
  const { user } = useAuth();
  const id = String(params.id);
  const [agent, setAgent] = useState<Professional | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    void apiFetch<Professional>(`/professionals/${id}`)
      .then(setAgent)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Professionnel introuvable."),
      );
  }, [id]);
  if (error)
    return (
      <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-12">
        <div className="mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Professionnel introuvable
          </h1>
          <p className="mt-3 text-gray-600">{error}</p>
          <Link
            href="/annuaire"
            className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 font-semibold text-white"
          >
            Retour à l&apos;annuaire
          </Link>
        </div>
      </main>
    );
  if (!agent)
    return <main className="min-h-screen px-4 py-12">Chargement...</main>;
  const profession =
    typeof agent.profession === "string"
      ? agent.profession
      : (agent.profession?.name ?? "");
  const isOwnProfile = user?.role === "AGENT";
  return (
    <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
              {agent.imageUrl ? (
                <img
                  src={agent.imageUrl}
                  alt={agent.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-gray-700">
                  {agent.displayName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {agent.displayName}
              </h1>
              <p className="mt-2 text-lg text-gray-600">{profession}</p>
              <p className="mt-1 text-gray-500">{agent.city}</p>
              <div className="mt-3">
                <span className="font-semibold text-gray-900">
                  ⭐ {agent.rating.toFixed(1)}
                </span>
                <span className="ml-2 text-gray-500">
                  ({agent.reviews} avis)
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 p-6 sm:p-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900">À propos</h2>
              <p className="mt-3 leading-7 text-gray-600">
                {agent.description || "Aucune description renseignée."}
              </p>
            </section>
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-gray-900">
                Services & tarifs
              </h2>
              {agent.services?.length ? (
                <div className="mt-4 space-y-3">
                  {agent.services.map((s, i) => (
                    <div
                      key={s._id ?? i}
                      className="flex items-center justify-between rounded-xl border p-4"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{s.name}</p>
                        <p className="text-sm text-gray-500">
                          {s.duration} min
                        </p>
                      </div>
                      <strong>
                        {s.price} {s.currency ?? "DT"}
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-500">
                  Aucun service renseigné.
                </p>
              )}
            </section>
            {!isOwnProfile ? (
              <div className="mt-10">
                <Link
                  href={`/rendez-vous/${id}`}
                  className="inline-flex rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
                >
                  Prendre rendez-vous
                </Link>
              </div>
            ) : (
              <div className="mt-10">
                <Link
                  href="/professionnel/espace/fiche"
                  className="inline-flex rounded-xl bg-black px-5 py-3 font-semibold text-white"
                >
                  Ma fiche complète
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
