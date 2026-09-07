"use client";
import React, { useState, useEffect } from "react";
import { Category, Product } from "../types/api";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import DeleteModal from "./deleteModal";
import { useAuth } from "../context/authContext";
import ImageUploader from "../helper/imageUploader";

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [stock, setStock] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(
    undefined,
  );
  const [productLink, setProductLink] = useState("");
  const [sku, setSku] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const { isAuthenticated } = useAuth();

  // READ: Fetch products and category listings together cleanly on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/admin");
      return;
    }

    const initData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          api.adminShop.getProducts(),
          api.adminShop.getCategories(),
        ]);

        setProducts(prodData);
        setCategories(catData);
      } catch (error: unknown) {
        const errMsg =
          error instanceof Error ? error.message : "Data fetch error";
        toast.error(`Failed to load store products: ${errMsg}`);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [isAuthenticated, router]);

  // Auto-generate helper to build url slugs as you type out the product name
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
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return toast.error("Please select a target category.");

    setSubmitting(true);
    const payload = {
      name,
      slug,
      price: Number(price),
      category,
      shortDescription,
      description,
      images,
      productLink,
      stock: Number(stock),
      sku: sku || undefined,
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      isFeatured,
      tags: tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      isActive,
    };

    try {
      if (editingId) {
        const updated = await api.adminShop.updateProduct(editingId, payload);
        setProducts((prev) =>
          prev.map((p) => (p._id === editingId ? updated : p)),
        );
        toast.success("Product record updated successfully!");
      } else {
        const created = await api.adminShop.createProduct(payload);
        setProducts((prev) => [...prev, created]);
        toast.success("New product cataloged successfully!");
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
  const handleDeleteProduct = async () => {
    if (!selectedProductId) return;

    try {
      setDeleting(true);
      await api.adminShop.deleteProduct(selectedProductId);
      setProducts((prev) => prev.filter((p) => p._id !== selectedProductId));
      toast.success("Product deleted successfully.");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Deletion failed";
      toast.error(errMsg);
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setSelectedProductId(null);
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product._id);
    setName(product.name);
    setSlug(product.slug);
    setPrice(product.price);
    setProductLink(product.productLink);
    setCategory(product.category.name);
    setShortDescription(product.shortDescription);
    setDescription(product.description);

    // Support both single string formats or array formats if legacy data exists
    const existingImages = Array.isArray(product.images)
      ? product.images
      : product.images
        ? [product.images]
        : [];
    setImages(existingImages);

    setStock(product.stock);
    setDiscountPrice(product.discountPrice);
    setSku(product.sku || "");
    setIsFeatured(!!product.isFeatured);
    setIsActive(!!product.isActive);
    setTags(Array.isArray(product.tags) ? product.tags.join(", ") : "");
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setPrice(0);
    setCategory("");
    setShortDescription("");
    setDescription("");
    setImages([]);
    setStock(0);
    setDiscountPrice(undefined);
    setSku("");
    setIsFeatured(false);
    setIsActive(true);
    setTags("");
    setShowForm(false);
    setProductLink("");
  };

  return (
    <div className="space-y-6">
      <div className="md:flex block justify-between items-center">
        <div className="pb-2 md:pb-0">
          <h1 className="text-xl md:text-3xl font-bold">Products</h1>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-black text-white px-5 py-2.5 rounded text-xs uppercase font-semibold tracking-wider hover:bg-neutral-800 transition-colors"
        >
          {showForm ? "Cancel" : "Add New Product"}
        </button>
      </div>

      {/* Structural Form Overlay / Display Panel */}
      {showForm && (
        <form
          onSubmit={handleSaveProduct}
          className="bg-white border rounded-lg p-6 space-y-4 shadow-sm max-w-2xl"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            {editingId ? "Modify Product Specifics" : "Register Catalog Item"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Product Title
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="e.g., Hydrating Serum"
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
                placeholder="hydrating-serum"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Category Classification
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
              >
                <option value="">-- Choose Category --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                SKU Code
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="SR-HD-01"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Price ($/#)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="border p-2 rounded text-sm bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Discount Break Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={discountPrice || ""}
                onChange={(e) =>
                  setDiscountPrice(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="border p-2 rounded text-sm bg-white"
                placeholder="Optional"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Stock Count
              </label>
              <input
                type="number"
                required
                value={stock || ""}
                onChange={(e) => setProductLink(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Product Link
              </label>
              <input
                type="text"
                required
                value={productLink}
                onChange={(e) => setStock(Number(e.target.value))}
                className="border p-2 rounded text-sm bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Image URL (First)
              </label>

              <ImageUploader
                bucket="products"
                multiple
                value={images}
                onChange={(imgs) => setImages(imgs as string[])}
              />
            </div>
          </div>

          {/* Render image previews if they exist */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {images.map((url, index) => (
                <div key={index} className="relative group w-20 h-20">
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover rounded border w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase font-semibold text-gray-500">
              Short Description
            </label>
            <input
              type="text"
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full border p-2 rounded text-sm bg-white"
              placeholder="A brief one-sentence pitch line..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase font-semibold text-gray-500">
              Full Description
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 rounded text-sm bg-white"
              placeholder="Deep product copy properties..."
            />
          </div>

          {/* ADDED: Missing Tags Form Field */}
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
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300 accent-primaryText"
              />
              Item is visible and active
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
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">
            No items yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-left border-collapse min-w-175">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-400 uppercase font-bold">
                  <th className="p-4">Item Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((prod) => {
                  // Fallback to support both legacy single string or array formats

                  const displayImage =
                    Array.isArray(prod.images) && prod.images.length > 0
                      ? prod.images[0]
                      : "";

                  return (
                    <tr
                      key={prod._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 flex items-center gap-3">
                        {displayImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={displayImage}
                            alt={prod.name}
                            width={200}
                            height={200}
                            className="w-10 h-10 object-cover rounded bg-gray-100 border"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-800 flex items-center gap-1.5">
                            {prod.name}
                            {prod.isFeatured && (
                              <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1 rounded">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {prod.sku || "No SKU"}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        {prod.category.name}
                        {/* {getCategoryName(prod.category.name, categories)} */}
                      </td>
                      <td className="p-4 font-medium text-gray-800">
                        {prod.discountPrice ? (
                          <span>
                            <span className="text-red-600">
                              ${prod.discountPrice}
                            </span>
                            <span className="text-xs text-gray-400 line-through ml-1.5">
                              ${prod.price}
                            </span>
                          </span>
                        ) : (
                          `$${prod.price}`
                        )}
                      </td>
                      <td className="p-4">
                        {prod.stock <= 0 ? (
                          <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded font-medium">
                            Out of stock
                          </span>
                        ) : (
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium">
                            {prod.stock} units
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => startEdit(prod)}
                          className="text-xs font-semibold px-2.5 py-1 text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProductId(prod._id);
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
        title="Delete Product"
        message="Are you sure you want to permanently delete this product? This action cannot be undone."
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedProductId(null);
        }}
        onConfirm={handleDeleteProduct}
      />
    </div>
  );
}
