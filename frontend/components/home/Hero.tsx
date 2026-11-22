import SearchBar from "./SearchBar";

export default function Hero() {
  return (
    <section className="backdrop-blur-sm p-10 rounded-3xl px-4 py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Bienvenue sur Reservi
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Trouvez le professionnel qu&apos;il vous faut
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
          Recherchez un professionnel, consultez sa fiche et trouvez un
          créneau disponible pour prendre rendez-vous simplement.
        </p>

        <div className="mt-10">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}