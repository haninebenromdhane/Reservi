"use client";

import Link from "next/link";

import {
  useState,
} from "react";

import ProfilePhotoEditor from "@/components/auth/ProfilePhotoEditor";

import {
  useAuth,
} from "@/components/auth/AuthContext";

import {
  apiFetch,
} from "@/lib/api";

export default function ClientProfilPage() {
  const {
    user,
    accessToken,
    refreshSession,
  } = useAuth();

  const [
    prenom,
    setPrenom,
  ] = useState(
    user?.firstName ?? "",
  );

  const [
    nom,
    setNom,
  ] = useState(
    user?.lastName ?? "",
  );

  const [
    email,
    setEmail,
  ] = useState(
    user?.email ?? "",
  );

  const [
    telephone,
    setTelephone,
  ] = useState(
    user?.phone ?? "",
  );

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  if (!user) {
    return (
      <main className="min-h-screen p-10 text-center">
        Connexion nécessaire.
      </main>
    );
  }

  const save =
    async (
      event: React.FormEvent,
    ) => {
      event.preventDefault();

      setError("");
      setMessage("");
      setSaving(true);

      try {
        await apiFetch(
          "/users/me",
          {
            method: "PATCH",
            token:
              accessToken ??
              undefined,
            body: JSON.stringify({
              firstName:
                prenom.trim(),
              lastName:
                nom.trim(),
              email:
                email
                  .trim()
                  .toLowerCase(),
              phone:
                telephone.trim(),
            }),
          },
        );

        await refreshSession();

        setMessage(
          "Profil mis à jour avec succès.",
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de mettre à jour le profil.",
        );
      } finally {
        setSaving(false);
      }
    };

  const changePassword =
    async (
      event: React.FormEvent,
    ) => {
      event.preventDefault();

      setError("");
      setMessage("");
      setChangingPassword(true);

      try {
        await apiFetch(
          "/users/me/password",
          {
            method: "PATCH",
            token:
              accessToken ??
              undefined,
            body: JSON.stringify({
              currentPassword,
              newPassword,
            }),
          },
        );

        setCurrentPassword("");
        setNewPassword("");

        setMessage(
          "Un e-mail de confirmation vous a été envoyé. Cliquez sur le lien reçu pour finaliser le changement de mot de passe.",
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de modifier le mot de passe.",
        );
      } finally {
        setChangingPassword(
          false,
        );
      }
    };

  return (
    <main className="min-h-screen backdrop-blur-sm rounded-3xl py-10">
      <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Mon Profil Client
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Gérez vos informations personnelles et votre sécurité.
            </p>
          </div>

          <Link
            href="/client/espace"
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
          >
            ← Retour
          </Link>
        </div>

        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-800">
            Photo de profil
          </h2>

          <ProfilePhotoEditor />
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-slate-800">
            Informations personnelles
          </h2>

          <form
            onSubmit={save}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                value={prenom}
                onChange={(event) =>
                  setPrenom(
                    event.target.value,
                  )
                }
                placeholder="Votre prénom"
                aria-label="Prénom"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900"
              />

              <input
                value={nom}
                onChange={(event) =>
                  setNom(
                    event.target.value,
                  )
                }
                placeholder="Votre nom de famille"
                aria-label="Nom"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900"
              />
            </div>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="Votre adresse email"
              aria-label="Email"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900"
            />

            <input
              value={telephone}
              onChange={(event) =>
                setTelephone(
                  event.target.value,
                )
              }
              placeholder="Votre numéro de téléphone"
              aria-label="Téléphone"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900"
            />

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Enregistrement..."
                : "Enregistrer les modifications"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-slate-800">
            Sécurité du compte
          </h2>

          <form
            onSubmit={
              changePassword
            }
            className="space-y-4"
          >
            <input
              type="password"
              required
              minLength={8}
              placeholder="Entrez votre mot de passe actuel"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />

            <input
              type="password"
              required
              minLength={8}
              placeholder="Entrez votre nouveau mot de passe"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />

            <button
              type="submit"
              disabled={
                changingPassword
              }
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {changingPassword
                ? "Modification..."
                : "Modifier le mot de passe"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}