import React from "react";

// Roommate profile creation form
const RoommateProfileForm = ({ onSubmit }: { onSubmit: (profile: any) => void }) => {
  // ...form state for budget, academic year, gender, preferences, description, habits, etc...
  return (
    <form className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10 max-w-md mx-auto" onSubmit={e => { e.preventDefault(); onSubmit({}); }}>
      <h2 className="text-lg font-bold text-white mb-4">Create Roommate Profile</h2>
      <input className="w-full mb-2 p-2 rounded" placeholder="Description" />
      <input className="w-full mb-2 p-2 rounded" placeholder="Budget (Rs.)" type="number" />
      <input className="w-full mb-2 p-2 rounded" placeholder="Academic Year" />
      <select className="w-full mb-2 p-2 rounded">
        <option>Gender</option>
        <option>Male</option>
        <option>Female</option>
        <option>Any</option>
      </select>
      <input className="w-full mb-2 p-2 rounded" placeholder="Habits/Preferences (comma separated)" />
      <button className="w-full py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded font-medium mt-2">Save Profile</button>
    </form>
  );
};

// Group booking creation
const GroupBookingForm = ({ onCreate }: { onCreate: () => void }) => (
  <form className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10 max-w-md mx-auto" onSubmit={e => { e.preventDefault(); onCreate(); }}>
    <h2 className="text-lg font-bold text-white mb-4">Create Booking Group</h2>
    <input className="w-full mb-2 p-2 rounded" placeholder="Group Name" />
    <input className="w-full mb-2 p-2 rounded" placeholder="Planned Boarding House" />
    <button className="w-full py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded font-medium mt-2">Create Group</button>
  </form>
);

// Invite members and notifications (mock UI)
const InvitePanel = ({ onInvite }: { onInvite: () => void }) => (
  <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10 max-w-md mx-auto">
    <h2 className="text-lg font-bold text-white mb-2">Invite Members</h2>
    <input className="w-full mb-2 p-2 rounded" placeholder="Email or Student ID" />
    <button className="w-full py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded font-medium mt-2" onClick={onInvite}>Send Invite</button>
    <div className="mt-4 text-xs text-cyan-200">You will receive notifications for invites and group updates.</div>
  </div>
);

// Tinder-style swipeable roommate finder UI placeholder
const SwipeableRoommateFinder = () => (
  <div className="bg-white/10 rounded-xl p-6 border border-white/10 max-w-2xl mx-auto mb-8">
    <h2 className="text-lg font-bold text-white mb-4">Browse Roommate Profiles</h2>
    {/* Implement swipeable cards here */}
    <div className="text-white text-center">Swipe left/right to browse profiles and send requests.</div>
  </div>
);

export default function RoommateFinderGroupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8">
        <RoommateProfileForm onSubmit={() => {}} />
        <GroupBookingForm onCreate={() => {}} />
        <InvitePanel onInvite={() => {}} />
        <SwipeableRoommateFinder />
      </div>
    </div>
  );
}
