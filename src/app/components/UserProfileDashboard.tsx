import React, { useState } from "react";
import {
  FaUser,
  FaHome,
  FaCalendarCheck,
  FaCreditCard,
  FaEnvelope,
  FaCog,
  FaBars,
} from "react-icons/fa";

const sidebarLinks = [
  { icon: <FaHome />, label: "Dashboard" },
  { icon: <FaUser />, label: "Profile" },
  { icon: <FaCalendarCheck />, label: "Bookings" },
  { icon: <FaCreditCard />, label: "Payments" },
  { icon: <FaEnvelope />, label: "Messages" },
  { icon: <FaCog />, label: "Settings" },
];

export default function UserProfileDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "Alexa Rawles",
    nickName: "Alexa",
    gender: "Female",
    country: "Sri Lanka",
    language: "English",
    timeZone: "GMT+5:30",
    email: "alexarawles@gmail.com",
  });
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] flex flex-col">
      {/* Header */}
      <header className="w-full px-4 md:px-10 py-4 flex items-center justify-between bg-gradient-to-r from-cyan-100 via-purple-50 to-indigo-100 shadow-sm rounded-b-3xl">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-cyan-50"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Open sidebar"
          >
            <FaBars className="text-cyan-500 text-xl" />
          </button>
          <div>
            <div className="text-lg md:text-2xl font-bold text-cyan-800">Welcome back, {profile.fullName.split(" ")[0]}</div>
            <div className="text-xs text-cyan-400 mt-1">{new Date().toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search"
            className="hidden md:block px-3 py-2 rounded-xl bg-white border border-cyan-100 focus:ring-2 focus:ring-cyan-300 text-cyan-900 text-sm shadow-sm transition w-56"
          />
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="User avatar"
            className="w-10 h-10 rounded-full border-2 border-cyan-200 shadow-md object-cover"
          />
        </div>
      </header>
      {/* Layout */}
      <div className="flex flex-1 w-full max-w-7xl mx-auto mt-6 md:mt-10 gap-6 px-2 md:px-6">
        {/* Sidebar */}
        <aside
          className={`fixed md:static z-30 top-0 left-0 h-full md:h-auto w-64 md:w-20 bg-white/90 shadow-xl rounded-r-3xl md:rounded-3xl flex flex-col items-center py-8 gap-6 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          <nav className="flex flex-col gap-6 w-full items-center">
            {sidebarLinks.map((link, i) => (
              <button
                key={link.label}
                className="flex flex-col items-center gap-1 text-cyan-500 hover:text-indigo-500 focus:text-indigo-600 text-xl md:text-2xl p-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-cyan-300"
                aria-label={link.label}
              >
                {link.icon}
                <span className="text-xs font-medium hidden md:block text-cyan-700 mt-1">{link.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8 md:p-12 mt-2 md:mt-0">
            {/* Profile Summary */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="User avatar"
                className="w-24 h-24 rounded-full border-4 border-cyan-200 shadow-lg object-cover"
              />
              <div className="flex-1 text-center md:text-left">
                <div className="text-2xl font-bold text-cyan-800">{profile.fullName}</div>
                <div className="text-sm text-cyan-500">{profile.email}</div>
              </div>
              <button
                className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 text-white shadow-md hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
                onClick={() => setEditing((v) => !v)}
              >
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>
            {/* Editable Profile Fields */}
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" onSubmit={e => e.preventDefault()}>
              <div>
                <label className="block text-cyan-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-cyan-700 font-semibold mb-1">Nick Name</label>
                <input
                  type="text"
                  name="nickName"
                  value={profile.nickName}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-cyan-700 font-semibold mb-1">Gender</label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-cyan-700 font-semibold mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={profile.country}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-cyan-700 font-semibold mb-1">Language</label>
                <select
                  name="language"
                  value={profile.language}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option>English</option>
                  <option>Sinhala</option>
                  <option>Tamil</option>
                </select>
              </div>
              <div>
                <label className="block text-cyan-700 font-semibold mb-1">Time Zone</label>
                <select
                  name="timeZone"
                  value={profile.timeZone}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option>GMT+5:30</option>
                  <option>GMT+6:00</option>
                  <option>GMT+7:00</option>
                </select>
              </div>
            </form>
            {/* Contact Info */}
            <div className="bg-cyan-50 rounded-2xl p-6 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-cyan-700 font-semibold mb-2">
                <FaEnvelope className="text-cyan-400" />
                My email Address
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-xl px-4 py-2 shadow text-cyan-700 flex items-center gap-2">
                  <FaEnvelope className="text-cyan-400" />
                  <span>{profile.email}</span>
                  <span className="text-xs text-cyan-400 ml-2">1 month ago</span>
                </div>
              </div>
              <button
                className="mt-2 px-4 py-2 rounded-xl font-semibold text-cyan-600 bg-cyan-100 hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-fit"
                onClick={() => setNewEmail("")}
              >
                + Add Email Address
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
