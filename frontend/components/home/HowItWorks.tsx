const steps = [
  {
    number: "01",
    title: "Recherchez",
    description:
      "Recherchez un professionnel selon son métier, sa ville ou un mot-clé.",
  },
  {
    number: "02",
    title: "Consultez",
    description:
      "Consultez la fiche du professionnel, ses informations, ses disponibilités et ses avis.",
  },
  {
    number: "03",
    title: "Réservez",
    description:
      "Choisissez un créneau disponible et envoyez votre demande de rendez-vous.",
  },
];

export default function HowItWorks() {
  return (
    <section className="backdrop-blur-sm p-10 rounded-3xl px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Simple et rapide
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Comment ça marche ?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Quelques étapes suffisent pour trouver un professionnel et
            organiser votre rendez-vous.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                {step.number}
              </div>

              <h3 className="mt-5 text-xl font-semibold text-gray-900">
                {step.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}