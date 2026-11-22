"use client";

import { useState } from "react";

type DirectoryFiltersProps = {
  onSearch: (filters: {
    profession: string;
    ville: string;
    keyword: string;
    sort: string;
  }) => void;
};

export default function DirectoryFilters({
  onSearch,
}: DirectoryFiltersProps) {
  const [profession, setProfession] = useState("");
  const [ville, setVille] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("rating");

  function handleSearch() {
    onSearch({
      profession,
      ville,
      keyword,
      sort,
    });
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-10 rounded-3xlp-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">

        <div>
          <label
            htmlFor="directory-profession"
            className="sr-only"
          >
            Profession
          </label>

          <input
            id="directory-profession"
            type="text"
            value={profession}
            onChange={(event) => setProfession(event.target.value)}
            placeholder="Profession"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-black"
          />
        </div>

        <div>
          <label
            htmlFor="directory-ville"
            className="sr-only"
          >
            Ville
          </label>

          <input
            id="directory-ville"
            type="text"
            value={ville}
            onChange={(event) => setVille(event.target.value)}
            placeholder="Ville"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-black"
          />
        </div>

        <div>
          <label
            htmlFor="directory-keyword"
            className="sr-only"
          >
            Mot-clé
          </label>

          <input
            id="directory-keyword"
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Mot-clé"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-black"
          />
        </div>

        <div>
          <label
            htmlFor="directory-sort"
            className="sr-only"
          >
            Trier par
          </label>

          <select
            id="directory-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-black"
          >
            <option value="rating">Mieux notés</option>
            <option value="reviews">Plus d&apos;avis</option>
            <option value="name">Nom</option>
          </select>
        </div>

      </div>

      <button
        type="button"
        onClick={handleSearch}
        className="mt-4 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        Rechercher
      </button>
    </div>
  );
}