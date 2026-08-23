"use client";
import React, { useEffect, useState } from "react";
import { Team } from "../types/api";
import { api } from "../lib/api";
import { toast } from "sonner";
import DeleteModal from "./deleteModal";
import { Loader2 } from "lucide-react";
import ImageUploader from "../helper/imageUploader";

const AdminTeam = () => {
  const [members, setMembers] = useState<Team[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [section, setSection] = useState("");
  const [sectionSlug, setSectionSlug] = useState("");
  const [image, setImage] = useState("");
  const [linkedin, setLinkedin] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const [instagram, setInstagram] = useState<string | undefined>();
  const [bio, setBio] = useState<string | undefined>();
  const [order, setOrder] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.adminShop.getTeam();
        setMembers(data);
      } catch {
        toast.error("Failed to load team");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSaveTeams = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    const payload = {
      name,
      role,
      section,
      image,
      linkedin,
      email,
      bio,
      instagram,
      order,
    };
    try {
      if (editingId) {
        const updated = await api.adminShop.updateTeam(editingId, payload);
        setMembers((prev) =>
          prev.map((p) => (p._id === editingId ? updated : p)),
        );
        toast.success("Members record updated successfully!");
      } else {
        const created = await api.adminShop.createTeam(payload);
        setMembers((prev) => [...prev, created]);
        toast.success("New Members cataloged successfully!");
      }
      resetForm();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Save failure";
      toast.error(`Operation failed: ${errMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (member: Team) => {
    setEditingId(member._id);

    setName(member.name);
    setRole(member.role);
    setSection(member.section);
    setSectionSlug(member.sectionSlug);
    setImage(member.image);
    setLinkedin(member?.linkedin);
    setEmail(member?.email);
    setInstagram(member?.instagram);
    setBio(member?.bio);
    setOrder(member.order);

    setShowForm(true);
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    try {
      setDeleting(true);
      await api.adminShop.deleteTeam(selectedMember);
      setMembers((prev) => prev.filter((p) => p._id !== selectedMember));
      toast.success("Member deleted successfully.");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Deletion failed";
      toast.error(errMsg);
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setSelectedMember(null);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setRole("");
    setSection("");
    setSectionSlug("");
    setImage("");
    setLinkedin("");
    setEmail("");
    setInstagram("");
    setBio("");
    setOrder(1);
    setShowForm(false);
  };

  const handleNameChange = (value: string) => {
    setName(value);

    if (!editingId) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      );
    }
  };

  const handleSectionChange = (value: string) => {
    setSection(value);

    if (!editingId) {
      setSectionSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      );
    }
  };
  return (
    <div className="space-y-6">
      <div className="md:flex block justify-between items-center">
        <div className="pb-2 md:pb-0">
          <h1 className="md:text-3xl text-xl font-bold">Teams Management</h1>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-black text-white px-5 py-2.5 rounded text-xs uppercase font-semibold tracking-wider hover:bg-neutral-800 transition-colors"
        >
          {showForm ? "Cancel" : "Add New Member"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSaveTeams}
          className="bg-white border rounded-lg p-6 space-y-4 shadow-sm max-w-2xl"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            {editingId ? "Modify Member" : "Register Member"}
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
                placeholder="John opi"
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
                placeholder="john-obi"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="Role profile link"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Section
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => handleSectionChange(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="Beauty science team"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Section Slug
              </label>
              <input
                type="text"
                required
                value={sectionSlug}
                onChange={(e) => setSectionSlug(e.target.value)}
                className="border p-2 rounded text-sm bg-gray-50"
                placeholder="beauty-science-team"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                LinkedIn
              </label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="Linkedin profile link"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-semibold text-gray-500">
                Instagram
              </label>
              <input
                type="text"
                required
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="border p-2 rounded text-sm bg-white"
                placeholder="Instagram link"
              />
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
                placeholder="Deep product copy properties..."
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase font-semibold text-gray-500">
              Upload Image
            </label>
            <ImageUploader
              bucket="team"
              value={image}
              onChange={(url) => setImage(url as string)}
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
                ? "Update Team"
                : "Create Team"}
          </button>
        </form>
      )}

      {/* Main Catalog Rendering Table */}
      <div className="bg-white border rounded-lg overflow-hidden text-sm shadow-sm w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-black" />
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">
            No Team Member published yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-175">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-400 uppercase font-bold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Section</th>
                  {/* <th className="p-4">Email</th> */}
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {members.map((member) => {
                  const displayImage = member.image;

                  return (
                    <tr
                      key={member._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 flex items-center gap-3">
                        {displayImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={displayImage}
                            alt={member.name}
                            width={200}
                            height={200}
                            className="w-10 h-10 object-cover rounded bg-gray-100 border"
                          />
                        )}
                        <div>
                          <div className="text-xs text-gray-400 line-clamp-1">
                            {member.name}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        {member.role}
                      </td>
                      <td className="p-4 text-sm text-gray-800">
                        {member.section}
                      </td>
                      {/* <td className="p-4 text-sm text-gray-800">
                        {member.email}
                      </td> */}
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => startEdit(member)}
                          className="text-xs font-semibold px-2.5 py-1 text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMember(member._id);
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
        title="Delete Member"
        message="Are you sure you want to permanently delete this Tips? This action cannot be undone."
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedMember(null);
        }}
        onConfirm={handleDeleteMember}
      />
    </div>
  );
};

export default AdminTeam;
