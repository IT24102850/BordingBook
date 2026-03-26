import React, { useEffect, useMemo, useState } from "react";
import {
  FaUser,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPen,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import StudentPayment from "./payment/StudentPayment";

const API_BASE_URL = (((import.meta as any).env?.VITE_API_URL as string) || "").replace(/\/$/, "");

type Section = "Profile" | "Payments";

type ProfileForm = {
  fullName: string;
  email: string;
  profilePicture: string;
  mobileNumber: string;
  bio: string;
  selectedLocation: string;
  gender: string;
  academicYear: string;
  roommatePreference: string;
  roomType: string;
  profileImages: string[];
};

const initialProfile: ProfileForm = {
  fullName: "",
  email: "",
  profilePicture: "https://randomuser.me/api/portraits/lego/1.jpg",
  mobileNumber: "",
  bio: "",
  selectedLocation: "",
  gender: "",
  academicYear: "",
  roommatePreference: "",
  roomType: "",
  profileImages: [],
};

export default function UserProfileDashboard() {
  const [activeSection, setActiveSection] = useState<Section>("Profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState<ProfileForm>(initialProfile);

  const firstName = useMemo(() => {
    const trimmed = profile.fullName.trim();
    if (!trimmed) return "Student";
    return trimmed.split(" ")[0];
  }, [profile.fullName]);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("bb_access_token");
        if (!token) {
          setError("Please sign in to access profile settings.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await response.json();
        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(result?.message || "Failed to load profile");
        }

        const user = result.data;
        if (cancelled) return;

        setProfile({
          fullName: user.fullName || "",
          email: user.email || "",
          profilePicture: user.profilePicture || initialProfile.profilePicture,
          mobileNumber: user.mobileNumber || "",
          bio: user.bio || "",
          selectedLocation: user.selectedLocation || "",
          gender: user.gender || "",
          academicYear: user.academicYear || "",
          roommatePreference: user.roommatePreference || "",
          roomType: user.roomType || "",
          profileImages: Array.isArray(user.profileImages) ? user.profileImages : [],
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load profile");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("bb_access_token");
      if (!token) {
        throw new Error("Session expired. Please sign in again.");
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: profile.fullName,
          mobileNumber: profile.mobileNumber,
          profilePicture: profile.profilePicture,
          profileImages: profile.profileImages,
          bio: profile.bio,
          selectedLocation: profile.selectedLocation,
          gender: profile.gender,
          academicYear: profile.academicYear,
          roommatePreference: profile.roommatePreference,
          roomType: profile.roomType,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Failed to save profile");
      }

      const currentRaw = localStorage.getItem("bb_current_user");
      if (currentRaw) {
        try {
          const cached = JSON.parse(currentRaw);
          localStorage.setItem(
            "bb_current_user",
            JSON.stringify({
              ...cached,
              email: profile.email,
              fullName: profile.fullName,
              profilePicture: profile.profilePicture,
              profileCompleted: Boolean(result?.data?.profileCompleted),
            })
          );
        } catch {
          // Ignore cache update failures.
        }
      }

      setSuccess("Profile saved successfully.");
      setEditing(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071126] via-[#0d1f3a] to-[#13314f] text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="rounded-3xl border border-cyan-400/20 bg-[#0f223f]/70 backdrop-blur-xl shadow-2xl shadow-cyan-900/20 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-cyan-300/15 bg-gradient-to-r from-[#12385d] via-[#135076] to-[#14709a]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, {firstName}</h1>
                <p className="text-cyan-100/90 text-sm md:text-base">Profile settings synced with your database account</p>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={profile.profilePicture || initialProfile.profilePicture}
                  alt="Profile"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-200/50"
                />
                <div className="text-sm">
                  <div className="font-semibold">{profile.fullName || "Student"}</div>
                  <div className="text-cyan-100/80 flex items-center gap-2"><FaEnvelope /> {profile.email || "No email"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 flex flex-wrap gap-3 border-b border-cyan-300/10 bg-[#0c1c36]">
            <button
              onClick={() => setActiveSection("Profile")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeSection === "Profile" ? "bg-cyan-500/30 border border-cyan-300/50" : "bg-white/5 border border-white/10"
              }`}
            >
              <FaUser className="inline mr-2" /> Profile
            </button>
            <button
              onClick={() => setActiveSection("Payments")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeSection === "Payments" ? "bg-cyan-500/30 border border-cyan-300/50" : "bg-white/5 border border-white/10"
              }`}
            >
              Payments
            </button>
          </div>

          <div className="p-6 md:p-8">
            {activeSection === "Payments" ? (
              <StudentPayment />
            ) : loading ? (
              <div className="flex items-center justify-center py-20 text-cyan-200">
                <FaSpinner className="animate-spin mr-3" /> Loading profile...
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold">Student Profile</h2>
                  <div className="flex gap-2">
                    {editing ? (
                      <>
                        <button
                          onClick={() => setEditing(false)}
                          className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition"
                        >
                          <FaTimes className="inline mr-2" /> Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold disabled:opacity-60"
                        >
                          {saving ? <><FaSpinner className="inline mr-2 animate-spin" /> Saving</> : <><FaSave className="inline mr-2" /> Save</>}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditing(true)}
                        className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-300/40 hover:bg-cyan-500/30 transition"
                      >
                        <FaPen className="inline mr-2" /> Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                {error && <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-400/40 text-red-100">{error}</div>}
                {success && <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-100"><FaCheckCircle className="inline mr-2" />{success}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-cyan-100 mb-1">Full Name</label>
                    <input
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl bg-[#132a4b] border border-cyan-500/20 px-3 py-2 text-cyan-50 disabled:opacity-70"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-cyan-100 mb-1">Mobile Number</label>
                    <input
                      name="mobileNumber"
                      value={profile.mobileNumber}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="e.g. +94771234567"
                      className="w-full rounded-xl bg-[#132a4b] border border-cyan-500/20 px-3 py-2 text-cyan-50 disabled:opacity-70"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-cyan-100 mb-1">Email</label>
                    <input
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      disabled
                      className="w-full rounded-xl bg-[#132a4b] border border-cyan-500/20 px-3 py-2 text-cyan-50 disabled:opacity-70"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-cyan-100 mb-1">Profile Picture</label>
                    {editing ? (
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const imageUrl = ev.target?.result as string;
                                setProfile((prev) => ({ ...prev, profilePicture: imageUrl }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-cyan-100 text-sm"
                        />
                        <img
                          src={profile.profilePicture}
                          alt="Preview"
                          className="w-20 h-20 rounded-lg object-cover border border-cyan-500/30"
                        />
                      </div>
                    ) : (
                      <img
                        src={profile.profilePicture}
                        alt="Profile"
                        className="w-20 h-20 rounded-lg object-cover border border-cyan-500/30"
                      />
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-cyan-100 mb-1">Swipe Gallery Images (Multiple Images)</label>
                    {editing ? (
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files) {
                              const newImages = [...profile.profileImages];
                              for (let i = 0; i < files.length; i++) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const imageUrl = ev.target?.result as string;
                                  newImages.push(imageUrl);
                                  if (newImages.length > 0) {
                                    setProfile((prev) => ({ ...prev, profileImages: newImages }));
                                  }
                                };
                                reader.readAsDataURL(files[i]);
                              }
                            }
                          }}
                          className="w-full text-cyan-100 text-sm mb-2"
                        />
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                          {profile.profileImages.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img src={img} alt={`Gallery ${idx}`} className="w-full h-24 object-cover rounded-lg border border-cyan-500/30" />
                              <button
                                type="button"
                                onClick={() => setProfile((prev) => ({ ...prev, profileImages: prev.profileImages.filter((_, i) => i !== idx) }))}
                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg transition"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-cyan-200">{profile.profileImages.length} image(s) added</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {profile.profileImages.length > 0 ? (
                          profile.profileImages.map((img, idx) => (
                            <img key={idx} src={img} alt={`Gallery ${idx}`} className="w-full h-24 object-cover rounded-lg border border-cyan-500/30" />
                          ))
                        ) : (
                          <p className="text-xs text-cyan-300">No gallery images added</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-cyan-100 mb-1">Bio</label>
                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      disabled={!editing}
                      rows={3}
                      placeholder="Tell about yourself..."
                      className="w-full rounded-xl bg-[#132a4b] border border-cyan-500/20 px-3 py-2 text-cyan-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-cyan-100 mb-1">Location</label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-3 text-cyan-300" />
                      <input
                        name="selectedLocation"
                        value={profile.selectedLocation}
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="Your location"
                        className="w-full rounded-xl bg-[#132a4b] border border-cyan-500/20 pl-9 pr-3 py-2 text-cyan-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-cyan-100 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={profile.gender}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full rounded-xl bg-[#132a4b] border border-cyan-500/20 px-3 py-2 text-cyan-50"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-cyan-100 mb-1">Academic Year</label>
                    <select
                      name="academicYear"
                      value={profile.academicYear}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full rounded-xl bg-[#132a4b] border border-cyan-500/20 px-3 py-2 text-cyan-50"
                    >
                      <option value="">Select</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-cyan-100 mb-1">Roommate Preference</label>
                    <input
                      name="roommatePreference"
                      value={profile.roommatePreference}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="e.g. Clean, Quiet, Social"
                      className="w-full rounded-xl bg-[#132a4b] border border-cyan-500/20 px-3 py-2 text-cyan-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-cyan-100 mb-1">Room Type</label>
                    <select
                      name="roomType"
                      value={profile.roomType}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full rounded-xl bg-[#132a4b] border border-cyan-500/20 px-3 py-2 text-cyan-50"
                    >
                      <option value="">Select</option>
                      <option value="Single Room">Single Room</option>
                      <option value="Shared Room">Shared Room</option>
                      <option value="Studio/Annex">Studio/Annex</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
