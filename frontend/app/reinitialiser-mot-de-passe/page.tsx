"use client";

import { useState, Suspense } from "react"; // useEffect supprimé
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

function ReinitialiserMotDePasseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState("");
  const [chargement, setChargement] = useState(false);
  const [messageSucces, setMessageSucces] = useState("");
  const [erreur, setErreur] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setMessageSucces("");

    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }

    if (nouveauMotDePasse.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setChargement(true);

    try {
      await apiFetch("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword: nouveauMotDePasse }) });

      setMessageSucces(
        "Votre mot de passe a été réinitialisé avec succès ! Redirection..."
      );
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue.";
      setErreur(errorMessage);
    } finally {
      setChargement(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-xl font-bold text-red-600 mb-4">Lien invalide</h1>
        <p className="text-gray-600 mb-6">
          Le lien de réinitialisation est incomplet ou invalide.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="text-blue-600 hover:underline text-sm"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 p-6 backdrop-blur-sm p-10 rounded-3xl rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-2 text-gray-800 text-center">
        Nouveau mot de passe
      </h1>
      <p className="text-sm text-gray-600 mb-6 text-center">
        Saisissez votre nouveau mot de passe ci-dessous.
      </p>

      {messageSucces && (
        <div className="p-3 mb-4 bg-green-100 border border-green-400 text-green-700 rounded text-sm text-center">
          {messageSucces}
        </div>
      )}

      {erreur && (
        <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
          {erreur}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            required
            value={nouveauMotDePasse}
            onChange={(e) => setNouveauMotDePasse(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            required
            value={confirmationMotDePasse}
            onChange={(e) => setConfirmationMotDePasse(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={chargement}
          className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {chargement ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
        </button>
      </form>
    </div>
  );
}

export default function ReinitialiserMotDePassePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Chargement...</div>}>
      <ReinitialiserMotDePasseContent />
    </Suspense>
  );
}