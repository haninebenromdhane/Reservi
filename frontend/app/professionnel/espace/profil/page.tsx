"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  useAuth,
} from "@/components/auth/AuthContext";

import ProfilePhotoEditor from "@/components/auth/ProfilePhotoEditor";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

import {
  apiFetch,
  getApiUrl,
} from "@/lib/api";

type Service = {
  _id: string;
  name: string;
  duration: number;
  price: number;
  currency?: string;
};

type DocumentFile = {
  _id?: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt?: string;
};

type Profession = {
  _id: string;
  name: string;
};

type Profile = {
  _id: string;
  displayName: string;
  licenseNumber?: string;
  city: string;
  address?: string;
  phone?: string;
  description?: string;
  imageUrl?: string;
  isVisible?: boolean;
  status?: string;
  profession?: Profession;
  services: Service[];
  documents: DocumentFile[];
};

export default function ProfessionalProfilPage() {
  const {
    user,
    accessToken,
  } = useAuth();

  const [
    profile,
    setProfile,
  ] =
    useState<Profile | null>(
      null,
    );

  const [
    displayName,
    setDisplayName,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    city,
    setCity,
  ] = useState("");

  const [
    address,
    setAddress,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    licenseNumber,
    setLicenseNumber,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    visible,
    setVisible,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const [
    passwordMessage,
    setPasswordMessage,
  ] = useState("");

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const fileRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  useEffect(() => {
    if (user?.role !== "AGENT") {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await apiFetch<Profile>(
            "/professionals/me",
            {
              token:
                accessToken ??
                undefined,
            },
          );

        setProfile(data);
        setDisplayName(
          data.displayName ?? "",
        );
        setPhone(
          data.phone ?? "",
        );
        setCity(
          data.city ?? "",
        );
        setAddress(
          data.address ?? "",
        );
        setDescription(
          data.description ?? "",
        );
        setLicenseNumber(
          data.licenseNumber ?? "",
        );
        setEmail(
          user.email ?? "",
        );
        setVisible(
          data.isVisible ?? false,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger votre fiche.",
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [
    user,
    accessToken,
  ]);

  const save =
    async (
      event: React.FormEvent,
    ) => {
      event.preventDefault();

      setError("");
      setMessage("");
      setSaving(true);

      try {
        const updated =
          await apiFetch<Profile>(
            "/professionals/me",
            {
              method: "PATCH",
              token:
                accessToken ??
                undefined,
              body: JSON.stringify({
                displayName,
                phone,
                city,
                address,
                description,
                licenseNumber,
                isVisible:
                  visible,
              }),
            },
          );

        if (
          email.trim() !==
          user?.email
        ) {
          await apiFetch(
            "/users/me",
            {
              method: "PATCH",
              token:
                accessToken ??
                undefined,
              body: JSON.stringify({
                email:
                  email
                    .trim()
                    .toLowerCase(),
                phone,
              }),
            },
          );
        }

        setProfile(
          updated,
        );

        setMessage(
          "Profil mis à jour avec succès.",
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de mettre à jour votre profil.",
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

      setPasswordError("");
      setPasswordMessage("");
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

        setPasswordMessage(
          "Un e-mail de confirmation vous a été envoyé. Cliquez sur le lien reçu pour finaliser le changement de mot de passe.",
        );
      } catch (err) {
        setPasswordError(
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

  const upload =
    async (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (
        file.size >
        10 * 1024 * 1024
      ) {
        setError(
          "Le fichier ne doit pas dépasser 10 Mo.",
        );
        return;
      }

      setUploading(true);
      setError("");
      setMessage("");

      try {
        const formData =
          new FormData();

        formData.append(
          "file",
          file,
        );

        const updated =
          await apiFetch<Profile>(
            "/professionals/me/documents",
            {
              method: "POST",
              token:
                accessToken ??
                undefined,
              body: formData,
            },
          );

        setProfile(
          updated,
        );

        setMessage(
          "Document ajouté à votre dossier.",
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible d'envoyer le document.",
        );
      } finally {
        setUploading(false);

        event.target.value = "";
      }
    };

  const [
    documentToDelete,
    setDocumentToDelete,
  ] = useState<DocumentFile | null>(null);

  const [
    deletingDocument,
    setDeletingDocument,
  ] = useState(false);

  const removeDocument =
    async (
      documentId: string,
    ) => {
      setError("");
      setMessage("");
      setDeletingDocument(true);

      try {
        const updated =
          await apiFetch<Profile>(
            `/professionals/me/documents/${documentId}`,
            {
              method: "DELETE",
              token:
                accessToken ??
                undefined,
            },
          );

        setProfile(
          updated,
        );

        setMessage(
          "Document supprimé.",
        );

        setDocumentToDelete(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de supprimer le document.",
        );
      } finally {
        setDeletingDocument(false);
      }
    };

  if (
    !user ||
    user.role !== "AGENT"
  ) {
    return (
      <main className="min-h-screen p-10 text-center">
        Accès refusé.
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen p-10 text-center">
        Chargement de votre fiche...
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen p-10">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-xl font-bold text-red-800">
            Fiche professionnelle introuvable
          </h1>

          <p className="mt-3 text-sm text-red-700">
            {error ||
              "Votre fiche professionnelle n'a pas encore été créée."}
          </p>

          <Link
            href="/professionnel/espace"
            className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
          >
            Retour à mon espace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen backdrop-blur-sm rounded-3xl py-10">
      <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Modifier mon profil professionnel
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Modifiez les informations de votre fiche.
            </p>
          </div>

          <Link
            href="/professionnel/espace"
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
            Informations professionnelles
          </h2>

          <form
            onSubmit={save}
            className="space-y-4"
          >
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="Votre adresse email"
              aria-label="Adresse email"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />

            <input
              value={displayName}
              onChange={(event) =>
                setDisplayName(
                  event.target.value,
                )
              }
              placeholder="Nom affiché sur votre fiche professionnelle"
              aria-label="Nom affiché"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />

            <input
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value,
                )
              }
              placeholder="Numéro de téléphone professionnel"
              aria-label="Téléphone"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />

            <input
              value={city}
              onChange={(event) =>
                setCity(
                  event.target.value,
                )
              }
              placeholder="Ville où vous exercez"
              aria-label="Ville"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />

            <input
              value={address}
              onChange={(event) =>
                setAddress(
                  event.target.value,
                )
              }
              placeholder="Adresse professionnelle complète"
              aria-label="Adresse"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />

            <input
              value={licenseNumber}
              onChange={(event) =>
                setLicenseNumber(
                  event.target.value,
                )
              }
              placeholder="Numéro de licence ou d'inscription professionnelle"
              aria-label="Numéro de licence professionnelle"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />

            <textarea
              rows={5}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Présentez votre activité, votre expérience, vos spécialités et les informations utiles pour les clients..."
              aria-label="Description professionnelle"
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />

            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={visible}
                disabled={
                  profile.status !==
                  "APPROVED"
                }
                onChange={(event) =>
                  setVisible(
                    event.target.checked,
                  )
                }
              />

              <span>
                Visible dans l&apos;annuaire
                {profile.status !==
                  "APPROVED" &&
                  " (disponible après validation)"}
              </span>
            </label>

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
          <h2 className="mb-1 text-lg font-bold text-slate-800">
            Sécurité du compte
          </h2>

          <p className="mb-4 text-sm text-slate-500">
            Un e-mail de confirmation vous sera envoyé pour valider tout changement de mot de passe.
          </p>

          {passwordMessage && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {passwordError}
            </div>
          )}

          <form
            onSubmit={changePassword}
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
              disabled={changingPassword}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {changingPassword
                ? "Envoi en cours..."
                : "Modifier le mot de passe"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">
            Documents de validation
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Vos documents légaux sont conservés dans votre fiche et sont accessibles par l&apos;administrateur.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            onChange={upload}
            disabled={uploading}
            className="mt-5 block w-full text-sm"
          />

          {uploading && (
            <p className="mt-3 text-sm text-slate-500">
              Envoi du document...
            </p>
          )}

          {profile.documents.length ===
          0 ? (
            <p className="mt-5 text-sm text-red-600">
              Aucun document enregistré.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {profile.documents.map(
                (document) => (
                  <div
                    key={
                      document._id ??
                      document.url
                    }
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
                  >
                    <a
                      href={`${getApiUrl()}${document.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {document.name}
                    </a>

                    {document._id && (
                      <button
                        type="button"
                        onClick={() =>
                          setDocumentToDelete(document)
                        }
                        className="text-sm font-semibold text-red-600"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        ouvert={!!documentToDelete}
        titre="Supprimer ce document ?"
        message={`"${documentToDelete?.name ?? ""}" sera définitivement supprimé de votre dossier.`}
        labelConfirmer="Supprimer"
        chargement={deletingDocument}
        onConfirmer={() =>
          documentToDelete?._id && removeDocument(documentToDelete._id)
        }
        onAnnuler={() => setDocumentToDelete(null)}
      />
    </main>
  );
}