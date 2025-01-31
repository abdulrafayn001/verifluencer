"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Products", href: "/products" },
  { label: "Monetization", href: "/monetization" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Admin", href: "/admin" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-90">
          <div className="h-6 w-6 rounded-full bg-emerald-500" />
          <span className="text-lg font-semibold">VerifyInfluencers</span>
        </Link>
        <div className="flex items-center space-x-6 p-4">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${
                pathname === item.href
                  ? "text-emerald-500"
                  : "text-gray-300 hover:text-emerald-400"
              }`}
            >
              <span className="mr-2">{item.label}</span>
            </Link>
          ))}
          <button
            className="rounded-full bg-gray-800 px-4 py-1.5 hover:bg-gray-700 transition-colors"
            onClick={() => {
              /* Add sign out logic */
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
