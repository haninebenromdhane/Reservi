"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/components/auth/AuthContext";

const loginSchema =
  z.object({
    email: z
      .string()
      .email(
        "Veuillez entrer une adresse email valide.",
      ),

    password: z
      .string()
      .min(
        1,
        "Veuillez entrer votre mot de passe.",
      ),
  });

type LoginFormData =
  z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } =
    useAuth();

  const router =
    useRouter();

  const [loginError, setLoginError] =
    useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormData>({
    resolver:
      zodResolver(loginSchema),
  });

  const onSubmit = async (
    data: LoginFormData,
  ) => {
    setLoginError("");

    try {
      const user =
        await login(
          data.email.trim().toLowerCase(),
          data.password,
        );

      switch (user.role) {
        case "CLIENT":
          router.push(
            "/client/espace",
          );
          break;

        case "AGENT":
          router.push(
            "/professionnel/espace",
          );
          break;

        case "ADMIN":
          router.push(
            "/admin/espace",
          );
          break;
      }
    } catch (error) {
      setLoginError(
        error instanceof Error
          ? error.message
          : "Email ou mot de passe incorrect.",
      );
    }
  };


  return (
    <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Connexion
            </h1>

            <p className="mt-2 text-gray-600">
              Connectez-vous à votre compte Reservi.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                {...register("email")}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
              />

              {errors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Mot de passe
              </label>

              <input
                id="password"
                type="password"
                {...register("password")}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
              />

              {errors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {loginError && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {loginError}
              </div>
            )}

            <div className="text-right">
              <Link
  href="/mot-de-passe-oublie"
  className="text-sm font-medium text-blue-600 hover:text-blue-500"
>
  Mot de passe oublié ?
</Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-8 border-t border-gray-100 pt-6 text-center">
            <Link
              href="/inscription"
              className="font-semibold text-gray-900 hover:underline"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}