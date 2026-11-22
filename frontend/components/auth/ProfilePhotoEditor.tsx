"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthContext";
import { apiFetch, getApiUrl } from "@/lib/api";

export default function ProfilePhotoEditor() {
  const { user, accessToken, updateAvatarUrl } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  if (!user) {
    return null;
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    // Toujours vider l'input pour permettre de re-sélectionner le
    // même fichier plus tard (ex: après une erreur).
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (!file) {
      return;
    }

    setMessage("");
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La photo ne doit pas dépasser 5 Mo.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      /*
       * Envoie réellement le fichier au serveur (multipart/form-data)
       * et persiste l'URL renvoyée : contrairement à l'ancien
       * comportement, l'aperçu n'est pas simulé côté client, c'est
       * bien la photo enregistrée en base qui s'affiche ensuite.
       */
      const updated = await apiFetch<{ avatarUrl?: string }>(
        "/users/me/avatar",
        {
          method: "POST",
          token: accessToken ?? undefined,
          body: formData,
        },
      );

      if (updated.avatarUrl) {
        updateAvatarUrl(updated.avatarUrl);
        setMessage("Photo de profil mise à jour.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de mettre à jour la photo de profil.",
      );
    } finally {
      setUploading(false);
    }
  };

  const photoSrc = user.avatarUrl
    ? user.avatarUrl.startsWith("http")
      ? user.avatarUrl
      : `${getApiUrl()}${user.avatarUrl}`
    : null;

  return (
    <div className="flex flex-col items-center">
      <div className="h-32 w-32 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
        {photoSrc ? (
          <Image
            src={photoSrc}
            alt="Photo de profil"
            width={128}
            height={128}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-gray-500">
            {user.firstName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="mt-4 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        {uploading ? "Envoi en cours..." : "Modifier la photo"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="mt-2 text-center text-xs text-gray-500">
        JPG, PNG ou autre image — 5 Mo maximum.
      </p>

      {message && (
        <p className="mt-3 text-sm font-medium text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
