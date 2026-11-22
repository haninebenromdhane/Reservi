"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Fonction utilitaire pour vérifier si un lien est actif ou correspond à la sous-route
  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/60 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/60 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo + platform name avec effet scale */}
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
            <Image
              src="/logo.png"
              alt="Reservi"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>

          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reservi
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-4 flex-wrap justify-end">

          {/* Always available */}
          <NavLink href="/annuaire" active={isActive("/annuaire")}>
            Annuaire
          </NavLink>

          <NavLink href="/contact" active={isActive("/contact")}>
            Contact
          </NavLink>

          {/* Nobody is connected */}
          {!user && (
            <>
              <NavLink href="/inscription" active={isActive("/inscription")}>
                Créer un compte
              </NavLink>

              <Link
                href="/login"
                className="btn-dynamic rounded-xl bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-600 dark:hover:bg-blue-600"
              >
                Se connecter
              </Link>
            </>
          )}

          {/* CLIENT */}
          {user?.role === "CLIENT" && (
            <>
              <NavLink href="/client/espace" active={isActive("/client/espace")}>
                Mon espace
              </NavLink>

              <NavLink href="/client/espace/rendez-vous" active={isActive("/client/espace/rendez-vous")}>
                Mes rendez-vous
              </NavLink>

              <NavLink href="/client/espace/avis" active={isActive("/client/espace/avis")}>
                Mes avis
              </NavLink>

              <button
                type="button"
                onClick={logout}
                className="btn-dynamic rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/30"
              >
                Déconnexion
              </button>
            </>
          )}

          {/* AGENT */}
          {user?.role === "AGENT" && (
            <>
              <NavLink href="/professionnel/espace" active={isActive("/professionnel/espace")}>
                Mon espace
              </NavLink>

              <NavLink href="/professionnel/espace/fiche" active={isActive("/professionnel/espace/fiche")}>
                Ma fiche
              </NavLink>

              <NavLink href="/professionnel/espace/rendez-vous" active={isActive("/professionnel/espace/rendez-vous")}>
                Mon agenda
              </NavLink>

              <button
                type="button"
                onClick={logout}
                className="btn-dynamic rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/30"
              >
                Déconnexion
              </button>
            </>
          )}
{/* ADMIN */}
{user?.role === "ADMIN" && (
  <>
    <NavLink href="/admin/espace" active={isActive("/admin/espace")}>
      Tableau de bord
    </NavLink>

    <NavLink href="/admin/espace/agent" active={isActive("/admin/espace/agent")}>
      Gestion agents
    </NavLink>

    <NavLink href="/admin/espace/client" active={isActive("/admin/espace/client")}>
      Gestion clients
    </NavLink>

    <NavLink href="/admin/espace/audit" active={isActive("/admin/espace/audit")}>
      Journal d&apos;audit
    </NavLink>

    <NavLink href="/admin/espace/avis" active={isActive("/admin/espace/avis")}>
      Avis
    </NavLink>

    <button
      type="button"
      onClick={logout}
      className="btn-dynamic rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/30"
    >
      Déconnexion
    </button>
  </>
)}

        </nav>
      </div>
    </header>
  );
}

// Composant interne réutilisable pour les liens avec effet de soulignement fluide
function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 group ${
        active
          ? "text-blue-600 dark:text-blue-400 font-semibold"
          : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
      }`}
    >
      {children}
      {/* Ligne animée : s'affiche si actif, ou glisse fluidement au survol */}
      <span
        className={`absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 ease-out transform ${
          active
            ? "scale-x-100 opacity-100"
            : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
        }`}
      />
    </Link>
  );
}