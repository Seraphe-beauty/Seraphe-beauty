"use client";
import React, { useEffect, useState } from "react";
import { Subscribers } from "../types/api";
import { api } from "../lib/api";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import DeleteModal from "./deleteModal";
import { useAuth } from "../context/authContext";

export default function AdminSubscribers() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscribers[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSubscriberId, setSelectedSubscriberId] = useState<
    string | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/admin");
      return;
    }

    const fetchSubscribers = async () => {
      try {
        const data = await api.adminShop.getSubscribers();

        setSubscribers(data);
      } catch (error: unknown) {
        const errMsg =
          error instanceof Error ? error.message : "An error occurred";
        toast.error(`Failed to load Subscribers: ${errMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, [isAuthenticated, router]);

  const handleDeleteSubscribers = async () => {
    if (!selectedSubscriberId) return;

    try {
      setDeleting(true);
      await api.adminShop.deleteSubscribers(selectedSubscriberId);
      setSubscribers((prev) =>
        prev.filter((cat) => cat._id !== selectedSubscriberId),
      );
      toast.success("Subscribers deleted successfully.");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(`Deletion failed: ${error.message}`);
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setSelectedSubscriberId(null);
    }
  };

  const handleExportSubscribers = () => {
    if (subscribers.length === 0) {
      toast.error("There are no subscribers to export.");
      return;
    }

    // CSV headers
    const headers = ["Name", "Email"];

    // Convert subscriber records into CSV rows
    const rows = subscribers.map((subscriber) => [
      subscriber.name,
      subscriber.email,
    ]);

    // Escape CSV values safely
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\r\n");

    // Create downloadable CSV file
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `seraphe-subscribers-${
      new Date().toISOString().split("T")[0]
    }.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    toast.success("Subscribers exported successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold pb-2">Subscribers</h1>
          <p className="text-sm text-gray-500">
            Total subscribers: {subscribers.length}
          </p>
        </div>

        <button
          onClick={handleExportSubscribers}
          disabled={loading || subscribers.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>↓</span>
          Export Subscribers
        </button>
      </div>

      {/* subscribers Data Display Table */}
      <div className="bg-white border rounded-lg overflow-hidden text-sm max-w-full shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-black" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">
            No subscribers yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-400 uppercase font-bold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subscribers.map((cat) => (
                  <tr
                    key={cat._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-medium text-gray-800">
                      {cat.name}
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      {cat.email}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSubscriberId(cat._id);
                          setDeleteModalOpen(true);
                        }}
                        className="text-xs font-semibold px-2.5 py-1 text-red-600 bg-red-50 rounded hover:bg-red-100 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <DeleteModal
        isOpen={deleteModalOpen}
        loading={deleting}
        title="Delete Subscriber"
        message="Are you sure you want to permanently delete this Subscriber? This action cannot be undone."
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedSubscriberId(null);
        }}
        onConfirm={handleDeleteSubscribers}
      />
    </div>
  );
}
