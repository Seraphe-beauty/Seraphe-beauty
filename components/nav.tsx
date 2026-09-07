"use client";

import Image from "next/image";
import logo from "@/components/images/whitebg.png";
import Link from "next/link";
import { Menu, Search, X, ChevronRight, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useNavItems } from "./lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import PredictiveSearch from "./search";
import { useSite } from "./helper/siteContext";

export const Nav = () => {
  const navItems = useNavItems();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(
    null,
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hoveredDesktopMenu, setHoveredDesktopMenu] = useState<string | null>(
    null,
  );

  const pathname = usePathname();
  const { products, categories, tips, trends } = useSite();
  const isAdminRoute =
    pathname?.startsWith("/admin") ||
    pathname === "/signin" ||
    pathname === "/signup";

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

  if (isAdminRoute) return null;

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setActiveMobileSubmenu(null);
  };

  const selectedSubmenu = navItems.find(
    (item) => item.text === activeMobileSubmenu,
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-secondary border-b border-stone-800/60 shadow-xs backdrop-blur-md text-secondaryText p-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Bar */}
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="shrink-0 transition-opacity hover:opacity-90"
            >
              <Image
                src={logo}
                alt="Seraphé Logo"
                width={190}
                height={50}
                priority
                className="w-40 md:w-50 h-autoS object-contain"
              />
            </Link>

            {/* Desktop Search Trigger */}
            <div className="flex-1 mt-4 max-w-50 mx-6 hidden lg:block">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="w-full bg-secondaryText hover:bg-stone-900 border border-stone-700/60 rounded-md px-4 py-2 flex items-center justify-between text-darkText hover:text-stone-200 transition-all text-xs tracking-wider"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-stone-400" />
                  <span>Search Seraphé </span>
                </div>
                {/* <kbd className="hidden lg:inline-block bg-stone-800 text-stone-400 px-2 py-0.5 rounded text-[10px] font-mono border border-stone-700">
                  ⌘K
                </kbd> */}
              </button>
            </div>

            {/* Actions: Mobile Search + Mobile Menu Button */}
            <div className="flex items-center mt-4 gap-3 lg:hidden">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-stone-300 hover:text-white rounded-full hover:bg-stone-800/50"
                aria-label="Open Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-stone-300 hover:text-white rounded-full hover:bg-stone-800/50"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <hr className="w-full border text-secondaryText my-1  lg:block hidden" />
          <div
            className="hidden lg:block relative"
            onMouseLeave={() => setHoveredDesktopMenu(null)}
          >
            <ul className="flex justify-center gap-10 text-xs tracking-widest uppercase font-medium">
              {navItems.map((item) => {
                const isActive = pathname === item.link;
                const isHovered = hoveredDesktopMenu === item.text;

                return (
                  <li
                    key={item.id}
                    onMouseEnter={() => setHoveredDesktopMenu(item.text)}
                    className="relative py-4"
                  >
                    <Link
                      href={item.link}
                      className={`transition-colors py-1 ${
                        isActive || isHovered
                          ? "text-yellowText font-semibold"
                          : "text-stone-300 hover:text-stone-100"
                      }`}
                    >
                      {item.text}
                    </Link>

                    {/* Active Route Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellowText"
                      />
                    )}

                    {/* Desktop Dropdown Submenu */}
                    <AnimatePresence>
                      {isHovered && item.children && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-1/2 -translate-x-1/2 top-full w-64 bg-secondary border border-stone-800 shadow-2xl rounded-b-xl py-3 z-50"
                        >
                          <div className="flex flex-col gap-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.link}
                                href={child.link}
                                className="px-5 py-2.5 text-xs text-stone-300 hover:text-yellowText hover:bg-stone-800/50 transition-colors capitalize tracking-normal"
                              >
                                {child.text}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 mt-6 bg-black/60 backdrop-blur-xs lg:hidden"
            onClick={closeMobileMenu}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-secondary border-l border-stone-800 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-stone-800">
                  <span className="text-xs uppercase tracking-widest text-stone-400 font-semibold">
                    Navigation
                  </span>
                  <button
                    onClick={closeMobileMenu}
                    className="p-1 text-stone-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Submenu Slide Views */}
                <AnimatePresence mode="wait">
                  {!activeMobileSubmenu ? (
                    <motion.ul
                      key="main-menu"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="py-6 space-y-4 uppercase tracking-wider text-sm font-medium"
                    >
                      {navItems.map((item) => (
                        <li key={item.id}>
                          {item.children ? (
                            <button
                              onClick={() => setActiveMobileSubmenu(item.text)}
                              className="flex items-center justify-between uppercase w-full py-2 text-stone-200 hover:text-yellowText text-left"
                            >
                              <span>{item.text}</span>
                              <ChevronRight className="w-4 h-4 text-stone-500" />
                            </button>
                          ) : (
                            <Link
                              href={item.link}
                              onClick={closeMobileMenu}
                              className={`block py-2 ${
                                pathname === item.link
                                  ? "text-yellowText font-semibold"
                                  : "text-stone-200 hover:text-yellowText"
                              }`}
                            >
                              {item.text}
                            </Link>
                          )}
                        </li>
                      ))}
                    </motion.ul>
                  ) : (
                    <motion.div
                      key="submenu"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="py-6"
                    >
                      <button
                        onClick={() => setActiveMobileSubmenu(null)}
                        className="flex items-center gap-2 text-xs font-semibold text-yellowText uppercase tracking-wider mb-6 hover:underline"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to menu
                      </button>

                      <p className="text-xs uppercase font-bold text-stone-400 mb-4 tracking-wider">
                        {selectedSubmenu?.text}
                      </p>

                      <ul className="space-y-3 text-sm">
                        {selectedSubmenu?.children?.map((child) => (
                          <li key={child.link}>
                            <Link
                              href={child.link}
                              onClick={closeMobileMenu}
                              className="block py-1 text-stone-300 hover:text-yellowText capitalize"
                            >
                              {child.text}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Predictive Search Modal */}
      <PredictiveSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        blogs={tips}
        trends={trends}
        collections={categories}
      />
    </>
  );
};
