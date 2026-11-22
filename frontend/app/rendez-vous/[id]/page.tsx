"use client";

import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/components/auth/AuthContext";
import { apiFetch } from "@/lib/api";

type Slot = {
  date: string;
  startTime: string;
  endTime: string;
};

type Service = {
  _id: string;
  name: string;
  duration: number;
  price: number;
  currency?: string;
};

type Professional = {
  _id: string;
  displayName: string;
  city?: string;
  description?: string;
  services: Service[];
  profession?: {
    _id: string;
    name: string;
  };
};

export default function RendezVousPage() {
  const params = useParams();
  const router = useRouter();

  const {
    user,
    accessToken,
    ready,
  } = useAuth();

  const id = String(params.id);

  const [agent, setAgent] =
    useState<Professional | null>(null);

  const [serviceId, setServiceId] =
    useState("");

  const [date, setDate] =
    useState("");

  const [slot, setSlot] =
    useState<Slot | null>(null);

  const [slots, setSlots] =
    useState<Slot[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingSlots, setLoadingSlots] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    if (!id || id === "undefined") {
      setError(
        "Identifiant du professionnel invalide.",
      );
      setLoading(false);
      return;
    }

    /*
     * On attend que l'état d'authentification soit prêt avant
     * de trancher, pour ne pas rediriger à tort un client déjà
     * connecté dont la session est encore en cours de
     * restauration.
     */
    if (!ready) {
      return;
    }

    /*
     * La consultation de la fiche complète et la prise de
     * rendez-vous sont réservées aux clients connectés. Un
     * visiteur non connecté est immédiatement renvoyé vers la
     * page de connexion, sans jamais interroger la route
     * protégée /professionals/:id/details.
     */
    if (!user || (user.role !== "CLIENT" && user.role !== "ADMIN")) {
      router.push("/login");
      return;
    }

    void apiFetch<Professional>(
      `/professionals/${id}/details`,
      {
        token: accessToken ?? undefined,
      },
    )
      .then((professional) => {
        setAgent(professional);

    
        setServiceId("");
      })
      .catch((e) => {
        setError(
          e instanceof Error
            ? e.message
            : "Professionnel introuvable.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, ready, user, accessToken, router]);

  useEffect(() => {
    if (
      !date ||
      !accessToken ||
      user?.role !== "CLIENT"
    ) {
      setSlots([]);
      setSlot(null);
      return;
    }

    const selectedService =
      agent?.services?.find(
        (service) =>
          service._id === serviceId,
      );

    setLoadingSlots(true);
    setError("");
    setSlot(null);

    const query =
      `/agents/${id}/availability` +
      `?from=${encodeURIComponent(date)}` +
      `&to=${encodeURIComponent(date)}` +
      (
        selectedService
          ? `&duration=${selectedService.duration}`
          : ""
      );

    void apiFetch<Slot[]>(
      query,
      {
        token:
          accessToken ?? undefined,
      },
    )
      .then((availableSlots) => {
        setSlots(availableSlots);
      })
      .catch((e) => {
        setSlots([]);

        setError(
          e instanceof Error
            ? e.message
            : "Impossible de charger les créneaux.",
        );
      })
      .finally(() => {
        setLoadingSlots(false);
      });
  }, [
    date,
    id,
    serviceId,
    agent,
    accessToken,
    user,
  ]);

  const submit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (
      !user ||
      user.role !== "CLIENT"
    ) {
      router.push("/login");
      return;
    }

    if (!slot) {
      setError(
        "Veuillez choisir un créneau.",
      );
      return;
    }

    const selectedService =
      agent?.services?.find(
        (service) =>
          service._id === serviceId,
      );

    setError("");
    setMessage("");

    try {
      await apiFetch(
        "/bookings",
        {
          method: "POST",
          token:
            accessToken ?? undefined,

          body: JSON.stringify({
            professionalId: id,

            date: slot.date,

            startTime:
              slot.startTime,

            endTime:
              slot.endTime,

            serviceId:
              selectedService?._id,

            serviceName:
              selectedService?.name,

            servicePrice:
              selectedService?.price,

            serviceDuration:
              selectedService?.duration,

            reason:
              selectedService?.name ??
              "Rendez-vous",

            clientNote:
              message.trim() || undefined,
          }),
        },
      );

      router.push(
        "/client/espace/rendez-vous",
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Impossible de créer la réservation.",
      );
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-12">
        Chargement...
      </main>
    );
  }

  if (!agent) {
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Professionnel introuvable
          </h1>

          <p className="mt-3 text-gray-600">
            {error}
          </p>

          <Link
            href="/annuaire"
            className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 font-semibold text-white"
          >
            Retour à l&apos;annuaire
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-12">
      <div className="mx-auto max-w-2xl">

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          <Link
            href={`/professionnel/${id}`}
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Retour à la fiche
          </Link>

          <h1 className="mt-8 text-3xl font-bold text-gray-900">
            Prendre rendez-vous
          </h1>

          <p className="mt-2 text-gray-600">
            Avec {agent.displayName}
          </p>

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={submit}
            className="mt-8 space-y-6"
          >

            <div>
              <label
                htmlFor="service"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Service{" "}
                <span className="font-normal text-gray-500">
                  (optionnel)
                </span>
              </label>

              <select
                id="service"
                value={serviceId}
                onChange={(e) => {
                  setServiceId(
                    e.target.value,
                  );
                  setSlot(null);
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
              >
                <option value="">
                  Aucun service spécifique
                </option>

                {agent.services?.map(
                  (service) => (
                    <option
                      key={service._id}
                      value={service._id}
                    >
                      {service.name} —{" "}
                      {service.duration} min ·{" "}
                      {service.price}{" "}
                      {service.currency ??
                        "DT"}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="date"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Date
              </label>

              <input
                id="date"
                type="date"
                required
                value={date}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(e) => {
                  setDate(
                    e.target.value,
                  );
                  setSlot(null);
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-900">
                Créneaux disponibles
              </label>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {loadingSlots ? (
                  <p className="col-span-full text-sm text-gray-500">
                    Chargement des créneaux...
                  </p>
                ) : !date ? (
                  <p className="col-span-full text-sm text-gray-500">
                    Sélectionnez d&apos;abord une date.
                  </p>
                ) : slots.length === 0 ? (
                  <p className="col-span-full text-sm text-gray-500">
                    Aucun créneau disponible pour cette date.
                  </p>
                ) : (
                  slots.map((availableSlot) => {
                    const selected =
                      slot?.date ===
                        availableSlot.date &&
                      slot?.startTime ===
                        availableSlot.startTime;

                    return (
                      <button
                        key={`${availableSlot.date}-${availableSlot.startTime}`}
                        type="button"
                        onClick={() =>
                          setSlot(
                            availableSlot,
                          )
                        }
                        className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                          selected
                            ? "border-black bg-black text-white"
                            : "border-gray-300 bg-white text-gray-800 hover:border-black"
                        }`}
                      >
                        {
                          availableSlot.startTime
                        }
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Message au professionnel{" "}
                <span className="font-normal text-gray-500">
                  (optionnel)
                </span>
              </label>

              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value,
                  )
                }
                placeholder="Ajoutez une information utile pour le professionnel..."
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
              />
            </div>

            {slot && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <h2 className="font-semibold text-gray-900">
                  Résumé
                </h2>

                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p>
                    Service :{" "}
                    <span className="font-medium text-gray-900">
                      {agent.services?.find(
                        (service) =>
                          service._id ===
                          serviceId,
                      )?.name ??
                        "Rendez-vous standard"}
                    </span>
                  </p>

                  <p>
                    Date :{" "}
                    <span className="font-medium text-gray-900">
                      {slot.date}
                    </span>
                  </p>

                  <p>
                    Heure :{" "}
                    <span className="font-medium text-gray-900">
                      {slot.startTime} →{" "}
                      {slot.endTime}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!slot}
              className="w-full rounded-xl bg-black px-5 py-3 font-semibold text-white disabled:bg-gray-200 disabled:text-gray-500"
            >
              Confirmer le rendez-vous
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}