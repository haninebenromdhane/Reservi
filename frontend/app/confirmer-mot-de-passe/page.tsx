"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

function ConfirmerMotDePasseContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [chargement, setChargement] = useState(false);
  const [confirme, setConfirme] = useState(false);
  const [erreur, setErreur] = useState("");

  const handleConfirm = async () => {
    if (!token) return;

    setErreur("");
    setChargement(true);

    try {
      await apiFetch("/auth/confirm-password-change", {
        method: "POST",
        body: JSON.stringify({ token }),
      });

      setConfirme(true);
    } catch (err) {
      setErreur(
        err instanceof Error
          ? err.message
          : "Impossible de confirmer le changement de mot de passe.",
      );
    } finally {
      setChargement(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-xl font-bold text-red-600 mb-4">Lien invalide</h1>
        <p className="text-gray-600 mb-6">
          Le lien de confirmation est incomplet ou invalide.
        </p>
        <Link href="/login" className="text-blue-600 hover:underline text-sm">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 p-6 backdrop-blur-sm p-10 rounded-3xl rounded-lg shadow-md text-center">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">
        Confirmer le changement de mot de passe
      </h1>

      {confirme ? (
        <>
          <div className="p-3 mt-4 mb-4 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            Votre mot de passe a été modifié avec succès.
          </div>

          <Link
            href="/login"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Se connecter
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-6">
            Cliquez sur le bouton ci-dessous pour finaliser le changement de mot de passe demandé depuis votre espace personnel.
          </p>

          {erreur && (
            <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
              {erreur}
            </div>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={chargement}
            className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {chargement ? "Confirmation..." : "Confirmer le changement"}
          </button>
        </>
      )}
    </div>
  );
}

export default function ConfirmerMotDePassePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Chargement...</div>}>
      <ConfirmerMotDePasseContent />
    </Suspense>
  );
}
