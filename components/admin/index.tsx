"use client";

import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import Card from "../ui/card";
import { useAuth } from "../context/authContext";
import { formatDate } from "../helper/formatDate";
import {
  Package,
  MessageSquare,
  Sparkles,
  BookOpen,
  TrendingUp,
  FileText,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSite } from "../helper/siteContext";

type DashboardPost = {
  _id: string;
  title: string;
  category: string;
  author: string;
  createdAt: string;
  source: "Lifestyle" | "Beauty Tips" | "Trends";
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function AdminDashboard() {
  const { admin } = useAuth();
  const { tips, trends, products, lifestyle } = useSite();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    blogs: 0,
    products: 0,
    reviews: 0,
    lifestyle: 0,
  });

  const [chartData, setChartData] = useState<
    { month: string; count: number }[]
  >([]);

  const [latestPosts, setLatestPosts] = useState<DashboardPost[]>([]);

  useEffect(() => {
    let isMounted = true;

    if (!admin) {
      toast.error("Please log in to access the admin dashboard.");
      router.replace("/signin");
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const reviews = await api.adminShop.getProductReviews();

        if (!isMounted) return;

        setStats({
          blogs: tips.length,
          products: products.length,
          reviews: reviews.length,
          lifestyle: lifestyle.length,
        });

        const posts: DashboardPost[] = [
          ...lifestyle.map((item) => ({
            _id: item._id,
            title: item.title,
            category: item.category,
            author: item.author,
            createdAt: item.createdAt,
            source: "Lifestyle" as const,
          })),
          ...tips.map((item) => ({
            _id: item._id,
            title: item.title,
            category: item.category,
            author: item.author,
            createdAt: item.createdAt,
            source: "Beauty Tips" as const,
          })),
          ...trends.map((item) => ({
            _id: item._id,
            title: item.title,
            category: item.focusArea,
            author: item.author,
            createdAt: item.createdAt,
            source: "Trends" as const,
          })),
        ];

        // Sort posts descending by date and take the 5 latest
        const sortedLatest = posts
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 5);

        setLatestPosts(sortedLatest);

        // Calculate monthly upload volume for both Lifestyle and Tips
        const uploads = new Array(12).fill(0);
        [...lifestyle, ...tips, ...trends].forEach((article) => {
          if (article.createdAt) {
            const month = new Date(article.createdAt).getMonth();
            if (month >= 0 && month < 12) {
              uploads[month]++;
            }
          }
        });

        setChartData(
          MONTHS.map((month, index) => ({
            month,
            count: uploads[index],
          })),
        );
      } catch (err) {
        if (!isMounted) return;
        toast.error("Session expired or unauthorized. Please log in again.");
        router.replace("/signin");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [admin, router]);

  const maxCount = Math.max(...chartData.map((c) => c.count), 1);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <p className="text-sm font-medium">Checking authentication...</p>
      </div>
    );
  }

  // If redirecting, render nothing
  if (!admin) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto md:px-2 px-1 py-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-6 border-gray-100">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back,{" "}
            <span className="font-semibold uppercase text-gray-800">
              {admin?.name || "Admin"}
            </span>
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card
          title="Products"
          value={stats.products}
          icon={<Package className="w-5 h-5 text-amber-600" />}
        />
        {/* <Card
          title="Categories"
          value={stats.categories}
          icon={<Layers className="w-5 h-5 text-indigo-600" />}
        /> */}
        <Card
          title="Reviews"
          value={stats.reviews}
          icon={<MessageSquare className="w-5 h-5 text-emerald-600" />}
        />
        <Card
          title="Beauty Tips"
          value={stats.blogs}
          icon={<Sparkles className="w-5 h-5 text-pink-600" />}
        />
        <Card
          title="Lifestyle"
          value={stats.lifestyle}
          icon={<BookOpen className="w-5 h-5 text-blue-600" />}
        />
      </div>

      {/* Monthly Chart Card */}
      <div className="hidden md:block bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4 border-gray-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
              Blog Upload Volume (Per Month)
            </h3>
          </div>
          <span className="text-xs text-gray-400">
            Total uploads across all channels
          </span>
        </div>

        <div className="relative h-56 pt-8 pb-2 flex items-end gap-2 sm:gap-4 border-b border-gray-100">
          {chartData.map((data) => {
            const heightPercent = (data.count / maxCount) * 100;
            return (
              <div
                key={data.month}
                className="flex-1 flex flex-col items-center group h-full justify-end relative"
              >
                {/* Bar */}
                <div
                  style={{ height: `${heightPercent || 4}%` }}
                  className={`w-full max-w-10 transition-all duration-300 rounded-t-md relative ${
                    data.count > 0
                      ? "bg-slate-800 group-hover:bg-amber-500"
                      : "bg-gray-100"
                  }`}
                >
                  {/* Tooltip */}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-10">
                    {data.count} {data.count === 1 ? "post" : "posts"}
                  </span>
                </div>

                {/* X-Axis Label */}
                <span className="text-xs font-medium text-gray-500 mt-3">
                  {data.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Posts Table Card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
              Latest Published Stories
            </h3>
          </div>
          <span className="text-xs text-gray-400">
            Showing top 5 recent entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-6">Title</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Author</th>
                <th className="py-3.5 px-6">Source</th>
                <th className="py-3.5 px-6 text-right">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {latestPosts.length > 0 ? (
                latestPosts.map((post) => (
                  <tr
                    key={post._id}
                    className="hover:bg-amber-50/30 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-gray-900 max-w-xs truncate">
                      {post.title}
                    </td>
                    <td className="py-4 px-6 text-gray-600">{post.category}</td>
                    <td className="py-4 px-6 text-gray-600">{post.author}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.source === "Lifestyle"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-pink-50 text-pink-700 border border-pink-200"
                        }`}
                      >
                        {post.source}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(post.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-gray-400 text-sm"
                  >
                    No published stories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
