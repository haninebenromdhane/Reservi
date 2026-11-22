"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();

  const [profession, setProfession] = useState("");
  const [ville, setVille] = useState("");
  const [keyword, setKeyword] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (profession.trim()) {
      params.set("profession", profession.trim());
    }

    if (ville.trim()) {
      params.set("ville", ville.trim());
    }

    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    }

    const query = params.toString();

    router.push(query ? `/annuaire?${query}` : "/annuaire");
  }

  return (
    <form
      onSubmit={handleSearch}
      className="mx-auto grid max-w-4xl gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto]"
    >
      <div>
        <label htmlFor="profession" className="sr-only">
          Profession
        </label>

        <input
          id="profession"
          type="text"
          value={profession}
          onChange={(event) => setProfession(event.target.value)}
          placeholder="Profession"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black"
        />
      </div>

      <div>
        <label htmlFor="ville" className="sr-only">
          Ville
        </label>

        <input
          id="ville"
          type="text"
          value={ville}
          onChange={(event) => setVille(event.target.value)}
          placeholder="Ville"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black"
        />
      </div>

      <div>
        <label htmlFor="keyword" className="sr-only">
          Mot-clé
        </label>

        <input
          id="keyword"
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Mot-clé"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black"
        />
      </div>

      <button
        type="submit"
        className="btn-dynamic px-4 py-2  text-white rounded-xl rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
      >
        Rechercher
      </button>
    </form>
  );
}