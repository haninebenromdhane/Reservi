"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  ouvert: boolean;
  titre: string;
  message: string;
  labelConfirmer?: string;
  labelAnnuler?: string;
  danger?: boolean;
  chargement?: boolean;
  onConfirmer: () => void;
  onAnnuler: () => void;
}

/*
 * Boîte de confirmation générique réutilisée pour toutes les actions
 * sensibles (suspendre, supprimer, signaler, refuser...) dans les
 * espaces admin, agent et client.
 *
 * Rendue via un portail directement dans <body> : plusieurs pages
 * enveloppent leur contenu dans un conteneur avec `backdrop-blur`,
 * or un `backdrop-filter` sur un ancêtre crée un nouveau "containing
 * block" pour les descendants en `position: fixed`. Sans portail,
 * la boîte se retrouverait centrée par rapport à cette section (et
 * potentiellement hors champ) au lieu d'être centrée sur l'écran.
 */
export default function ConfirmDialog({
  ouvert,
  titre,
  message,
  labelConfirmer = "Confirmer",
  labelAnnuler = "Annuler",
  danger = true,
  chargement = false,
  onConfirmer,
  onAnnuler,
}: ConfirmDialogProps) {
  const [monte, setMonte] = useState(false);

  useEffect(() => {
    setMonte(true);
  }, []);

  if (!ouvert || !monte) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-900">{titre}</h2>

        <p className="mt-2 text-sm text-gray-600">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onAnnuler}
            disabled={chargement}
            className="rounded-md border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {labelAnnuler}
          </button>

          <button
            type="button"
            onClick={onConfirmer}
            disabled={chargement}
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {chargement ? "Veuillez patienter..." : labelConfirmer}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
