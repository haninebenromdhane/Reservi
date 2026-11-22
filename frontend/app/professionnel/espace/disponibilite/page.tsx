"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";

type DaySchedule = {
  dayOfWeek: number;
  day: string;
  active: boolean;
  startTime: string;
  endTime: string;
};

type ScheduleResponse = {
  _id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
};

type TimeOff = {
  _id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
};

const initialSchedule: DaySchedule[] = [
  {
    dayOfWeek: 1,
    day: "Lundi",
    active: false,
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    dayOfWeek: 2,
    day: "Mardi",
    active: false,
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    dayOfWeek: 3,
    day: "Mercredi",
    active: false,
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    dayOfWeek: 4,
    day: "Jeudi",
    active: false,
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    dayOfWeek: 5,
    day: "Vendredi",
    active: false,
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    dayOfWeek: 6,
    day: "Samedi",
    active: false,
    startTime: "09:00",
    endTime: "13:00",
  },
  {
    dayOfWeek: 7,
    day: "Dimanche",
    active: false,
    startTime: "09:00",
    endTime: "13:00",
  },
];

export default function DisponibilitesPage() {
  const { accessToken } = useAuth();

  const [schedule, setSchedule] =
    useState<DaySchedule[]>(initialSchedule);

  const [timeOffs, setTimeOffs] =
    useState<TimeOff[]>([]);

  const [date, setDate] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [reason, setReason] = useState("");

  const [showTimeOffForm, setShowTimeOffForm] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const schedules =
          await apiFetch<ScheduleResponse[]>(
            "/schedules/me",
            {
              token: accessToken ?? undefined,
            },
          );

        const timeOffsResponse =
          await apiFetch<TimeOff[]>(
            "/time-offs/me",
            {
              token: accessToken ?? undefined,
            },
          );

        setSchedule((current) =>
          current.map((day) => {
            const existing =
              schedules.find(
                (item) =>
                  item.dayOfWeek ===
                  day.dayOfWeek,
              );

            if (!existing) {
              return day;
            }

            return {
              ...day,
              active: existing.active,
              startTime: existing.startTime,
              endTime: existing.endTime,
            };
          }),
        );

        setTimeOffs(timeOffsResponse);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger le planning.",
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [accessToken]);

  const updateDay = (
    index: number,
    field:
      | "active"
      | "startTime"
      | "endTime",
    value: string | boolean,
  ) => {
    setSchedule((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );

    setSaved(false);
  };

  const saveSchedule = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      for (const day of schedule) {
        if (!day.active) {
          continue;
        }

        await apiFetch(
          "/schedules/me",
          {
            method: "PUT",
            token: accessToken ?? undefined,
            body: JSON.stringify({
              dayOfWeek: day.dayOfWeek,
              startTime: day.startTime,
              endTime: day.endTime,
              active: true,
            }),
          },
        );
      }

      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer le planning.",
      );
    } finally {
      setSaving(false);
    }
  };

  const addTimeOff = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!date) {
      return;
    }

    setError("");

    try {
      const created =
        await apiFetch<TimeOff>(
          "/time-offs/me",
          {
            method: "POST",
            token: accessToken ?? undefined,
            body: JSON.stringify({
              date,
              startTime: start,
              endTime: end,
              reason,
            }),
          },
        );

      setTimeOffs((current) => [
        ...current,
        created,
      ]);

      setDate("");
      setStart("09:00");
      setEnd("17:00");
      setReason("");
      setShowTimeOffForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'ajouter l'indisponibilité.",
      );
    }
  };

  const deleteTimeOff = async (
    id: string,
  ) => {
    try {
      await apiFetch(
        `/time-offs/me/${id}`,
        {
          method: "DELETE",
          token: accessToken ?? undefined,
        },
      );

      setTimeOffs((current) =>
        current.filter(
          (item) => item._id !== id,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer l'indisponibilité.",
      );
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="mx-auto max-w-4xl">
          Chargement...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen backdrop-blur-sm rounded-3xl px-4 py-12 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/professionnel/espace"
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Retour à mon espace professionnel
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-500">
            Espace professionnel
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Mes disponibilités
          </h1>

          <p className="mt-2 text-gray-600">
            Configurez vos horaires habituels et vos indisponibilités.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Horaires hebdomadaires
          </h2>

          <div className="mt-6 space-y-4">
            {schedule.map((day, index) => (
              <div
                key={day.dayOfWeek}
                className="grid gap-4 rounded-2xl border border-gray-100 p-4 sm:grid-cols-[1fr_120px_120px_120px] sm:items-center"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {day.day}
                  </p>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={day.active}
                    onChange={(event) =>
                      updateDay(
                        index,
                        "active",
                        event.target.checked,
                      )
                    }
                  />
                  Actif
                </label>

                <input
                  type="time"
                  value={day.startTime}
                  disabled={!day.active}
                  onChange={(event) =>
                    updateDay(
                      index,
                      "startTime",
                      event.target.value,
                    )
                  }
                  className="rounded-xl border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                />

                <input
                  type="time"
                  value={day.endTime}
                  disabled={!day.active}
                  onChange={(event) =>
                    updateDay(
                      index,
                      "endTime",
                      event.target.value,
                    )
                  }
                  className="rounded-xl border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={saveSchedule}
            disabled={saving}
            className="mt-6 rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving
              ? "Enregistrement..."
              : "Enregistrer le planning"}
          </button>

          {saved && (
            <p className="mt-3 text-sm text-green-700">
              Planning enregistré.
            </p>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Indisponibilités
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Congés, absences ou autres périodes bloquées.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowTimeOffForm(
                  (current) => !current,
                )
              }
              className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
            >
              Ajouter
            </button>
          </div>

          {showTimeOffForm && (
            <form
              onSubmit={addTimeOff}
              className="mt-6 grid gap-4 rounded-2xl bg-gray-50 p-5 sm:grid-cols-2"
            >
              <input
                type="date"
                required
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                className="rounded-xl border border-gray-300 px-4 py-3"
              />

              <input
                type="text"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                placeholder="Motif"
                className="rounded-xl border border-gray-300 px-4 py-3"
              />

              <input
                type="time"
                required
                value={start}
                onChange={(event) =>
                  setStart(event.target.value)
                }
                className="rounded-xl border border-gray-300 px-4 py-3"
              />

              <input
                type="time"
                required
                value={end}
                onChange={(event) =>
                  setEnd(event.target.value)
                }
                className="rounded-xl border border-gray-300 px-4 py-3"
              />

              <button
                type="submit"
                className="rounded-xl bg-black px-4 py-3 font-semibold text-white sm:col-span-2"
              >
                Ajouter l&apos;indisponibilité
              </button>
            </form>
          )}

          <div className="mt-6 space-y-3">
            {timeOffs.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aucune indisponibilité enregistrée.
              </p>
            ) : (
              timeOffs.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(
                        item.date,
                      ).toLocaleDateString("fr-FR")}
                    </p>

                    <p className="text-sm text-gray-500">
                      {item.startTime ?? "Toute la journée"}{item.endTime ? ` → ${item.endTime}` : ""}
                    </p>

                    {item.reason && (
                      <p className="mt-1 text-sm text-gray-600">
                        {item.reason}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      deleteTimeOff(item._id)
                    }
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}