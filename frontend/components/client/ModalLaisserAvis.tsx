"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";

interface ModalLaisserAvisProps {
  rendezVousId: string;
  nomAgent: string;
  estOuvert: boolean;
  onFermer: () => void;
  onAvisSoumis?: () => void;
}

export default function ModalLaisserAvis({
  rendezVousId,
  nomAgent,
  estOuvert,
  onFermer,
  onAvisSoumis,
}: ModalLaisserAvisProps) {
  const { accessToken } = useAuth();
  const [note, setNote] = useState<number>(5);
  const [commentaire, setCommentaire] = useState("");
  const [chargement, setChargement] = useState(false);
  const [succes, setSucces] = useState(false);
  const [monte, setMonte] = useState(false);

  useEffect(() => {
    setMonte(true);
  }, []);

  if (!estOuvert || !monte) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargement(true);

    try {
      await apiFetch(`/reviews/booking/${rendezVousId}`, { method: "POST", token: accessToken ?? undefined, body: JSON.stringify({ rating: note, comment: commentaire }) });
    } finally {
      setChargement(false);
      setSucces(true);
      setTimeout(() => {
        if (onAvisSoumis) onAvisSoumis();
        onFermer();
      }, 1500);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Laisser un avis sur {nomAgent}
        </h2>
        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mb-4">
          ℹ️ Votre avis sera relu et modéré par un administrateur avant publication.
        </p>

        {succes ? (
          <div className="p-4 bg-green-100 text-green-700 text-center rounded font-medium">
            Votre avis a été soumis avec succès pour modération !
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Note sur 5
              </label>
              <div className="flex gap-2 text-2xl">
                {[1, 2, 3, 4, 5].map((etoile) => (
                  <button
                    type="button"
                    key={etoile}
                    onClick={() => setNote(etoile)}
                    className={etoile <= note ? "text-amber-400" : "text-gray-300"}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Votre commentaire
              </label>
              <textarea
                required
                rows={4}
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Racontez comment s'est passé votre rendez-vous..."
                className="w-full border rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onFermer}
                className="px-4 py-2 border text-gray-600 rounded-md text-sm hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={chargement}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {chargement ? "Envoi..." : "Soumettre l'avis"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}