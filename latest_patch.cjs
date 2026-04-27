const fs = require('fs');
const filepath = 'c:/Users/hasir/Downloads/BordingBook/src/app/components/SearchPage.tsx';
let text = fs.readFileSync(filepath, 'utf-8');

// Fix 3: notifications.map
const f3Start = text.indexOf('{notifications.map((notif) => (');
if (f3Start !== -1) {
  // We want to replace from this all the way to the closing div of the map.
  const actionReq = text.indexOf('Action Required', f3Start);
  if (actionReq !== -1) {
    let f3EndP = text.indexOf(')}', text.indexOf('</div>', actionReq));
    let finalEndP = text.indexOf('</div>', f3EndP);
    finalEndP = text.indexOf('</div>', finalEndP + 1); // We need the end of the mapped element
    
    // Safer approach: use regex string replace to just replace the outer onClick and contents
    // Let's replace the outer onClick
    const onClickStr = `onClick={() => {
                                dismissPopupNotification();
                                openNotification(notif);
                              }}`;
    text = text.replace(onClickStr, '');
    
    const innerStartStr = `<div className="flex items-start gap-3">`;
    const newInnerStartStr = `<div
                          className="cursor-pointer"
                          onClick={() => {
                            dismissPopupNotification();
                            openNotification(notif);
                          }}
                        >
                          <div className="flex items-start gap-3">`;
    text = text.replace(innerStartStr, newInnerStartStr);
    
    // Replace actionRequired area to add the new button AND close the <div className="cursor-pointer">
    const actionRequiredRegex = /<div className="flex items-center justify-between">\s*<span className="text-gray-500 text-xs">[\s\S]*?<\/span>\s*\{notif\.actionRequired && \(\s*<span className="text-xs px-2 py-1 bg-amber-500\/20 text-amber-300 rounded-full border border-amber-500\/30">\s*Action Required\s*<\/span>\s*\)\}\s*<\/div>/;
    
    const newActionRequiredStr = `<span className="text-gray-500 text-xs">
                                      {new Date(notif.timestamp).toLocaleString('en-US', {
                                        month: 'short', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
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
                              
    if (actionRequiredRegex.test(text)) {
        text = text.replace(actionRequiredRegex, newActionRequiredStr);
        console.log('Fix 3 applied.');
    } else {
        console.log('Fix 3 failed.');
    }
  }
}

// Add the agreement modal to the return statement.
const modalCode = `{showAgreementModal && agreementModalData && (
        <AgreementAcceptModal
          open={showAgreementModal}
          onClose={() => setShowAgreementModal(false)}
          agreementId={agreementModalData.agreementId}
          bookingRequestId={agreementModalData.bookingRequestId}
          roomName={agreementModalData.roomName}
          onAccepted={() => {
            setShowAgreementModal(false);
            setToastMessage('Agreement signed successfully!');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
          }}
        />
      )}`;

// Insert right before the last closing </div> of the return statement
// In SearchPage, the final closing is usually at the end of the file.
const lastDivIndex = text.lastIndexOf('</div>');
if (lastDivIndex !== -1) {
    if (!text.includes('AgreementAcceptModal\n          open={showAgreementModal}')) {
        text = text.slice(0, lastDivIndex) + modalCode + '\\n      ' + text.slice(lastDivIndex);
        console.log('Fix 4 Return Modal applied.');
    } else {
        console.log('Modal already exists in return.');
    }
}

fs.writeFileSync(filepath, text, 'utf-8');
