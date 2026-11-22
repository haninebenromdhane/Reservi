"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";

interface ModalReclamationProps {
  utilisateurCibleId: string;
  nomCible: string;
  estOuvert: boolean;
  onFermer: () => void;
  bookingId?: string;
  type?: string;
}

export default function ModalReclamation({
  utilisateurCibleId,
  nomCible,
  estOuvert,
  onFermer,
  bookingId,
  type,
}: ModalReclamationProps) {
  const { accessToken } = useAuth();
  const [motif, setMotif] = useState("COMPORTEMENT_INAPPROPRIE");
  const [description, setDescription] = useState("");
  const [chargement, setChargement] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState("");
  const [monte, setMonte] = useState(false);

  useEffect(() => {
    setMonte(true);
  }, []);

  if (!estOuvert || !monte) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setChargement(true); setErreur("");
    try {
      await apiFetch("/reclamations", { method: "POST", token: accessToken ?? undefined, body: JSON.stringify({ subject: `${motif} — ${nomCible}`, message: `${description}\nCible : ${utilisateurCibleId}`, targetUserId: utilisateurCibleId, bookingId, type: type ?? motif }) });
      setSucces(true);
      setTimeout(() => { setSucces(false); onFermer(); }, 1500);
    } catch (error) {
      setErreur(error instanceof Error ? error.message : "Impossible d'envoyer le signalement.");
    } finally { setChargement(false); }
  };
  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-bold text-red-600 mb-2">
          Signaler un utilisateur
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Cible du signalement : <span className="font-semibold">{nomCible}</span>
        </p>

        {erreur && <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{erreur}</div>}

        {succes ? (
          <div className="p-4 bg-green-100 text-green-700 text-center rounded font-medium">
            Le signalement a été transmis aux administrateurs.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Motif du signalement
              </label>
              <select
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="w-full border rounded-md p-2 text-gray-900"
              >
                <option value="COMPORTEMENT_INAPPROPRIE">Comportement inapproprié</option>
                <option value="ABSENCE_NON_JUSTIFIEE">Non-présentation au rendez-vous</option>
                <option value="CONTENU_ABUSIF">Propos / Contenu abusif</option>
                <option value="AUTRE">Autre raison</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Explication détaillée
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez brièvement la raison de votre réclamation..."
                className="w-full border rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-red-500"
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
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {chargement ? "Envoi..." : "Envoyer le signalement"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}