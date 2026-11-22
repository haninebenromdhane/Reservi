"use client";

import { useState } from "react";
import ProfilePhotoEditor from "@/components/auth/ProfilePhotoEditor";

interface ProfilFormProps {
  role: "CLIENT" | "AGENT";
}

export default function ProfilForm({ role }: ProfilFormProps) {
  const [nom, setNom] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [telephone, setTelephone] = useState("0601020304");

  // Changement de mot de passe
  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmerMdp, setConfirmerMdp] = useState("");
  const [message, setMessage] = useState<{ type: "succes" | "erreur"; texte: string } | null>(null);

  const handleUpdateProfil = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "succes", texte: "Profil mis à jour avec succès !" });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (nouveauMdp !== confirmerMdp) {
      setMessage({ type: "erreur", texte: "Les nouveaux mots de passe ne correspondent pas." });
      return;
    }
    if (nouveauMdp.length < 8) {
      setMessage({ type: "erreur", texte: "Le mot de passe doit faire au moins 8 caractères." });
      return;
    }
    setMessage({ type: "succes", texte: "Mot de passe modifié avec succès !" });
    setAncienMdp("");
    setNouveauMdp("");
    setConfirmerMdp("");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">
        Mon Profil ({role === "CLIENT" ? "Client" : "Professionnel"})
      </h1>

      {message && (
        <div
          className={`p-3 rounded text-sm ${
            message.type === "succes" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.texte}
        </div>
      )}

      {/* Photo de profil */}
      <section className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Photo de profil</h2>
        <ProfilePhotoEditor />
      </section>

      {/* Informations personnelles */}
      <form onSubmit={handleUpdateProfil} className="space-y-4 border-b pb-6">
        <h2 className="text-lg font-semibold text-gray-700">Informations Personnelles</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <input
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="w-full border rounded p-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
        >
          Enregistrer le profil
        </button>
      </form>

      {/* Modification de Mot de Passe */}
      <form onSubmit={handleUpdatePassword} className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Changer de mot de passe</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
          <input
            type="password"
            required
            value={ancienMdp}
            onChange={(e) => setAncienMdp(e.target.value)}
            className="w-full border rounded p-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              required
              value={nouveauMdp}
              onChange={(e) => setNouveauMdp(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              required
              value={confirmerMdp}
              onChange={(e) => setConfirmerMdp(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-800 text-white rounded text-sm font-medium hover:bg-gray-900"
        >
          Mettre à jour le mot de passe
        </button>
      </form>
    </div>
  );
}