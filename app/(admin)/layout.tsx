"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/components/images/short-logo.png";
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
import { Loader, Menu, User, UsersRound, X } from "lucide-react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { isAuthenticated, loading } = useAuth();

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

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
        <aside>
          <div className=" hidden lg:block bg-gray-100 border-rack border-darkText shrink-0">
            <nav className="flex flex-col gap-2 p-2 md:p-4">
              <Link
                href="/admin"
                className="shrink-0 flex gap-1 pb-2 items-center transition-opacity hover:opacity-90"
              >
                <Image
                  src={logo}
                  alt="Seraphé Logo"
                  width={50}
                  height={50}
                  priority
                  className="md:w-10 w-8 mt-2"
                />
                <div className=" mt-3">
                  <h1 className="font-bold text-lg">Seraphé</h1>
                  <p className="text-[6px] uppercase">
                    Elevating African Beauty
                  </p>
                </div>
              </Link>
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
                    <span className=" text-sm">{item.text}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="block mt-4 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-secondary hover:text-black rounded-full hover:bg-black/50"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
              onClick={closeMobileMenu}
            >
              <div className="absolute left-0 top-0 bottom-0 w-full max-w-xs bg-gray-100 border-l border-stone-800 p-6 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between pb-6">
                    <Link
                      href="/admin"
                      className="shrink-0 flex gap-1 pb-2 items-center transition-opacity hover:opacity-90"
                    >
                      <Image
                        src={logo}
                        alt="Seraphé Logo"
                        width={50}
                        height={50}
                        priority
                        className="md:w-10 w-8 mt-2"
                      />
                      <div className=" mt-3">
                        <h1 className="font-bold text-lg">Seraphé</h1>
                        <p className="text-[6px] uppercase">
                          Elevating African Beauty
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={closeMobileMenu}
                      className="p-1 text-stone-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    {AdminNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.link;

                      return (
                        <Link
                          key={item.text}
                          href={item.link}
                          className={`group relative flex justify-start gap-1 md:gap-3 rounded-lg px-2 md:px-4 py-3 transition-colors ${
                            isActive
                              ? "bg-primaryBg text-secondaryText font-semibold"
                              : "text-black hover:bg-darkText hover:text-white"
                          }`}
                        >
                          <Icon className="text-xl shrink-0" />

                          {/* Desktop Label */}
                          <span className=" text-sm">{item.text}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Main Content Pane */}

      <main className="flex-1 overflow-y-auto max-h-screen">
        <AdminNav />
        <div className="px-1 py-4 md:p-12 ">{children}</div>

        <Toaster richColors position="top-right" />
      </main>
    </div>
  );
}
