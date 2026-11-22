"use client";

import Link from "next/link";
import Image from "next/image";

interface ProfessionnelProps {
  id: string;
  nom: string;
  profession: string;
  image?: string;
  note?: number;
}

export function CarteProfessionnel({
  id = "1",
  nom,
  profession,
  image = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
  note = 4.8,
}: ProfessionnelProps) {
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <Image
          src={image}
          alt={nom}
          width={60}
          height={60}
          className="rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{nom}</h3>
          <p className="text-sm text-blue-600">{profession}</p>
          <p className="text-xs text-amber-500 mt-1">★ {note} / 5</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t flex justify-end">
        <Link
          href={`/professionnel/${id}`}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Voir la fiche
        </Link>
      </div>
    </div>
  );
}

export default CarteProfessionnel;