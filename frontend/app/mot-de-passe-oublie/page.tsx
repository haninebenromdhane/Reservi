"use client";

import Link from "next/link";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try { await apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }); setSubmitted(true); }
    catch (err) { setError(err instanceof Error ? err.message : "Impossible d'envoyer la demande."); }
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Mot de passe oublié ?
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-xl bg-green-50 p-4 text-center text-sm text-green-700">
            Un email contenant les instructions vient de vous être envoyé si l&apos;adresse existe.
            <div className="mt-4">
              <Link
                href="/login"
                className="font-medium text-green-800 underline hover:text-green-900"
              >
                Retour à la page de connexion
              </Link>
            </div>
          </div>
        ) : (
          <>
          {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="votre@email.com"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Envoyer le lien
            </button>

            <div className="text-center text-sm">
              <Link
                href="/login"
                className="font-medium text-gray-600 hover:text-gray-900"
              >
                Retour à la connexion
              </Link>
            </div>
          </form>
          </>
        )}
      </div>
    </main>
  );
}