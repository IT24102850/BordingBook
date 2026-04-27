const fs = require('fs');
const filepath = 'c:/Users/hasir/Downloads/BordingBook/src/app/components/SearchPage.tsx';
let text = fs.readFileSync(filepath, 'utf-8');

const f3Start = text.indexOf('{notifications.map((notif) => (');
if (f3Start !== -1) {
    const f3EndChunk = ')}</div></div>'; // This usually doesn't appear correctly without formatting. Let's find exactly the outer Div.
    const searchString = `                              onClick={() => {
                                dismissPopupNotification();
                                openNotification(notif);
                              }}
                            >
                              <div className="flex items-start gap-3">`;
    if (text.includes(searchString)) {
        const replacement1 = `                            >
                              <div
                                className="cursor-pointer"
                                onClick={() => {
                                  dismissPopupNotification();
                                  openNotification(notif);
                                }}
                              >
                                <div className="flex items-start gap-3">`;
        text = text.replace(searchString, replacement1);
        console.log('Fix 3 Part 1 applied.');
    } else {
        console.log('Fix 3 Part 1 failed.');
    }

    const searchActionReq = `                                    {notif.actionRequired && (
                                      <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                                        Action Required
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>`;
                              
    if (text.includes(searchActionReq)) {
        const newBlock = `                                  </div>
                                </div>
                              </div>

                              {(notif.type === 'agreement_pending' || notif.title?.toLowerCase().includes('agreement')) && notif.data?.agreementId && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAgreementModalData({
                                        agreementId: notif.data.agreementId,
                                        bookingRequestId: notif.data.bookingRequestId || notif.bookingId || '',
                                        roomName: notif.data.roomName || notif.message?.match(/for (.+?) has/)?.[1] || '',
                                      });
                                      setShowAgreementModal(true);
                                      setShowNotifications(false);
                                      setNotifications(prev =>
                                        prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
                                      );
                                    }}
                                    className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 text-yellow-200 text-xs font-semibold hover:from-yellow-500/30 hover:to-orange-500/30 transition-all flex items-center justify-center gap-2"
                                  >
                                    <FaCheckCircle className="text-yellow-400" />
                                    Sign Agreement
                                  </button>
                                </div>
                              )}

                              {notif.actionRequired && notif.type !== 'agreement_pending' && !notif.title?.toLowerCase().includes('agreement') && (
                                <div className="mt-2">
                                  <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                                    Action Required
                                  </span>
                                </div>
                              )}`;
        text = text.replace(searchActionReq, newBlock);
        console.log('Fix 3 Part 2 applied.');
        
        // Also add the missing yellow icon class to the dynamic class array
        const iconClassesSearch = `                                  notif.type === 'group_status_booked' ? 'bg-violet-500/20' :
                                  'bg-amber-500/20'
                                }\`}>`;
        if (text.includes(iconClassesSearch)) {
            const iconClassesNew = `                                  notif.type === 'group_status_booked' ? 'bg-violet-500/20' :
                                  notif.type === 'agreement_pending' ? 'bg-yellow-500/20' :
                                  'bg-amber-500/20'
                                }\`}>`;
            text = text.replace(iconClassesSearch, iconClassesNew);
        }
        
        const iconSVGSearch = `{notif.type === 'owner_approval' && <FaCheckCircle className="text-green-400" />}`;
        if (text.includes(iconSVGSearch)) {
            const iconSVGNew = `{notif.type === 'agreement_pending' && <FaCheckCircle className="text-yellow-400" />}
                                  {notif.type === 'owner_approval' && <FaCheckCircle className="text-green-400" />}`;
            text = text.replace(iconSVGSearch, iconSVGNew);
        }
        
    } else {
        console.log('Fix 3 Part 2 failed to find replacing chunk.');
        // Let's use flexible Regex just for the actionRequired block
        // It has \r\n vs \n differences usually.
        const flexRegex = /\{notif\.actionRequired\s*&&\s*\(\s*<span className="text-xs px-2 py-1 bg-amber-500\/20 text-amber-300 rounded-full border border-amber-500\/30">\s*Action Required\s*<\/span>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>/;
        
        const flexNew = `</div>
                                </div>
                              </div>

                              {(notif.type === 'agreement_pending' || notif.title?.toLowerCase().includes('agreement')) && notif.data?.agreementId && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAgreementModalData({
                                        agreementId: notif.data.agreementId,
                                        bookingRequestId: notif.data.bookingRequestId || notif.bookingId || '',
                                        roomName: notif.data.roomName || notif.message?.match(/for (.+?) has/)?.[1] || '',
                                      });
                                      setShowAgreementModal(true);
                                      setShowNotifications(false);
                                      setNotifications(prev =>
                                        prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
                                      );
                                    }}
                                    className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 text-yellow-200 text-xs font-semibold hover:from-yellow-500/30 hover:to-orange-500/30 transition-all flex items-center justify-center gap-2"
                                  >
                                    <FaCheckCircle className="text-yellow-400" />
                                    Sign Agreement
                                  </button>
                                </div>
                              )}

                              {notif.actionRequired && notif.type !== 'agreement_pending' && !notif.title?.toLowerCase().includes('agreement') && (
                                <div className="mt-2">
                                  <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                                    Action Required
                                  </span>
                                </div>
                              )}`;
        if (flexRegex.test(text)) {
            text = text.replace(flexRegex, flexNew);
            console.log('Fix 3 Part 2 (Flex) applied.');
        } else {
            console.log('Flex regex also failed.');
        }
    }
}

fs.writeFileSync(filepath, text, 'utf-8');
