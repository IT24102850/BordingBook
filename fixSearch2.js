const fs = require('fs');
const path = 'c:/Users/chath/Desktop/BordingBook/src/app/components/SearchPage.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Helper: find first line containing text (1-based)
const find = (text, startLine = 0) => {
  for (let i = startLine; i < lines.length; i++) {
    if (lines[i].includes(text)) return i;
  }
  return -1;
};

// Helper: insert lines after index
const insertAfter = (idx, ...newLines) => {
  lines.splice(idx + 1, 0, ...newLines);
};

// Helper: replace text in a line
const replaceLine = (idx, from, to) => {
  lines[idx] = lines[idx].replace(from, to);
};

// Fix 1: Remove roommateData prop from RoommateFinderPlaceholder call
let idx = find('roommateData={effectiveRoommates}');
if (idx >= 0) { lines.splice(idx, 1); console.log('Fix 1 done'); }

// Fix 2: token in refreshRoommateTabData
idx = find('const refreshRoommateTabData = async');
if (idx >= 0) {
  let body = find('// No authentication required', idx);
  if (body >= 0 && body < idx + 5) {
    lines[body] = '  const token = localStorage.getItem("bb_access_token") || "";';
    console.log('Fix 2 done');
  } else {
    insertAfter(idx, '  const token = localStorage.getItem("bb_access_token") || "";');
    console.log('Fix 2 done (inserted)');
  }
}

// Fix 3: token in submitRequest
idx = find('const submitRequest = async');
if (idx >= 0) {
  let body = find('const token = getAuthToken', idx);
  if (body < 0 || body > idx + 10) {
    insertAfter(idx, '  const token = localStorage.getItem("bb_access_token") || "";');
    console.log('Fix 3 done');
  }
}

// Fix 4: token in handleRequestDecision  
idx = find('const handleRequestDecision = async');
if (idx >= 0) {
  let body = find('// No authentication required', idx);
  if (body >= 0 && body < idx + 5) {
    lines[body] = '  const token = localStorage.getItem("bb_access_token") || "";';
    console.log('Fix 4 done');
  }
}

// Fix 5: token in handleGroupInviteDecision
idx = find('const handleGroupInviteDecision = async');
if (idx >= 0) {
  let body = find('// No authentication required', idx);
  if (body >= 0 && body < idx + 5) {
    lines[body] = '  const token = localStorage.getItem("bb_access_token") || "";';
    console.log('Fix 5 done');
  }
}

// Fix 6: groupId + token in handleStartGroupChat
idx = find('const handleStartGroupChat = async');
if (idx >= 0) {
  let body = find('// No authentication required', idx);
  if (body >= 0 && body < idx + 5) {
    lines[body] = '  const groupId = String(group?._id || group?.id || "");\n  const token = localStorage.getItem("bb_access_token") || "";';
    console.log('Fix 6 done');
  }
}

// Fix 7: token in submitCreateGroup
idx = find('const submitCreateGroup = async');
if (idx >= 0) {
  let body = find('// No authentication required', idx);
  if (body >= 0 && body < idx + 5) {
    lines[body] = '  const token = localStorage.getItem("bb_access_token") || "";';
    console.log('Fix 7 done');
  }
}

// Fix 8: token in loadLikedProfiles
idx = find('const loadLikedProfiles = async');
if (idx >= 0) {
  let body = find('// No authentication required', idx);
  if (body >= 0 && body < idx + 5) {
    lines[body] = '  const token = localStorage.getItem("bb_access_token") || "";';
    console.log('Fix 8 done');
  }
}

// Fix 9: selectedRoommate null check in submitRequest
idx = find('onToast(`Roommate request sent to ${selectedRoommate.name}');
if (idx >= 0) {
  lines[idx] = lines[idx].replace('selectedRoommate.name', 'selectedRoommate?.name');
  console.log('Fix 9 done');
}

// Fix 10: Add visibleSavedListings + hiddenSavedListingsCount after savedSearchPreviewLimit
idx = find('const savedSearchPreviewLimit = 4');
if (idx >= 0) {
  // Check if already added
  if (!lines[idx + 1].includes('visibleSavedListings')) {
    insertAfter(idx,
      '  const visibleSavedListings = showAllSavedSearches ? likedListings : likedListings.slice(0, savedSearchPreviewLimit);',
      '  const hiddenSavedListingsCount = Math.max(0, likedListings.length - savedSearchPreviewLimit);'
    );
    console.log('Fix 10 done');
  }
}

// Fix 11: SearchPage needs default export - add at end if missing
const content = lines.join('\n');
if (!content.includes('export default SearchPage')) {
  lines.push('\nexport default SearchPage;');
  console.log('Fix 11 done - added default export');
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('\nAll fixes applied! Run: npx tsc --noEmit 2>&1 | Select-String "SearchPage"');
