const fs = require('fs');
const path = 'c:/Users/chath/Desktop/BordingBook/src/app/components/SearchPage.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

const find = (text, startLine = 0) => {
  for (let i = startLine; i < lines.length; i++) {
    if (lines[i].includes(text)) return i;
  }
  return -1;
};

const insertAfter = (idx, ...newLines) => lines.splice(idx + 1, 0, ...newLines);

let idx;

// Fix 1: Remove roommateData prop
idx = find('roommateData={effectiveRoommates}');
if (idx >= 0) { lines.splice(idx, 1); console.log('Fix 1 done'); }
else console.log('Fix 1 skipped (already fixed)');

// Fix 2: token in refreshRoommateTabData
idx = find('const refreshRoommateTabData = async');
if (idx >= 0) {
  let body = find('// No authentication required', idx);
  if (body >= 0 && body < idx + 5) { lines[body] = '  const token = localStorage.getItem("bb_access_token") || "";'; console.log('Fix 2 done'); }
  else { insertAfter(idx, '  const token = localStorage.getItem("bb_access_token") || "";'); console.log('Fix 2 inserted'); }
} else console.log('Fix 2 skipped');

// Fix 3: token in submitRequest
idx = find('const submitRequest = async');
if (idx >= 0) {
  let body = find('// No authentication required', idx);
  if (body >= 0 && body < idx + 5) { lines[body] = '  const token = localStorage.getItem("bb_access_token") || "";'; console.log('Fix 3 done'); }
  else { insertAfter(idx, '  const token = localStorage.getItem("bb_access_token") || "";'); console.log('Fix 3 inserted'); }
} else console.log('Fix 3 skipped');

// Fix 4: token in handleRequestDecision
idx = find('const handleRequestDecision = async');
if (idx >= 0) {
  let body = find('// No authentication required', idx);
  if (body >= 0 && body < idx + 5) { lines[body] = '  const token = localStorage.getItem("bb_access_token") || "";'; console.log('Fix 4 done'); }
  else { insertAfter(idx, '  const token = localStorage.getItem("bb_access_token") || "";'); console.log('Fix 4 inserted'); }
} else console.log('Fix 4 skipped');

// Fix 5: token in handleGroupInviteDecision
idx = find('const handleGroupInviteDecision = async');
if (idx >= 0) {
  let body = find('// No authentication required', idx);
  if (body >= 0 && body < idx + 5) { lines[body] = '  const token = localStorage.getItem("bb_access_token") || "";'; console.log('Fix 5 done'); }
  else { insertAfter(idx, '  const token = localStorage.getItem("bb_access_token") || "";'); console.log('Fix 5 inserted'); }
} else console.log('Fix 5 skipped');

// Fix 6: groupId + token in handleStartGroupChat
idx = find('const handleStartGroupChat = async');
if (idx >= 0) {
  let body = find('// No authentication required', idx);
  if (body >= 0 && body < idx + 5) {
    lines[body] = '  const groupId = String(group?._id || group?.id || "");\n  const token = localStorage.getItem("bb_access_token") || "";';
    console.log('Fix 6 done');
  } else { insertAfter(idx, '  const groupId = String(group?._id || group?.id || "");', '  const token = localStorage.getItem("bb_access_token") || "";'); console.log('Fix 6 inserted'); }
} else console.log('Fix 6 skipped');

// Fix 7: token in submitCreateGroup
idx = find('const submitCreateGroup = async');
if (idx >= 0) {
  let body = find('// No authentication required', idx);
  if (body >= 0 && body < idx + 5) { lines[body] = '  const token = localStorage.getItem("bb_access_token") || "";'; console.log('Fix 7 done'); }
  else { insertAfter(idx, '  const token = localStorage.getItem("bb_access_token") || "";'); console.log('Fix 7 inserted'); }
} else console.log('Fix 7 skipped');

// Fix 8: token in loadLikedProfiles
idx = find('const loadLikedProfiles = async');
if (idx >= 0) {
  let body = find('// No authentication required', idx);
  if (body >= 0 && body < idx + 5) { lines[body] = '  const token = localStorage.getItem("bb_access_token") || "";'; console.log('Fix 8 done'); }
  else { insertAfter(idx, '  const token = localStorage.getItem("bb_access_token") || "";'); console.log('Fix 8 inserted'); }
} else console.log('Fix 8 skipped');

// Fix 9: selectedRoommate null check
idx = find('onToast(`Roommate request sent to ${selectedRoommate.name}');
if (idx >= 0) { lines[idx] = lines[idx].replace('selectedRoommate.name', 'selectedRoommate?.name'); console.log('Fix 9 done'); }
else console.log('Fix 9 skipped');

// Fix 10: visibleSavedListings + hiddenSavedListingsCount
idx = find('const savedSearchPreviewLimit = 4');
if (idx >= 0 && !lines[idx + 1].includes('visibleSavedListings')) {
  insertAfter(idx,
    '  const visibleSavedListings = showAllSavedSearches ? likedListings : likedListings.slice(0, savedSearchPreviewLimit);',
    '  const hiddenSavedListingsCount = Math.max(0, likedListings.length - savedSearchPreviewLimit);'
  );
  console.log('Fix 10 done');
} else console.log('Fix 10 skipped');

// Fix 11: default export
const content = lines.join('\n');
if (!content.includes('export default SearchPage')) {
  lines.push('\nexport default SearchPage;');
  console.log('Fix 11 done');
} else console.log('Fix 11 skipped');

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('\nDone! Now run: npx tsc --noEmit 2>&1 | Select-String "SearchPage"');
