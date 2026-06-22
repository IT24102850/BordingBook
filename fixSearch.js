const fs = require('fs');
const path = 'c:/Users/chath/Desktop/BordingBook/src/app/components/SearchPage.tsx';
let c = fs.readFileSync(path, 'utf8');

// Fix 1: Remove roommateData prop from RoommateFinderPlaceholder call
c = c.replace('roommateData={effectiveRoommates}\n            ', '');

// Fix 2: Add token declaration in refreshRoommateTabData
c = c.replace(
  'const refreshRoommateTabData = async () => {\n  // No authentication required\n  const load',
  'const refreshRoommateTabData = async () => {\n  const token = localStorage.getItem("bb_access_token") || "";\n  const load'
);

// Fix 3: Add token in handleRequestDecision
c = c.replace(
  'const handleRequestDecision = async (\n  requestId: string,\n  decision: "accept" | "reject",\n) => {\n  // No authentication required\n  try {',
  'const handleRequestDecision = async (\n  requestId: string,\n  decision: "accept" | "reject",\n) => {\n  try {\n    const token = localStorage.getItem("bb_access_token") || "";'
);

// Fix 4: Add token in handleGroupInviteDecision
c = c.replace(
  'const handleGroupInviteDecision = async (\n  groupId: string,\n  decision: "accepted" | "rejected",\n) => {\n  // No authentication required\n  try {',
  'const handleGroupInviteDecision = async (\n  groupId: string,\n  decision: "accepted" | "rejected",\n) => {\n  try {\n    const token = localStorage.getItem("bb_access_token") || "";'
);

// Fix 5: Fix handleStartGroupChat - add groupId and token
c = c.replace(
  'const handleStartGroupChat = async (group: any) => {\n  // No authentication required\n  if (!groupId) {',
  'const handleStartGroupChat = async (group: any) => {\n  const groupId = String(group?._id || group?.id || "");\n  const token = localStorage.getItem("bb_access_token") || "";\n  if (!groupId) {'
);

// Fix 6: Add token in submitCreateGroup
c = c.replace(
  'const submitCreateGroup = async () => {\n  // No authentication required\n  if (selectedGroupMembers.length === 0) {',
  'const submitCreateGroup = async () => {\n  const token = localStorage.getItem("bb_access_token") || "";\n  if (selectedGroupMembers.length === 0) {'
);

// Fix 7: Fix loadLikedProfiles - add token
c = c.replace(
  'const loadLikedProfiles = async () => {\n    // No authentication required\n    try {\n      const controller',
  'const loadLikedProfiles = async () => {\n    const token = localStorage.getItem("bb_access_token") || "";\n    try {\n      const controller'
);

// Fix 8: Fix duplicate heading (desktop)
c = c.replace(
  'All Available Rooms{" "}\n                        {rankedRooms.length > 0 && `(${rankedRooms.length})`}\n                        All Available Rooms and Houses{" "}\n                        {rankedRooms.length > 0 && `(${rankedRooms.length})`}',
  'All Available Rooms and Houses{" "}\n                        {rankedRooms.length > 0 && `(${rankedRooms.length})`}'
);

// Fix 9: Fix duplicate heading (mobile)
c = c.replace(
  'All Rooms{" "}\n                      {rankedRooms.length > 0 && `(${rankedRooms.length})`}\n                      All Available Rooms and Houses{" "}\n                      {rankedRooms.length > 0 && `(${rankedRooms.length})`}',
  'All Available Rooms and Houses{" "}\n                      {rankedRooms.length > 0 && `(${rankedRooms.length})`}'
);

// Fix 10: Add visibleSavedListings and hiddenSavedListingsCount variables
c = c.replace(
  'const savedSearchPreviewLimit = 4;',
  'const savedSearchPreviewLimit = 4;\n  const visibleSavedListings = showAllSavedSearches ? likedListings : likedListings.slice(0, savedSearchPreviewLimit);\n  const hiddenSavedListingsCount = Math.max(0, likedListings.length - savedSearchPreviewLimit);'
);

fs.writeFileSync(path, c, 'utf8');
console.log('All fixes applied successfully!');
