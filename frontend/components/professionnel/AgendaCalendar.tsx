"use client";

import { useMemo, useState } from "react";

export interface AgendaBookingRef {
  id: string;
  date: string;
  status: string;
}

interface AgendaCalendarProps {
  bookings: AgendaBookingRef[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
});

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateKeyFromIso(iso: string) {
  // Les dates de réservation sont stockées en UTC (date seule) ;
  // on ne garde que la partie AAAA-MM-JJ, sans conversion de fuseau.
  return iso.slice(0, 10);
}

const statusDotColor = (status: string) => {
  if (status === "PENDING") return "bg-yellow-500";
  if (status === "CONFIRMED") return "bg-green-500";
  if (status === "COMPLETED") return "bg-gray-400";
  if (status === "NO_SHOW") return "bg-orange-500";
  return "bg-gray-300";
};

/*
 * Calendrier mensuel léger (sans dépendance externe) affichant les
 * rendez-vous de l'agent, jour par jour. Cliquer sur un jour filtre
 * la liste des rendez-vous ci-dessous.
 */
export default function AgendaCalendar({
  bookings,
  selectedDate,
  onSelectDate,
}: AgendaCalendarProps) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, AgendaBookingRef[]>();
    for (const booking of bookings) {
      const key = dateKeyFromIso(booking.date);
      const list = map.get(key) ?? [];
      list.push(booking);
      map.set(key, list);
    }
    return map;
  }, [bookings]);

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = lundi
    const daysInMonth = new Date(
      cursor.getFullYear(),
      cursor.getMonth() + 1,
      0,
    ).getDate();

    const cells: Array<{ date: Date; inMonth: boolean } | null> = [];

    for (let i = 0; i < startWeekday; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({
        date: new Date(cursor.getFullYear(), cursor.getMonth(), day),
        inMonth: true,
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    const rows: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [cursor]);

  const todayKey = toDateKey(new Date());

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
          }
          className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          aria-label="Mois précédent"
        >
          ←
        </button>

        <p className="text-lg font-semibold capitalize text-gray-900">
          {MONTH_LABEL_FORMATTER.format(cursor)}
        </p>

        <button
          type="button"
          onClick={() =>
            setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
          }
          className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          aria-label="Mois suivant"
        >
          →
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="mt-1 space-y-1">
        {weeks.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7 gap-1">
            {row.map((cell, cellIndex) => {
              if (!cell) {
                return <div key={cellIndex} className="aspect-square" />;
              }

              const key = toDateKey(cell.date);
              const dayBookings = bookingsByDay.get(key) ?? [];
              const isSelected = selectedDate === key;
              const isToday = key === todayKey;

              return (
                <button
                  key={cellIndex}
                  type="button"
                  onClick={() => onSelectDate(isSelected ? null : key)}
                  className={`aspect-square rounded-xl border p-1 text-sm transition ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : isToday
                        ? "border-gray-900 text-gray-900"
                        : "border-gray-100 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="block">{cell.date.getDate()}</span>

                  {dayBookings.length > 0 && (
                    <span className="mt-1 flex justify-center gap-0.5">
                      {dayBookings.slice(0, 3).map((booking) => (
                        <span
                          key={booking.id}
                          className={`h-1.5 w-1.5 rounded-full ${
                            isSelected ? "bg-white" : statusDotColor(booking.status)
                          }`}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selectedDate && (
        <button
          type="button"
          onClick={() => onSelectDate(null)}
          className="mt-4 text-sm font-semibold text-gray-600 hover:text-black"
        >
          ✕ Effacer le filtre de date
        </button>
      )}
    </div>
  );
}
