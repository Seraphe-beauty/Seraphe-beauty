"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GrDashboard } from "react-icons/gr";
import { BiCategory, BiShoppingBag } from "react-icons/bi";
import {
  FaLifeRing,
  FaRegCommentDots,
  FaTag,
  FaTripadvisor,
  FaUserFriends,
} from "react-icons/fa";
import { Toaster } from "sonner";
import { useAuth } from "@/components/context/authContext";
import AdminNav from "@/components/admin/nav";
import { Loader, User, UsersRound } from "lucide-react";

export const AdminNavItems = [
  { icon: GrDashboard, text: "Dashboard", link: "/admin" },
  { icon: BiCategory, text: "Categories", link: "/admin/categories" },
  { icon: BiShoppingBag, text: "Products", link: "/admin/products" },
  { icon: FaRegCommentDots, text: "Reviews", link: "/admin/reviews" },
  { icon: FaTripadvisor, text: "Beauty Tips", link: "/admin/beauty-tips" },
  { icon: FaLifeRing, text: "Lifestyle", link: "/admin/lifestyle" },
  { icon: FaTag, text: "Trends", link: "/admin/trends" },
  { icon: User, text: "Models", link: "/admin/models" },
  { icon: FaUserFriends, text: "Subscribers", link: "/admin/subscribers" },
  { icon: UsersRound, text: "Team", link: "/admin/team" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen text-black ">
      {/* Side Navigation Bar */}
      {isAuthenticated && (
        <aside className="w-16 md:w-64 bg-gray-100 border-rack border-darkText shrink-0">
          <nav className="flex flex-col gap-2 p-2 md:p-4">
            {AdminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.link;

              return (
                <Link
                  key={item.text}
                  href={item.link}
                  className={`group relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 rounded-lg px-2 md:px-4 py-3 transition-colors ${
                    isActive
                      ? "bg-primaryBg text-secondaryText font-semibold"
                      : "text-black hover:bg-darkText hover:text-white"
                  }`}
                >
                  <Icon className="text-xl shrink-0" />

                  {/* Desktop Label */}
                  <span className="hidden md:inline text-sm">{item.text}</span>

                  {/* Mobile Tooltip */}
                  <span
                    className="
      absolute left-full ml-3
      whitespace-nowrap
      rounded-md
      bg-gray-900
      px-3 py-2
      text-xs
      text-white
      opacity-0
      invisible
      transition-all
      duration-200
      group-hover:opacity-100
      group-hover:visible
      md:hidden
      z-50
      shadow-lg
    "
                  >
                    {item.text}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      {/* Main Content Pane */}

      <main className="flex-1 overflow-y-auto max-h-screen">
        <AdminNav />
        <div className="p-1 md:p-12 ">{children}</div>

        <Toaster richColors position="top-right" />
      </main>
    </div>
  );
}
