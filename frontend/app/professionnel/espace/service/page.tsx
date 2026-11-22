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
} from "@/lib/api";

type Service = {
  _id: string;
  name: string;
  duration: number;
  price: number;
  currency?: string;
};

type Profile = {
  services: Service[];
};

export default function ProfessionalServicesPage() {
  const {
    user,
    accessToken,
  } = useAuth();

  const [
    services,
    setServices,
  ] =
    useState<Service[]>([]);

  const [
    name,
    setName,
  ] = useState("");

  const [
    duration,
    setDuration,
  ] = useState("30");

  const [
    price,
    setPrice,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    adding,
    setAdding,
  ] = useState(false);

  useEffect(() => {
    if (user?.role !== "AGENT") {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const profile =
          await apiFetch<Profile>(
            "/professionals/me",
            {
              token:
                accessToken ??
                undefined,
            },
          );

        setServices(
          profile.services ??
            [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les services.",
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

  const add =
    async (
      event: React.FormEvent,
    ) => {
      event.preventDefault();

      setError("");
      setMessage("");

      if (!name.trim()) {
        setError(
          "Le nom du service est obligatoire.",
        );
        return;
      }

      const numericDuration =
        Number(duration);

      const numericPrice =
        Number(price);

      if (
        !Number.isFinite(
          numericDuration,
        ) ||
        numericDuration < 1
      ) {
        setError(
          "La durée est invalide.",
        );
        return;
      }

      if (
        !Number.isFinite(
          numericPrice,
        ) ||
        numericPrice < 0
      ) {
        setError(
          "Le prix est invalide.",
        );
        return;
      }

      setAdding(true);

      try {
        const profile =
          await apiFetch<Profile>(
            "/professionals/me/services",
            {
              method: "POST",
              token:
                accessToken ??
                undefined,
              body: JSON.stringify({
                name:
                  name.trim(),
                duration:
                  numericDuration,
                price:
                  numericPrice,
                currency: "DT",
              }),
            },
          );

        setServices(
          profile.services ??
            [],
        );

        setName("");
        setDuration("30");
        setPrice("");

        setMessage(
          "Service ajouté avec succès.",
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible d'ajouter le service.",
        );
      } finally {
        setAdding(false);
      }
    };

  const remove =
    async (
      serviceId: string,
    ) => {
      setError("");
      setMessage("");

      try {
        const profile =
          await apiFetch<Profile>(
            `/professionals/me/services/${serviceId}`,
            {
              method: "DELETE",
              token:
                accessToken ??
                undefined,
            },
          );

        setServices(
          profile.services ??
            [],
        );

        setMessage(
          "Service supprimé.",
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de supprimer le service.",
        );
      }
    };

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
        Chargement...
      </main>
    );
  }

  return (
    <main className="min-h-screen backdrop-blur-sm rounded-3xl px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/professionnel/espace"
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Retour à mon espace
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-gray-900">
          Mes services
        </h1>

        <p className="mt-2 text-gray-600">
          Ajoutez les prestations que vous proposez et leurs tarifs.
        </p>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <form
          onSubmit={add}
          className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-gray-900">
            Ajouter un service
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <input
              required
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="Nom du service (ex. Consultation)"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
            />

            <select
              value={duration}
              onChange={(event) =>
                setDuration(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
            >
              <option value="15">
                15 minutes
              </option>

              <option value="30">
                30 minutes
              </option>

              <option value="45">
                45 minutes
              </option>

              <option value="60">
                60 minutes
              </option>

              <option value="90">
                90 minutes
              </option>

              <option value="120">
                120 minutes
              </option>
            </select>

            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) =>
                setPrice(
                  event.target.value,
                )
              }
              placeholder="Prix du service en DT"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={adding}
            className="mt-6 rounded-xl bg-black px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {adding
              ? "Ajout..."
              : "Ajouter le service"}
          </button>
        </form>

        <section className="mt-8 space-y-4">
          {services.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-gray-600">
              Aucun service enregistré.
            </div>
          ) : (
            services.map(
              (service) => (
                <div
                  key={
                    service._id
                  }
                  className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {service.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                      {service.duration} minutes
                      {" · "}
                      {service.price}{" "}
                      {service.currency ??
                        "DT"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      remove(
                        service._id,
                      )
                    }
                    className="w-fit rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              ),
            )
          )}
        </section>
      </div>
    </main>
  );
}