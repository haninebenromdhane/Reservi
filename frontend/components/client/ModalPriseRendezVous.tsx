"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";

interface Service {
  id: string;
  nom: string;
  dureeMinutes: number;
  prix: number;
}

interface Slot {
  date: string;
  startTime: string;
  endTime: string;
}

interface ModalPriseRendezVousProps {
  agentId: string;
  nomAgent: string;
  services: Service[];
  estOuvert: boolean;
  onFermer: () => void;
  onRendezVousCree?: () => void;
}

export default function ModalPriseRendezVous({
  agentId,
  nomAgent,
  services,
  estOuvert,
  onFermer,
  onRendezVousCree,
}: ModalPriseRendezVousProps) {
  const { user, accessToken } = useAuth();

  /*
   * Aucun service n'est présélectionné : le choix d'un service
   * (et donc de sa durée) reste optionnel. Sans sélection, la
   * durée standard du planning de l'agent s'applique.
   */
  const [serviceSelectionne, setServiceSelectionne] =
    useState("");

  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);

  const [notes, setNotes] = useState("");
  const [chargement, setChargement] =
    useState(false);

  const [chargementSlots, setChargementSlots] =
    useState(false);

  const [erreur, setErreur] = useState("");
  const [monte, setMonte] = useState(false);

  useEffect(() => {
    setMonte(true);
  }, []);

  useEffect(() => {
    if (!date || !estOuvert) {
      setSlots([]);
      return;
    }

    const selectedService = services.find(
      (item) => item.id === serviceSelectionne,
    );

    const loadSlots = async () => {
      setChargementSlots(true);
      setErreur("");

      try {
        const query =
          `/agents/${agentId}/availability` +
          `?from=${encodeURIComponent(date)}&to=${encodeURIComponent(date)}` +
          (selectedService
            ? `&duration=${selectedService.dureeMinutes}`
            : "");

        const data =
          await apiFetch<Slot[]>(query);

        setSlots(data);
      } catch (err) {
        setErreur(
          err instanceof Error
            ? err.message
            : "Impossible de charger les créneaux.",
        );
      } finally {
        setChargementSlots(false);
      }
    };

    void loadSlots();
  }, [agentId, date, estOuvert, serviceSelectionne, services]);

  if (!estOuvert || !monte) {
    return null;
  }

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!user || user.role !== "CLIENT") {
      setErreur(
        "Vous devez être connecté en tant que client.",
      );
      return;
    }

    /*
     * Le service (et donc la durée) est optionnel : seul le
     * créneau est requis pour confirmer la réservation.
     */
    const service = services.find(
      (item) =>
        item.id === serviceSelectionne,
    );

    const selectedSlot = slots.find((slot) => slot.startTime === heure);

    if (!selectedSlot) {
      setErreur(
        "Veuillez sélectionner un créneau valide.",
      );
      return;
    }

    setChargement(true);
    setErreur("");

    try {
      await apiFetch(
        "/bookings",
        {
          method: "POST",
          token: accessToken ?? undefined,
          body: JSON.stringify({
            professionalId: agentId,
            date: selectedSlot.date,
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
            ...(service
              ? {
                  serviceId: service.id,
                  serviceName: service.nom,
                  servicePrice: service.prix,
                  serviceDuration: service.dureeMinutes,
                  reason: service.nom,
                }
              : {
                  reason: "Rendez-vous",
                }),
            clientNote: notes,
          }),
        },
      );

      onRendezVousCree?.();
      onFermer();
    } catch (err) {
      setErreur(
        err instanceof Error
          ? err.message
          : "Impossible de réserver ce créneau.",
      );
    } finally {
      setChargement(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">
            Prendre RDV avec {nomAgent}
          </h2>

          <button
            type="button"
            onClick={onFermer}
            className="text-lg font-bold text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {erreur && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {erreur}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="service"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Service souhaité{" "}
              <span className="font-normal text-gray-500">
                (optionnel)
              </span>
            </label>

            <select
              id="service"
              value={serviceSelectionne}
              onChange={(event) =>
                setServiceSelectionne(
                  event.target.value,
                )
              }
              className="w-full rounded-md border p-2"
            >
              <option value="">
                Aucun service spécifique (durée standard)
              </option>

              {services.map((service) => (
                <option
                  key={service.id}
                  value={service.id}
                >
                  {service.nom} (
                  {service.dureeMinutes} min -{" "}
                  {service.prix} DT)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="date"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Date *
            </label>

            <input
              id="date"
              type="date"
              required
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setHeure("");
              }}
              className="w-full rounded-md border p-2"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              Créneau *
            </p>

            {chargementSlots ? (
              <p className="text-sm text-gray-500">
                Chargement...
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => {
                  const time = slot.startTime;

                  return (
                    <button
                      key={`${slot.date}-${slot.startTime}`}
                      type="button"
                      onClick={() =>
                        setHeure(time)
                      }
                      className={`rounded-md border p-2 text-sm ${
                        heure === time
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-black"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Notes ou instructions
            </label>

            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              className="w-full rounded-md border p-2"
            />
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onFermer}
              className="rounded-md border px-4 py-2 text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={chargement}
              className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {chargement
                ? "Réservation..."
                : "Confirmer le rendez-vous"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}