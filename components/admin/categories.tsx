"use client";
import React, { useEffect, useState } from "react";
import { Category } from "../types/api";
import { api } from "../lib/api";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import DeleteModal from "./deleteModal";
import { useAuth } from "../context/authContext";

export default function AdminCategories() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/admin");
      return;
    }

    const fetchCategories = async () => {
      try {
        const data = await api.adminShop.getCategories();

        setCategories(data);
      } catch (error: unknown) {
        const errMsg =
          error instanceof Error ? error.message : "An error occurred";
        toast.error(`Failed to load categories: ${errMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [isAuthenticated, router]);

  // 2. CREATE & UPDATE Handler
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      if (editId) {
        // Edit Mode: Update Existing Category
        const updatedCategory = await api.adminShop.updateCategory(editId, {
          name,
        });
        setCategories((prev) =>
          prev.map((cat) => (cat._id === editId ? updatedCategory : cat)),
        );
        toast.success("Category updated successfully!");
      } else {
        // Add Mode: Create Brand New Category
        const newCategory = await api.adminShop.createCategory({ name });
        setCategories((prev) => [...prev, newCategory]);
        toast.success("Category created successfully!");
      }
      resetForm();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(`Save operation failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. DELETE Handler
  const handleDeleteCategory = async () => {
    if (!selectedCategoryId) return;

    try {
      setDeleting(true);
      await api.adminShop.deleteCategory(selectedCategoryId);
      setCategories((prev) =>
        prev.filter((cat) => cat._id !== selectedCategoryId),
      );
      toast.success("Category deleted successfully.");

      // If we are currently edit the deleted category, clear the form panels
      if (editId === selectedCategoryId) resetForm();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(`Deletion failed: ${error.message}`);
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setSelectedCategoryId(null);
    }
  };

  // Helper to open edit interface panel
  const startEdit = (category: Category) => {
    setEditId(category._id);
    setName(category.name);
    setShowForm(true);
  };

  const resetForm = () => {
    setName("");
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="md:flex block justify-between items-center">
        <div className="pb-2 md:pb-0">
          <h1 className="text-xl md:text-3xl font-bold">Shop Categories</h1>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-black text-white px-5 py-2.5 rounded text-xs uppercase font-semibold tracking-wider hover:bg-neutral-800 transition-colors"
        >
          {showForm ? "Cancel" : "Add New Category"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSaveCategory}
          className="bg-white border rounded-lg p-6 max-w-md space-y-4"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            {editId ? "Modify Category" : "Create New Category"}
          </h3>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase font-semibold text-gray-500">
              Category Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2.5 rounded text-sm bg-white focus:ring-2 focus:ring-primaryText focus:outline-none"
              placeholder="e.g., Lip Care"
              disabled={submitting}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primaryText text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-primaryBg transition disabled:opacity-50"
          >
            {submitting
              ? "Processing..."
              : editId
                ? "Update Category"
                : "Save Category"}
          </button>
        </form>
      )}

      {/* Categories Data Display Table */}
      <div className="bg-white border rounded-lg overflow-hidden text-sm w-full shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-black" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">
            No categories yet.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-xs text-gray-400 uppercase font-bold">
                <th className="p-4">Name</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((cat) => (
                <tr
                  key={cat._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 font-medium text-gray-800">{cat.name}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-xs font-semibold px-2.5 py-1 text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategoryId(cat._id);
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
        )}
      </div>
      <DeleteModal
        isOpen={deleteModalOpen}
        loading={deleting}
        title="Delete Category"
        message="Are you sure you want to permanently delete this category? This action cannot be undone."
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedCategoryId(null);
        }}
        onConfirm={handleDeleteCategory}
      />
    </div>
  );
}
