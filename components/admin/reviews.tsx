"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Product, Review } from "../types/api";
import { toast } from "sonner";
import { Loader2, Star } from "lucide-react";
import { useAuth } from "../context/authContext";

export default function AdminReviews() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/admin");
      return;
    }

    const fetchData = async () => {
      try {
        const [reviewsData, productsData] = await Promise.all([
          api.adminShop.getProductReviews(),
          api.adminShop.getProducts(),
        ]);

        setReviews(reviewsData);
        setProducts(productsData);
      } catch (error: unknown) {
        const errMsg =
          error instanceof Error ? error.message : "An error occurred";
        toast.error(`Failed to load Reviews: ${errMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, router]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-3xl pb-2 font-bold">Reviews</h1>
      </div>

      <div className="bg-white  w-full border rounded-lg overflow-hidden text-sm shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-black" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">
            No reviews yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className=" w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-400 uppercase font-bold">
                  <th className="p-4">Name</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reviews.map((review) => (
                  <tr
                    key={review._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-medium text-gray-800">
                      {review.product.name}
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      {review.name}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-4 w-4 ${
                              index < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      {review.email}
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      {review.comment}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
