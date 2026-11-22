"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/auth/AuthContext";
import { apiFetch } from "@/lib/api";

const schema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères."),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  email: z.string().email("Veuillez entrer une adresse email valide."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe."),
  role: z.enum(["CLIENT", "AGENT"]),
  professionId: z.string().optional(),
  city: z.string().optional(),
  licenseNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, { message: "Les mots de passe ne correspondent pas.", path: ["confirmPassword"] });

type FormData = z.infer<typeof schema>;
type Profession = { _id: string; name: string };

export default function InscriptionPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void apiFetch<Profession[]>("/professions").then(setProfessions).catch(() => setProfessions([]));
  }, []);

  const { control, register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "CLIENT", professionId: "", city: "", licenseNumber: "" },
  });
  const selectedRole = useWatch({ control, name: "role" });

  const onSubmit = async (data: FormData) => {
    setSubmitError(""); setSuccess("");
    try {
      if (data.role === "AGENT") {
        if (!data.professionId || !data.city?.trim()) throw new Error("La profession et la ville sont obligatoires pour un compte agent.");
        if (documents.length === 0) throw new Error("Vous devez joindre au moins un document justificatif avant de créer votre compte agent.");

        const formData = new FormData();
        formData.append("firstName", data.firstName.trim());
        formData.append("lastName", data.lastName.trim());
        formData.append("email", data.email.trim().toLowerCase());
        formData.append("password", data.password);
        formData.append("professionId", data.professionId);
        formData.append("city", data.city.trim());
        if (data.licenseNumber?.trim()) formData.append("licenseNumber", data.licenseNumber.trim());
        for (const file of documents) formData.append("documents", file);

        await apiFetch<{ message: string }>("/auth/register/agent", { method: "POST", body: formData });
        setSuccess("Votre compte agent et votre dossier justificatif ont été envoyés. Votre fiche doit être validée par un administrateur avant activation. Vous pourrez vous connecter après validation.");
        return;
      }

      await apiFetch("/auth/register/client", { method: "POST", body: JSON.stringify({ firstName: data.firstName.trim(), lastName: data.lastName.trim(), email: data.email.trim().toLowerCase(), password: data.password }) });
      await login(data.email, data.password);
      router.push("/");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Une erreur est survenue lors de l'inscription.");
    }
  };

  return (
    <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 text-center"><h1 className="text-3xl font-bold text-gray-900">Créer un compte</h1><p className="mt-2 text-gray-600">Rejoignez Reservi.</p></div>
          {submitError && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{submitError}</div>}
          {success && <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">{success}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div><label htmlFor="firstName" className="mb-2 block text-sm font-medium text-gray-900">Prénom</label><input id="firstName" type="text" placeholder="Votre prénom" {...register("firstName")} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black" />{errors.firstName && <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>}</div>
            <div><label htmlFor="lastName" className="mb-2 block text-sm font-medium text-gray-900">Nom</label><input id="lastName" type="text" placeholder="Votre nom" {...register("lastName")} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black" />{errors.lastName && <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>}</div>
            <div><label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">Email</label><input id="email" type="email" placeholder="exemple@email.com" {...register("email")} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black" />{errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}</div>
            <div><label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900">Mot de passe</label><input id="password" type="password" placeholder="Minimum 8 caractères" {...register("password")} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black" />{errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}</div>
            <div><label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-900">Confirmer le mot de passe</label><input id="confirmPassword" type="password" placeholder="Retapez votre mot de passe" {...register("confirmPassword")} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black" />{errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}</div>
            <div><label htmlFor="role" className="mb-2 block text-sm font-medium text-gray-900">Je souhaite créer un compte en tant que</label><select id="role" {...register("role")} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"><option value="CLIENT">Client</option><option value="AGENT">Agent</option></select></div>
            {selectedRole === "AGENT" && <>
              <div><label htmlFor="professionId" className="mb-2 block text-sm font-medium text-gray-900">Profession</label><select id="professionId" {...register("professionId")} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"><option value="">Sélectionnez une profession</option>{professions.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
              <div><label htmlFor="city" className="mb-2 block text-sm font-medium text-gray-900">Ville</label><input id="city" type="text" placeholder="Votre ville" {...register("city")} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900" /></div>
              <div><label htmlFor="licenseNumber" className="mb-2 block text-sm font-medium text-gray-900">Numéro de licence professionnelle</label><input id="licenseNumber" type="text" placeholder="Ex. LIC-2026-12345" {...register("licenseNumber")} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900" /></div>
              <div><label htmlFor="documents" className="mb-2 block text-sm font-medium text-gray-900">Documents justificatifs *</label><p className="mb-3 text-xs text-gray-500">Ajoutez votre licence, justificatif professionnel ou autre document demandé. PDF, JPG ou PNG, 10 Mo maximum par fichier.</p><input id="documents" type="file" multiple accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocuments(Array.from(e.target.files ?? []))} className="w-full text-sm" />{documents.length > 0 && <p className="mt-2 text-xs text-gray-600">{documents.length} document(s) sélectionné(s).</p>}</div>
            </>}
            <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50">{isSubmitting ? "Création en cours..." : "Créer mon compte"}</button>
          </form>
          <div className="mt-8 border-t border-gray-100 pt-6 text-center"><p className="text-sm text-gray-600">Vous avez déjà un compte ?</p><Link href="/login" className="mt-2 inline-block font-semibold text-gray-900 hover:underline">Se connecter</Link></div>
        </div>
      </div>
    </main>
  );
}
