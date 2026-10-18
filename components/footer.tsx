"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, X } from "lucide-react";
import { BsInstagram } from "react-icons/bs";
import { FaEnvelope, FaFacebook, FaPhone, FaTiktok } from "react-icons/fa";
import { LiaLinkedin } from "react-icons/lia";

import logo from "@/components/images/redbg.png";
import { footerList, skincareList } from "./lib/constants";
import { api } from "./lib/api";

export const Footer = () => {
  const pathname = usePathname();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isAdminRoute =
    pathname?.startsWith("/admin") ||
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/reset-password" ||
    pathname === "/forgot-password" ||
    pathname === "/signup-code" ||
    pathname === "/forgot-password/reset";

  if (isAdminRoute) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) return;

    try {
      setLoading(true);
      await api.publicShop.createSubscriber({ name, email });
      setName("");
      setEmail("");
      setShowSuccess(true);
    } catch (error) {
      console.error("Subscription failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="w-full text-primaryBg ">
      <hr className="border w-full border-darkText" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16">
        {/* Main Footer Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Brand & Logo */}
          <div className="flex flex-col space-y-4">
            <Link href="/">
              <Image
                src={logo}
                alt="Seraphé Beauty Logo"
                width={110}
                height={40}
                className="object-contain"
              />
            </Link>
            <p className="text-sm  max-w-xs leading-relaxed">
              Discover curated beauty insights, skincare trends, and premium
              products tailored for you.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-black">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              {footerList.map((item) => {
                const isActive = pathname === item.link;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.link}
                      className={`transition-colors hover:text-black ${
                        isActive ? "font-bold text-black" : "text-primaryBg"
                      }`}
                    >
                      {item.text}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: Skincare & Categories */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-black">
              Categories
            </h4>
            <ul className="space-y-2 text-sm">
              {skincareList.map((item) => {
                const isActive = pathname === item.link;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.link}
                      className={`transition-colors hover:text-black ${
                        isActive ? "font-bold text-black" : "text-primaryBg"
                      }`}
                    >
                      {item.text}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 4: Contact & Socials */}
          <div className="flex flex-col space-y-4" id="contact">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-black">
              Contact Us
            </h4>
            <div className="space-y-2 text-sm ">
              <p className="flex items-center gap-2">
                <FaPhone className="text-primaryBg shrink-0" />
                <a
                  href="tel:+2347059686654"
                  target="_blank"
                  className="hover:underline"
                >
                  +234-705-968-6654
                </a>
              </p>
              <p className="flex items-center gap-2">
                <FaEnvelope className="text-primaryBg shrink-0" />
                <a
                  href="mailto:seraphebeauty.ng@gmail.com"
                  target="_blank"
                  className="hover:underline truncate"
                >
                  seraphebeauty.ng@gmail.com
                </a>
              </p>
            </div>

            {/* Social Links */}
            <div className="pt-2 flex items-center gap-4 text-black">
              <a
                href="https://www.tiktok.com/@seraphe_beauty?_r=1&_t=ZS-98gQMkgDp15"
                aria-label="TikTok"
                target="_blank"
                className="hover:text-primaryText transition-colors"
              >
                <FaTiktok size={18} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primaryText transition-colors"
              >
                <LiaLinkedin size={22} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primaryText transition-colors"
              >
                <FaFacebook size={18} />
              </a>
              <Link
                href="https://instagram.com/seraphe_beauty"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-primaryText transition-colors"
              >
                <BsInstagram size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-text-darkText">
          <div className="max-w-xl">
            <h4 className="text-base font-semibold text-black">
              Stay connected
            </h4>
            <p className="text-sm  mt-1">
              Subscribe to get notified about our latest stories, products, and
              updates.
            </p>

            <form onSubmit={handleSubmit} className="mt-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="flex-1 border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-primaryBg focus:bg-white rounded-sm"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-primaryBg focus:bg-white rounded-sm"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primaryBg text-white px-6 py-2.5 text-sm uppercase tracking-wider font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 rounded-sm"
                >
                  {loading ? "Joining..." : "Sign Up"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-gray-400 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>© 2026 SeraphéBeauty. All rights reserved.</p>
          <div className="flex gap-6">
            <Link
              href="/privacy-policy"
              target="_blank"
              className="hover:underline hover:text-black"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline hover:text-black">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6 backdrop-blur-sm"
          onClick={() => setShowSuccess(false)}
        >
          <div
            className="relative w-full max-w-md bg-white p-8 md:p-10 text-center shadow-2xl rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSuccess(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition"
            >
              <X size={20} />
            </button>

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white">
                <Check size={28} strokeWidth={3} />
              </div>
            </div>

            <p className="uppercase tracking-[0.2em] text-yellow-600 text-xs font-semibold mb-2">
              Welcome to Seraphé
            </p>

            <h2 className="font-serif text-2xl md:text-3xl text-black font-medium">
              You&apos;re officially subscribed!
            </h2>

            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Thank you for joining our community. We&apos;ll keep you updated
              with the latest beauty insights and trends.
            </p>

            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="mt-6 w-full bg-primaryBg py-3 text-sm uppercase tracking-wider text-white transition hover:opacity-90 rounded-sm font-medium"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
