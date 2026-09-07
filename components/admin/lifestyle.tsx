"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Lifestyle } from "../types/api";
import { toast } from "sonner";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";
import DeleteModal from "./deleteModal";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import Tiptap from "../ui/tiptap";
import { useAuth } from "../context/authContext";

const categories = [
  "All",
  "Wellness",
  "Beauty Remedies",
  "Diet plans",
  "Exercise",
  "Fashion Ideas",
];

export default function AdminLifestyle() {
  const router = useRouter();
  const [articles, setArticles] = useState<Lifestyle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [image, setImage] = useState("");
  const [tags, setTags] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [order, setOrder] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedLifestyleId, setSelectedLifestyleId] = useState<string | null>(
    null,
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/admin");
      return;
    }

    const initData = async () => {
      try {
        const lifestyleData = await api.adminShop.getLifestyle();

        setArticles(lifestyleData);
      } catch (error: unknown) {
        const errMsg =
          error instanceof Error ? error.message : "Data fetch error";
        toast.error(`Failed to load store lifestyle: ${errMsg}`);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [isAuthenticated, router]);

  // 2. CREATE & UPDATE Handler
  const handleSaveLifestyle = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);

    const payload = {
      title,
      slug,
      category,
      categorySlug,
      excerpt,
      content,
      author,
      readTimeMinutes,
      image,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isFeatured,
      order,
    };
    try {
      if (editingId) {
        const updated = await api.adminShop.updateLifestyle(editingId, payload);
        setArticles((prev) =>
          prev.map((p) => (p._id === editingId ? updated : p)),
        );
        toast.success("Lifestyle record updated successfully!");
      } else {
        const created = await api.adminShop.createLifestyle(payload);
        setArticles((prev) => [...prev, created]);
        toast.success("New lifestyle cataloged successfully!");
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
  const handleDeleteLifestyle = async () => {
    if (!selectedLifestyleId) return;

    try {
      setDeleting(true);
      await api.adminShop.deleteLifestyle(selectedLifestyleId);
      setArticles((prev) => prev.filter((p) => p._id !== selectedLifestyleId));
      toast.success("Lifestyle deleted successfully.");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Deletion failed";
      toast.error(errMsg);
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setSelectedLifestyleId(null);
    }
  };

  const startEdit = (article: Lifestyle) => {
    setEditingId(article._id);
    setTitle(article.title);
    setSlug(article.slug);
    setCategory(article.category);
    setCategorySlug(article.categorySlug);
    setExcerpt(article.excerpt);
    setContent(article.content);
    setAuthor(article.author);
    setReadTimeMinutes(article.readTimeMinutes);
    setImage(article.image);
    setTags(article.tags.join(", "));
    setIsFeatured(article.isFeatured);
    setOrder(article.order);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setCategory("");
    setCategorySlug("");
    setExcerpt("");
    setContent("");
    setAuthor("");
    setReadTimeMinutes(5);
    setImage("");
    setTags("");
    setIsFeatured(false);
    setOrder(1);
    setShowForm(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.warning("Maximum image size is 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.warning("Please upload an image file.");
      return;
    }

    setUploading(true);

    try {
      const fileName = `${Date.now()}-${Math.random()}-${file.name}`;

      const { error } = await supabase.storage
        .from("lifestyle")
        .upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from("lifestyle")
        .getPublicUrl(fileName);

      setImage(data.publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setSlug(slugify(value));
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCategorySlug(slugify(value));
  };

  return (
    <div className="space-y-6">
      <div className="md:flex block justify-between items-center">
        <div className="pb-2 md:pb-0">
          <h1 className="text-xl md:text-3xl font-bold">Lifestyle Articles</h1>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-black text-white px-5 py-2.5 rounded text-xs uppercase font-semibold tracking-wider hover:bg-neutral-800 transition-colors"
        >
          {showForm ? "Cancel" : "Add New Lifestyle"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSaveLifestyle}
          className="bg-white border rounded-lg p-6 space-y-4 shadow-sm max-w-2xl"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            {editingId ? "Modify Lifestyle" : "Register Lifestyle"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Lifestyle Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="e.g., Hydrating Serum"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Title Slug
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="border p-2 rounded text-sm bg-gray-50"
                placeholder="hydrating-serum"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Category
              </label>
              <select
                required
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
              >
                <option value=""> Choose Category </option>

                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Category Slug
              </label>
              <input
                type="text"
                required
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="border p-2 rounded text-sm bg-gray-50"
                placeholder="acne"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Excerpt
              </label>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="excerpt"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Author
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Read Time Minutes
              </label>
              <input
                type="text"
                required
                value={readTimeMinutes}
                onChange={(e) => setReadTimeMinutes(Number(e.target.value))}
                className="border p-2 rounded text-sm bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Image URL (First)
              </label>
              <input
                type="text"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="https://cdn.com/product.jpg"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="border rounded-md p-1"
              />
            </div>
          </div>

          {image && (
            <Image
              src={image}
              alt="Preview"
              width={120}
              height={120}
              className="rounded border object-cover"
            />
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase font-semibold text-gray-500">
              Content
            </label>
            <Tiptap
              value={content}
              onChange={setContent}
              className="prose prose-neutral max-w-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase font-semibold text-gray-500">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border p-2 rounded text-sm bg-white"
              placeholder="makeup, glowing, organic"
            />
          </div>

          <div className="flex gap-6 items-center pt-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-gray-300 accent-primaryText"
              />
              Feature item on homepage
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || uploading}
            className="bg-black text-white px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : uploading
                ? "Uploading image..."
                : editingId
                  ? "Update Product"
                  : "Create Product"}
          </button>
        </form>
      )}

      {/* Main Catalog Rendering Table */}
      <div className="bg-white border rounded-lg overflow-hidden text-sm shadow-sm w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-black" />
          </div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">
            No articles published yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-left border-collapse min-w-175">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-400 uppercase font-bold">
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Author</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {articles.map((art) => {
                  const displayImage = art.image;

                  return (
                    <tr
                      key={art._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 flex items-center gap-3">
                        {displayImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={displayImage}
                            alt={art.title}
                            width={200}
                            height={200}
                            className="w-10 h-10 object-cover rounded bg-gray-100 border"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-800 flex items-center gap-1.5">
                            {art.title}
                            {art.isFeatured && (
                              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 line-clamp-1">
                            {art.excerpt}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        <span className="inline-flex rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
                          {art.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-800">
                        {art.author}
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => startEdit(art)}
                          className="text-xs font-semibold px-2.5 py-1 text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLifestyleId(art._id);
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
        title="Delete Lifestyle"
        message="Are you sure you want to permanently delete this lifestyle? This action cannot be undone."
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedLifestyleId(null);
        }}
        onConfirm={handleDeleteLifestyle}
      />
    </div>
  );
}
