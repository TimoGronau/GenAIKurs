"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Rezepte", match: (p) => p === "/" || p.startsWith("/rezepte") },
  { href: "/vorrat", label: "Vorrat", match: (p) => p.startsWith("/vorrat") },
  { href: "/heute", label: "Heute kochen", match: (p) => p.startsWith("/heute") },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="nav nav-pills">
      {LINKS.map((l) => {
        const active = l.match(pathname);
        return (
          <li className="nav-item" key={l.href}>
            <Link href={l.href} className={"nav-link py-1" + (active ? " active" : "")} aria-current={active ? "page" : undefined}>
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
