"use client";
import React, { useState, useEffect } from "react";
import { Category, Model } from "../types/api";
import { api } from "../lib/api";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import DeleteModal from "./deleteModal";
import { useAuth } from "../context/authContext";
import ImageUploader from "../helper/imageUploader";

const specialties = [
  "All",
  "Beauty Editorial",
  "Skincare Campaigns",
  "Product Modeling",
  "Commercial",
  "Lifestyle",
  "Beauty & Wellness",
];

export default function AdminModels() {
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [height, setHeight] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [featureImage, setFeatureImage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { isAuthenticated } = useAuth();

  // READ: Fetch Models and category listings together cleanly on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/admin");
      return;
    }

    const initData = async () => {
      try {
        const modelData = await api.adminShop.getModels();

        setModels(modelData);
      } catch (error: unknown) {
        const errMsg =
          error instanceof Error ? error.message : "Data fetch error";
        toast.error(`Failed to load store Models: ${errMsg}`);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [isAuthenticated, router]);

  // Auto-generate helper to build url slugs as you type out the Model name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      );
    }
  };

  // 2. CREATE & UPDATE Handler
  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    const payload = {
      name,
      slug,
      featureImage,
      images,

      bio,
      specialty,
      height,
      hobbies: hobbies
        ? hobbies
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
    };

    try {
      if (editingId) {
        const updated = await api.adminShop.updateModel(editingId, payload);
        setModels((prev) =>
          prev.map((p) => (p._id === editingId ? updated : p)),
        );
        toast.success("Model record updated successfully!");
      } else {
        const created = await api.adminShop.createModel(payload);
        setModels((prev) => [...prev, created]);
        toast.success("New Model cataloged successfully!");
      }
      resetForm();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Save failure";
      toast.error(`Operation failed: ${errMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. DELETE Handler
  const handleDeleteModel = async () => {
    if (!selectedModelId) return;

    try {
      setDeleting(true);
      await api.adminShop.deleteModel(selectedModelId);
      setModels((prev) => prev.filter((p) => p._id !== selectedModelId));
      toast.success("Model deleted successfully.");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Deletion failed";
      toast.error(errMsg);
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setSelectedModelId(null);
    }
  };

  const startEdit = (model: Model) => {
    setEditingId(model._id);
    setName(model.name);
    setSlug(model.slug);
    setSpecialty(model.specialty);
    setHeight(model.height);
    setBio(model.bio);
    const existingImages = Array.isArray(model.images)
      ? model.images
      : model.images
        ? [model.images]
        : [];
    setImages(existingImages);
    setFeatureImage(model.featureImage);
    setHobbies(Array.isArray(model.hobbies) ? model.hobbies.join(", ") : "");
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setBio("");
    setImages([]);
    setFeatureImage("");
    setSpecialty("");
    setHeight("");
    setHobbies("");
    setShowForm(false);
  };

  const getCategoryName = (categoryId: string, categories: Category[]) => {
    const match = categories.find((c) => c._id === categoryId);

    return match?.name ?? "Unassigned";
  };

  return (
    <div className="space-y-6">
      <div className="md:flex block justify-between items-center">
        <div className="pb-2 md:pb-0">
          <h1 className="text-xl md:text-3xl font-bold">Models</h1>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-black text-white px-5 py-2.5 rounded text-xs uppercase font-semibold tracking-wider hover:bg-neutral-800 transition-colors"
        >
          {showForm ? "Cancel" : "Add New Model"}
        </button>
      </div>

      {/* Structural Form Overlay / Display Panel */}
      {showForm && (
        <form
          onSubmit={handleSaveModel}
          className="bg-white border rounded-lg p-6 space-y-4 shadow-sm max-w-2xl"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            {editingId ? "Modify Model Specifics" : "Register Catalog Item"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="Amina bello"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                URL Slug
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="border p-2 rounded text-sm bg-gray-50"
                placeholder="amina-bello"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Specialty
              </label>
              <select
                required
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
              >
                <option value="">-- Choose Category --</option>
                {specialties.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Height
              </label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="(e.g., 5'8\')"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-semibold text-gray-500">
                  Upload Feature Image
                </label>
                <ImageUploader
                  bucket="models"
                  value={featureImage}
                  onChange={(url) => setFeatureImage(url as string)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase font-semibold text-gray-500">
                  Upload Image(s)
                </label>

                <ImageUploader
                  bucket="models"
                  multiple
                  value={images}
                  onChange={(imgs) => setImages(imgs as string[])}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Bio
              </label>
              <textarea
                rows={4}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full border p-2 rounded text-sm bg-white"
                placeholder="Vogue, Chanel, Seraphé Editorial Autumn"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Hobbies (Comma separated)
              </label>
              <input
                type="text"
                value={hobbies}
                onChange={(e) => setHobbies(e.target.value)}
                className="w-full border p-2 rounded text-sm bg-white"
                placeholder="editorial, beauty, runway"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-black text-white px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : editingId
                ? "Update Model"
                : "Create Model"}
          </button>
        </form>
      )}

      {/* Main Catalog Rendering Table */}
      <div className="bg-white border rounded-lg overflow-hidden text-sm shadow-sm w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-black" />
          </div>
        ) : models.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">
            No items yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-175">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-400 uppercase font-bold">
                  <th className="p-4">Model Names</th>
                  <th className="p-4">Specialty</th>
                  <th className="p-4">height</th>

                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {models.map((model) => {
                  // Fallback to support both legacy single string or array formats

                  const displayImage = model.featureImage;

                  return (
                    <tr
                      key={model._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 flex items-center gap-3">
                        {displayImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={displayImage}
                            alt={model.name}
                            width={200}
                            height={200}
                            className="w-10 h-10 object-cover rounded bg-gray-100 border"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-800">
                            {model.name}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        {model.specialty}
                      </td>
                      <td className="p-4 font-medium text-gray-800">
                        {model.height}
                      </td>

                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => startEdit(model)}
                          className="text-xs font-semibold px-2.5 py-1 text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedModelId(model._id);
                            setDeleteModalOpen(true);
                          }}
                          className="text-xs font-semibold px-2.5 py-1 text-red-600 bg-red-50 rounded hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        loading={deleting}
        title="Delete Model"
        message="Are you sure you want to permanently delete this Model? This action cannot be undone."
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedModelId(null);
        }}
        onConfirm={handleDeleteModel}
      />
    </div>
  );
}
