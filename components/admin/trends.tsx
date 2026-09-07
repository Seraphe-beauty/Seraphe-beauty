"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trends } from "../types/api";
import { toast } from "sonner";
import { api } from "../lib/api";
import DeleteModal from "./deleteModal";
import { Loader2 } from "lucide-react";
import Tiptap from "../ui/tiptap";
import { useAuth } from "../context/authContext";
import ImageUploader from "../helper/imageUploader";

export default function AdminTrends() {
  const router = useRouter();
  const [trends, setTrends] = useState<Trends[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [focusAreaSlug, setFocusAreaSlug] = useState("");
  const [label, setLabel] = useState("");
  const [summary, setSummary] = useState("");
  const [author, setAuthor] = useState("");
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [featureImage, setFeatureImage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [hashTags, setHashtags] = useState("");
  const [order, setOrder] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedTrendsId, setSelectedTrendsId] = useState<string | null>(null);
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
        const data = await api.adminShop.getTrends();

        setTrends(data);
      } catch (error: unknown) {
        const errMsg =
          error instanceof Error ? error.message : "Data fetch error";
        toast.error(`Failed to load store trends: ${errMsg}`);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [isAuthenticated, router]);

  // 2. CREATE & UPDATE Handler
  const handleSaveTrends = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);

    const payload = {
      title,
      slug,
      focusArea,
      focusAreaSlug,
      label,
      summary,
      featureImage,
      content,
      author,
      readTimeMinutes,
      images,
      hashtags: hashTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      order,
      isFeatured,
    };
    try {
      if (editingId) {
        const updated = await api.adminShop.updateTrends(editingId, payload);
        setTrends((prev) =>
          prev.map((p) => (p._id === editingId ? updated : p)),
        );
        toast.success("Trends record updated successfully!");
      } else {
        const created = await api.adminShop.createTrends(payload);
        setTrends((prev) => [...prev, created]);
        toast.success("New Trends cataloged successfully!");
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
  const handleDeleteTrends = async () => {
    if (!selectedTrendsId) return;

    try {
      setDeleting(true);
      await api.adminShop.deleteTrends(selectedTrendsId);
      setTrends((prev) => prev.filter((p) => p._id !== selectedTrendsId));
      toast.success("Trends deleted successfully.");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Deletion failed";
      toast.error(errMsg);
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setSelectedTrendsId(null);
    }
  };

  const startEdit = (trend: Trends) => {
    setEditingId(trend._id);
    setTitle(trend.title);
    setSlug(trend.slug);
    setFocusArea(trend.focusArea);
    setFocusAreaSlug(trend.focusAreaSlug);
    setSummary(trend.summary);
    setLabel(trend.label);
    setContent(trend.content);
    setAuthor(trend.author);
    setReadTimeMinutes(trend.readTimeMinutes);
    setFeatureImage(trend.featureImage);
    setImages(trend.images);
    setHashtags(trend.hashtags.join(", "));
    setOrder(trend.order);
    setShowForm(true);
    setIsFeatured(!!trend.isFeatured);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setFocusArea("");
    setFocusAreaSlug("");
    setSummary("");
    setLabel("");
    setContent("");
    setAuthor("");
    setReadTimeMinutes(5);
    setImages([]);
    setFeatureImage("");
    setHashtags("");
    setOrder(1);
    setShowForm(false);
    setIsFeatured(false);
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

  const handleFocusAreaChange = (value: string) => {
    setFocusArea(value);
    setFocusAreaSlug(slugify(value));
  };

  return (
    <div className="space-y-6">
      <div className="md:flex block justify-between items-center">
        <div className="pb-2 md:pb-0">
          <h1 className="md:text-3xl text-xl font-bold">Trends Management</h1>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-black text-white px-5 py-2.5 rounded text-xs uppercase font-semibold tracking-wider hover:bg-neutral-800 transition-colors"
        >
          {showForm ? "Cancel" : "Add New Trends"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSaveTrends}
          className="bg-white border rounded-lg p-6 space-y-4 shadow-sm max-w-2xl"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            {editingId ? "Modify Trends" : "Register Trends"}
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
                placeholder="The Rise of Neurocosmetics"
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
                placeholder="the-Rise-of-Neurocosmetics"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Focus Area
              </label>
              <input
                type="text"
                value={focusArea}
                onChange={(e) => handleFocusAreaChange(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="Skincare"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Focus Area Slug
              </label>
              <input
                type="text"
                required
                value={focusAreaSlug}
                onChange={(e) => setFocusAreaSlug(e.target.value)}
                className="border p-2 rounded text-sm bg-gray-50"
                placeholder="skincare"
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
                Label
              </label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="Trending Now"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Summary
              </label>
              <input
                type="text"
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="Explore how topicals formulated for skin-stress responses are changing beauty."
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
                Upload Feature Image
              </label>
              <ImageUploader
                bucket="trends"
                value={featureImage}
                onChange={(url) => setFeatureImage(url as string)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Upload Image(s)
              </label>

              <ImageUploader
                bucket="trends"
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
              HashTags (Comma separated)
            </label>
            <input
              type="text"
              value={hashTags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full border p-2 rounded text-sm bg-white"
              placeholder="neurocosmetics, skincare, skinbarrier"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-black text-white px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : editingId
                ? "Update Trend"
                : "Create Trend"}
          </button>
        </form>
      )}

      {/* Main Catalog Rendering Table */}
      <div className="bg-white border rounded-lg overflow-hidden text-sm shadow-sm w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-black" />
          </div>
        ) : trends.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">
            No Trends published yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-left border-collapse min-w-175">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-400 uppercase font-bold">
                  <th className="p-4">Title</th>
                  <th className="p-4">Focus Areas</th>
                  <th className="p-4">Summary</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {trends.map((art) => {
                  const displayImage = art.featureImage;

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
                          <div className="text-xs text-gray-400 line-clamp-1">
                            {art.title}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        {art.focusArea}
                      </td>
                      <td className="p-4 text-sm text-gray-800">
                        {art.readTimeMinutes} min read
                      </td>
                      <td className="p-4 text-sm text-gray-800">{art.label}</td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => startEdit(art)}
                          className="text-xs font-semibold px-2.5 py-1 text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTrendsId(art._id);
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
        title="Delete Trends"
        message="Are you sure you want to permanently delete this Tips? This action cannot be undone."
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedTrendsId(null);
        }}
        onConfirm={handleDeleteTrends}
      />
    </div>
  );
}
