"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Category, Product, Tips, Trends } from "./types/api";
import Link from "next/link";

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  img?: string;
  slug: string;
  keywords: string;
  category: "products" | "collections" | "blogs" | "trends";
}

interface PredictiveSearchProps {
  isOpen: boolean;
  onClose: () => void;

  products: Product[];
  blogs: Tips[];
  collections: Category[];
  trends: Trends[];
}
type TabType = "all" | "products" | "collections" | "blogs" | "trends";

export default function PredictiveSearch({
  isOpen,
  onClose,
  products,
  blogs,
  collections,
  trends,
}: PredictiveSearchProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("products");
  //   const [filteredResults, setFilteredResults] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const searchItems = useMemo<SearchItem[]>(
    () => [
      ...products.map((product) => ({
        id: product._id,
        title: product.name,
        subtitle: product.shortDescription,
        img: product.images[0],
        slug: `/shop/products/${product.slug}`,
        category: "products" as const,
        keywords: [
          product.name,
          product.shortDescription,
          product.category.name,
        ].join(" "),
      })),

      ...collections.map((category) => ({
        id: category._id,
        title: category.name,
        slug: `/shop/products/${category.slug}`,
        category: "collections" as const,
        keywords: category.name,
      })),

      ...blogs.map((blog) => ({
        id: blog._id,
        title: blog.title,
        subtitle: blog.summary,
        img: blog.images?.[0],
        slug: `/beauty-tips/${blog.slug}`,
        category: "blogs" as const,
        keywords: [blog.title, blog.summary, blog.category].join(" "),
      })),

      ...trends.map((trend) => ({
        id: trend._id,
        title: trend.title,
        slug: trend.slug,
        category: "trends" as const,
        keywords: [trend.title, trend.summary, trend.focusArea].join(" "),
      })),
    ],
    [products, collections, blogs, trends],
  );

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];

    const search = query.toLowerCase();

    return searchItems.filter((item) => {
      const matchesCategory =
        activeTab === "all" || item.category === activeTab;

      const matchesQuery = item.keywords.toLowerCase().includes(search);

      return matchesCategory && matchesQuery;
    });
  }, [query, activeTab, searchItems]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-fit bg-white shadow-xl z-50 animate-fadeIn border-b border-gray-100">
      <div className="max-w-7xl mx-auto md:px-12 px-6 py-4">
        {/* Search Input Bar */}
        <div className="flex items-center justify-between border-b border-gray-200 py-3">
          <div className="flex items-center gap-3 w-full">
            {/* Search Icon */}
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter keyword..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-lg text-black bg-transparent outline-none border-none placeholder-gray-400 font-normal"
            />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1 hover:opacity-60 transition-opacity"
          >
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex items-center gap-6 overflow-x-auto py-4 scrollbar-hide border-b border-gray-50 text-sm md:text-base">
          {(
            ["all", "products", "collections", "blogs", "trends"] as TabType[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize pb-1 border-b-2 font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "border-primaryText text-primaryText"
                  : "border-transparent text-gray-400 hover:text-black"
              }`}
            >
              {tab === "blogs" ? "Blog posts" : tab}
            </button>
          ))}
        </div>

        {/* Live Results Panel */}
        <div className="py-6 min-h-37.5">
          {query.trim() === "" ? (
            <p className="text-gray-400 text-sm">
              Start typing to search Seraphé...
            </p>
          ) : filteredResults.length > 0 ? (
            <div className="space-y-4">
              {filteredResults.map((item) => (
                <Link
                  key={item.id}
                  href={item.slug}
                  onClick={onClose}
                  className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {item.img && (
                    <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-sm bg-gray-100">
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-black">{item.title}</h4>

                    {item.subtitle && (
                      <p className="mt-1 text-xs text-gray-500">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </Link>
              ))}

              {/* View All Button matching reference image */}
              {/* <Link
                href={`/search?q=${encodeURIComponent(query)}${
                  activeTab !== "all" ? `&type=${activeTab}` : ""
                }`}
                onClick={onClose}
                className="w-full mt-4 bg-amber-900 hover:bg-amber-950 text-white font-medium py-3 px-4 flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-sm"
              >
                View all results
                <span className="text-lg">→</span>
              </Link> */}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No results found in &quot;{activeTab}&quot; for &quot;{query}
              &quot;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
