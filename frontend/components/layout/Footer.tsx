import Link from "next/link";

export default function Footer() {
  return (
    <footer className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/60 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/60 transition-colors">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">

        {/* Présentation du site */}
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Reservi
          </h2>

          <p className="mt-3 max-w-sm text-sm leading-6 text-gray-600">
            Reservi est une plateforme de réservation qui permet aux clients
            de trouver des professionnels, consulter leurs informations et
            demander un rendez-vous.
          </p>
        </div>

        {/* Assistance */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            Assistance
          </h2>

          <nav className="mt-4 flex flex-col gap-3">
            <Link
              href="/motDePasseOublie"
              className="text-sm text-gray-600 hover:text-black"
            >
              Mot de passe oublié
            </Link>

            <Link
              href="/contact"
              className="text-sm text-gray-600 hover:text-black"
            >
              Contact
            </Link>

            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-black"
            >
              Se connecter
            </Link>
          </nav>
        </div>

        {/* Fiches légales */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            Fiches légales
          </h2>

          <nav className="mt-4 flex flex-col gap-3">
            <Link
              href="/fiche"
              className="text-sm text-gray-600 hover:text-black"
            >
              Fiche
            </Link>

            <Link
              href="/cgu"
              className="text-sm text-gray-600 hover:text-black"
            >
              CGU
            </Link>

            <Link
              href="/confidentialite"
              className="text-sm text-gray-600 hover:text-black"
            >
              Confidentialité
            </Link>
          </nav>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 px-4 py-6">
        <p className="text-center text-sm text-gray-500">
          © 2026 Reservi. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}