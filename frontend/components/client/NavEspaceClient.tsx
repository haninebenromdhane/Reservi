"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavEspaceClient() {
  const pathname = usePathname();

  const links = [
    { href: "/client/espace", label: "Mes Rendez-vous" },
    { href: "/annuaire", label: "Prendre un rendez-vous" }, // Redirige vers l'annuaire complet
    { href: "/client/espace/profil", label: "Mon Profil & Sécurité" },
  ];

  return (
    <nav className="flex gap-4 border-b pb-3 mb-6">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 text-sm font-medium rounded-md transition ${
              isActive
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}