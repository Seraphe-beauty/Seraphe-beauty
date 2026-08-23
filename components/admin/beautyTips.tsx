"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tips } from "../types/api";
import { toast } from "sonner";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";
import DeleteModal from "./deleteModal";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import Tiptap from "../ui/tiptap";
import { useAuth } from "../context/authContext";
import ImageUploader from "../helper/imageUploader";

export default function AdminBeautyTips() {
  const router = useRouter();
  const [articles, setArticles] = useState<Tips[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [summary, setSummary] = useState("");
  const [level, setLevel] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [order, setOrder] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedTipsId, setSelectedTipsId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isAuthenticated = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/admin");
      return;
    }

    const initData = async () => {
      try {
        const data = await api.adminShop.getTips();

        setArticles(data);
      } catch (error: unknown) {
        const errMsg =
          error instanceof Error ? error.message : "Data fetch error";
        toast.error(`Failed to load store beauty Tips: ${errMsg}`);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [isAuthenticated, router]);

  // 2. CREATE & UPDATE Handler
  const handleSaveTips = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);

    const payload = {
      title,
      slug,
      category,
      categorySlug,
      summary,
      level,
      content,
      author,
      readTimeMinutes,
      images,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      order,
    };
    try {
      if (editingId) {
        const updated = await api.adminShop.updateTips(editingId, payload);
        setArticles((prev) =>
          prev.map((p) => (p._id === editingId ? updated : p)),
        );
        toast.success("Beauty tips record updated successfully!");
      } else {
        const created = await api.adminShop.createTips(payload);
        setArticles((prev) => [...prev, created]);
        toast.success("New Beauty tips cataloged successfully!");
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
  const handleDeleteTips = async () => {
    if (!selectedTipsId) return;

    try {
      setDeleting(true);
      await api.adminShop.deleteTips(selectedTipsId);
      setArticles((prev) => prev.filter((p) => p._id !== selectedTipsId));
      toast.success("Tips deleted successfully.");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Deletion failed";
      toast.error(errMsg);
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setSelectedTipsId(null);
    }
  };

  const startEdit = (article: Tips) => {
    setEditingId(article._id);
    setTitle(article.title);
    setSlug(article.slug);
    setCategory(article.category);
    setCategorySlug(article.categorySlug);
    setSummary(article.summary);
    setLevel(article.level);
    setContent(article.content);
    setAuthor(article.author);
    setReadTimeMinutes(article.readTimeMinutes);
    setImages(article.images);
    setTags(article.tags.join(", "));
    setOrder(article.order);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setCategory("");
    setCategorySlug("");
    setSummary("");
    setLevel("");
    setContent("");
    setAuthor("");
    setReadTimeMinutes(5);
    setImages([]);
    setTags("");
    setOrder(1);
    setShowForm(false);
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
          <h1 className="text-xl md:text-3xl font-bold">
            Beauty Tips Articles
          </h1>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-black text-white px-5 py-2.5 rounded text-xs uppercase font-semibold tracking-wider hover:bg-neutral-800 transition-colors"
        >
          {showForm ? "Cancel" : "Add New Beauty Tips"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSaveTips}
          className="bg-white border rounded-lg p-6 space-y-4 shadow-sm max-w-2xl"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            {editingId ? "Modify Beauty Tips" : "Register Beauty Tips"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="Managing Hormonal Acne Breakouts"
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
                placeholder="Managing-Hormonal-Acne-Breakouts"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="Acne"
              />
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
                Summary
              </label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="A targeted guide on using salicylic acid and niacinamide effectively."
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
                Level
              </label>
              <input
                type="text"
                required
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="Beginner"
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
                Upload Image(s)
              </label>
              <ImageUploader
                bucket="tips"
                multiple
                value={images}
                onChange={(imgs) => setImages(imgs as string[])}
              />
            </div>
          </div>

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
            <table className="w-full text-left border-collapse min-w-175">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-400 uppercase font-bold">
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Except</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {articles.map((art) => {
                  const displayImage = art.images?.[0];

                  return (
                    <tr
                      key={art._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 flex items-center gap-3">
                        {displayImage && (
                          <Image
                            src={displayImage}
                            alt={art.title}
                            width={200}
                            height={200}
                            className="w-10 h-10 object-cover rounded bg-gray-100 border"
                          />
                        )}
                        <div>
                          <div className="text-xs text-gray-400 line-clamp-1">
                            {art.title}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-primaryText">
                          {art.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-800">
                        {art.readTimeMinutes} min read
                      </td>
                      <td className="p-4 text-sm text-gray-800">{art.level}</td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => startEdit(art)}
                          className="text-xs font-semibold px-2.5 py-1 text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTipsId(art._id);
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
        title="Delete Beauty Tips"
        message="Are you sure you want to permanently delete this Tips? This action cannot be undone."
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedTipsId(null);
        }}
        onConfirm={handleDeleteTips}
      />
    </div>
  );
}
