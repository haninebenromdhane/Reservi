import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-12">
      <div className="mx-auto max-w-4xl">

        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Reservi
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Contactez-nous
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Une question, un problème ou besoin d&apos;assistance ?
            Notre équipe est à votre disposition.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Email */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Email
            </h2>

            <p className="mt-2 text-gray-600">
              Pour toute demande générale, contactez-nous par email.
            </p>

            <a
              href="mailto:contact@reservi.tn"
              className="mt-4 inline-block font-medium text-gray-900 hover:underline"
            >
              contact@reservi.tn
            </a>
          </div>

          {/* Téléphone */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Téléphone
            </h2>

            <p className="mt-2 text-gray-600">
              Notre équipe est disponible pour répondre à vos questions.
            </p>

            <a
              href="tel:+21600000000"
              className="mt-4 inline-block font-medium text-gray-900 hover:underline"
            >
              +216 00 000 000
            </a>
          </div>

          {/* Assistance */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Assistance
            </h2>

            <p className="mt-2 text-gray-600">
              Vous rencontrez un problème avec votre compte ?
            </p>

            <Link
              href="/motDePasseOublie"
              className="mt-4 inline-block font-medium text-gray-900 hover:underline"
            >
              Mot de passe oublié
            </Link>
          </div>

          {/* Devenir agent */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Vous êtes professionnel ?
            </h2>

            <p className="mt-2 text-gray-600">
              Rejoignez Reservi en créant un compte professionnel.
            </p>

            <Link
              href="/inscription"
              className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Devenir agent
            </Link>
          </div>

        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="font-medium text-gray-700 hover:text-black hover:underline"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>

      </div>
    </main>
  );
}