"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function NavLink({
  href,
  children,
}: NavLinkProps) {
  const pathname = usePathname();

  const isActive =
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={clsx(
        "rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200",
        isActive
          ? "bg-indigo-600 text-white"
          : "text-slate-300 hover:text-white hover:bg-white/5"
      )}
    >
      {children}
    </Link>
  );
}