"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import { apiFetch } from "@/lib/api";

export default function ProfessionalSpacePage() {
  const { user } = useAuth();
  const [loadingReset, setLoadingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fonction pour gérer la demande de réinitialisation du mot de passe
  const handleResetPassword = async () => {
    if (!user?.email) return;
    setLoadingReset(true);
    setResetMessage(null);

    try {
      await apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email: user.email }) });

      setResetMessage({
        type: "success",
        text: "Un e-mail de réinitialisation de mot de passe a été envoyé à votre adresse.",
      });
    } catch {
      setResetMessage({
        type: "success",
        text: "Demande de réinitialisation prise en compte : consultez votre boîte mail.",
      });
    } finally {
      setLoadingReset(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xlpx-4 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Connexion nécessaire
          </h1>

          <p className="mt-3 text-gray-600">
            Connectez-vous pour accéder à votre espace professionnel.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  if (user.role !== "AGENT") {
    return (
      <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Accès refusé
          </h1>

          <p className="mt-3 text-gray-600">
            Cette page est réservée aux professionnels.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-gray-500">
          Espace professionnel
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Bonjour {user.firstName}
        </h1>

        <p className="mt-2 text-gray-600">
          Gérez votre activité professionnelle sur Reservi.
        </p>

        {resetMessage && (
          <div
            className={`mt-4 p-4 rounded-xl text-sm font-medium border ${
              resetMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            {resetMessage.text}
          </div>
        )}

        <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Mon profil professionnel
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Gérez les informations visibles par les clients et votre sécurité.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/professionnel/espace/profil"
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition hover:border-black"
              >
                Modifier mon profil & Nom
              </Link>

              <Link
                href="/professionnel/espace/fiche"
                className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Ma fiche
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-5 border-t border-gray-100 pt-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Nom & Prénom</p>

              <p className="mt-1 font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>

              <p className="mt-1 font-medium text-gray-900">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Sécurité du compte</p>

              <button
                onClick={handleResetPassword}
                disabled={loadingReset}
                className="mt-1 text-sm font-semibold text-blue-600 hover:underline disabled:opacity-50 text-left block"
              >
                {loadingReset ? "Envoi en cours..." : "Réinitialiser mon mot de passe →"}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-xl">
              📋
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              Mes services
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Ajoutez et gérez les services proposés ainsi que leurs tarifs.
            </p>

            <Link
              href="/professionnel/espace/service"
              className="mt-5 inline-flex rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-black"
            >
              Gérer mes services
            </Link>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-xl">
              🗓️
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              Disponibilités
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Définissez vos horaires et vos créneaux disponibles.
            </p>

            <Link
              href="/professionnel/espace/disponibilite"
              className="mt-5 inline-flex rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-black"
            >
              Gérer mes disponibilités
            </Link>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-xl">
              📅
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              Rendez-vous
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Consultez les rendez-vous et gérez leur statut.
            </p>

            <Link
              href="/professionnel/espace/rendez-vous"
              className="mt-5 inline-flex rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-black"
            >
              Voir mes rendez-vous
            </Link>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-xl">
              ⭐
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              Mes avis
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Consultez les avis laissés par vos clients.
            </p>

            <Link
              href="/professionnel/espace/avis"
              className="mt-5 inline-flex rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-black"
            >
              Voir les avis
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}