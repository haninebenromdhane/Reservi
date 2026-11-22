"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import {
  useAuth,
} from "@/components/auth/AuthContext";

import {
  apiFetch,
  getApiUrl,
} from "@/lib/api";

type Service = {
  _id: string;
  name: string;
  duration: number;
  price: number;
  currency?: string;
};

type DocumentFile = {
  _id?: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
};

type Profile = {
  _id: string;
  displayName: string;
  licenseNumber?: string;
  city: string;
  address?: string;
  phone?: string;
  description?: string;
  imageUrl?: string;
  rating: number;
  reviews: number;
  status: string;
  profession?: {
    _id: string;
    name: string;
  };
  services?: Service[];
  documents?: DocumentFile[];
};

export default function MyProfessionalFiche() {
  const {
    user,
    accessToken,
  } = useAuth();

  const [
    profile,
    setProfile,
  ] =
    useState<Profile | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (user?.role !== "AGENT") {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const data =
          await apiFetch<Profile>(
            "/professionals/me",
            {
              token:
                accessToken ??
                undefined,
            },
          );

        setProfile(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger votre fiche.",
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [
    user,
    accessToken,
  ]);

  if (
    !user ||
    user.role !== "AGENT"
  ) {
    return (
      <main className="min-h-screen p-10 text-center">
        Accès refusé.
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen p-10 text-center">
        Chargement de votre fiche...
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-red-800">
            Fiche professionnelle introuvable
          </h1>

          <p className="mt-3 text-red-700">
            {error}
          </p>

          <Link
            href="/professionnel/espace/profil"
            className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 font-semibold text-white"
          >
            Modifier mon profil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen backdrop-blur-sm rounded-3xl px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
              Ma fiche professionnelle
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              {profile.displayName}
            </h1>
          </div>

          <div className="flex gap-3">
            <Link
              href="/professionnel/espace/profil"
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold"
            >
              Modifier mon profil
            </Link>

            <Link
              href="/professionnel/espace"
              className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
            >
              Retour
            </Link>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <section className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-gray-100 text-3xl font-bold text-gray-700">
                {profile.imageUrl ? (
                  <img
                    src={profile.imageUrl}
                    alt={profile.displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile.displayName
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Profession
                </p>

                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {profile.profession?.name ??
                    "Profession non renseignée"}
                </p>

                <p className="mt-2 text-gray-600">
                  {profile.city}
                  {profile.address
                    ? ` · ${profile.address}`
                    : ""}
                </p>

                <div className="mt-3 text-sm text-gray-700">
                  ⭐{" "}
                  {profile.rating.toFixed(
                    1,
                  )}{" "}
                  · {profile.reviews} avis
                </div>

                <span className="mt-4 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                  {profile.status}
                </span>
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900">
                À propos
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                {profile.description ||
                  "Aucune description renseignée."}
              </p>
            </div>
          </section>

          <section className="border-t border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Informations professionnelles
            </h2>

            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">
                  Licence professionnelle
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {profile.licenseNumber ||
                    "Non renseignée"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Téléphone
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {profile.phone ||
                    "Non renseigné"}
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Services & tarifs
            </h2>

            {!profile.services ||
            profile.services.length ===
              0 ? (
              <p className="mt-4 text-sm text-gray-500">
                Aucun service enregistré.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {profile.services.map(
                  (service) => (
                    <div
                      key={service._id}
                      className="flex items-center justify-between rounded-2xl border border-gray-200 p-5"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {service.name}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {service.duration} minutes
                        </p>
                      </div>

                      <strong className="text-gray-900">
                        {service.price}{" "}
                        {service.currency ??
                          "DT"}
                      </strong>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

          <section className="border-t border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Documents de validation
            </h2>

            {!profile.documents ||
            profile.documents.length ===
              0 ? (
              <p className="mt-4 text-sm text-gray-500">
                Aucun document enregistré.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {profile.documents.map(
                  (document) => (
                    <a
                      key={
                        document._id ??
                        document.url
                      }
                      href={`${getApiUrl()}${document.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl border border-gray-200 p-4 text-sm font-semibold text-blue-600 hover:underline"
                    >
                      {document.name}
                    </a>
                  ),
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}