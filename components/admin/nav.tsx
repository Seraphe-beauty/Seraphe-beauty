"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/authContext";
import { LogOut, ChevronDown, User, Search, X } from "lucide-react";
import Image from "next/image";
import Logo from "@/components/images/short-logo.png";
import { BiHomeAlt } from "react-icons/bi";
import { AdminNavItems } from "@/app/(admin)/layout";
import { useSite } from "../helper/siteContext";

const AdminNav = () => {
  const { admin, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const { products, categories, tips, trends } = useSite();

  const query = searchQuery.trim().toLowerCase();

  const navResults = query
    ? AdminNavItems.filter((item) => item.text.toLowerCase().includes(query))
    : [];

  const productResults = query
    ? products.filter((product) => product.name.toLowerCase().includes(query))
    : [];

  const categoryResults = query
    ? categories.filter((category) =>
        category.name.toLowerCase().includes(query),
      )
    : [];

  const tipResults = query
    ? tips.filter((tip) => tip.title.toLowerCase().includes(query))
    : [];

  const trendResults = query
    ? trends.filter((trend) => trend.title.toLowerCase().includes(query))
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push("/signIn");
  };

  // Generate 1-2 letter uppercase initials
  const initials = admin?.name
    ? admin.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="relative md:w-[40%]">
          <input
            type="text"
            className="w-full rounded-full border border-black py-2 pl-10 pr-4 text-sm text-foreground outline-none "
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
          />

          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <X
              className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => {
                setSearchQuery("");
                setSearchOpen(false);
              }}
            />
          )}
        </div>
        <div className="flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 md:px-2 md:py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-xs"
          >
            <BiHomeAlt size={20} />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-full sm:rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all focus:outline-hidden"
              aria-expanded={dropdownOpen}
            >
              <div className="h-9 w-9 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-xs overflow-hidden shadow-xs ring-2 ring-gray-100">
                {admin?.avatar ? (
                  <img
                    src={admin.avatar}
                    alt={admin?.name || "Admin"}
                    className="h-full w-full object-cover"
                  />
                ) : initials ? (
                  <span>{initials}</span>
                ) : (
                  <User size={18} className="text-gray-300" />
                )}
              </div>

              {/* Admin Name & Role label (Desktop) */}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs uppercase font-semibold text-gray-900 leading-tight">
                  {admin?.name || "Admin Account"}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  {admin?.email || "Administrator"}
                </span>
              </div>

              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 hidden sm:block ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-gray-100 shadow-xl py-1 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <p className="text-xs font-semibold text-gray-900 truncate uppercase">
                    {admin?.name || "Admin"}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    {admin?.email || "admin@seraphe.com"}
                  </p>
                </div>

                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    <span>Log out session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {searchOpen && query && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-50">
          {navResults.length > 0 && (
            <div className="border-b border-gray-100">
              <p className="px-4 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Navigation
              </p>

              {navResults.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.text}
                    href={item.link}
                    onClick={() => {
                      setSearchQuery("");
                      setSearchOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"
                  >
                    <Icon size={17} />
                    <span>{item.text}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Products */}
          {productResults.length > 0 && (
            <div className="border-b border-gray-100">
              <p className="px-4 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Products
              </p>

              {productResults.map((product) => (
                <Link
                  key={product._id}
                  href={`admin/products`}
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="block px-4 py-2.5 text-sm hover:bg-gray-50"
                >
                  {product.name}
                </Link>
              ))}
            </div>
          )}

          {/* Categories */}
          {categoryResults.length > 0 && (
            <div className="border-b border-gray-100">
              <p className="px-4 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Categories
              </p>

              {categoryResults.map((category) => (
                <Link
                  key={category._id}
                  href={`/admin/categories`}
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="block px-4 py-2.5 text-sm hover:bg-gray-50"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {/* Beauty Tips */}
          {tipResults.length > 0 && (
            <div className="border-b border-gray-100">
              <p className="px-4 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Beauty Tips
              </p>

              {tipResults.map((tip) => (
                <Link
                  key={tip._id}
                  href={`/admin/beauty-tips/`}
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="block px-4 py-2.5 text-sm hover:bg-gray-50"
                >
                  {tip.title}
                </Link>
              ))}
            </div>
          )}

          {/* Trends */}
          {trendResults.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Trends
              </p>

              {trendResults.map((trend) => (
                <Link
                  key={trend._id}
                  href={`/admin/trends/`}
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="block px-4 py-2.5 text-sm hover:bg-gray-50"
                >
                  {trend.title}
                </Link>
              ))}
            </div>
          )}

          {/* Nothing found */}
          {navResults.length === 0 &&
            productResults.length === 0 &&
            categoryResults.length === 0 &&
            tipResults.length === 0 &&
            trendResults.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No results found for "{searchQuery}"
              </div>
            )}
        </div>
      )}
    </header>
  );
};

export default AdminNav;
