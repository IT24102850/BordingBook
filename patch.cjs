const fs = require('fs');
const filepath = 'c:/Users/hasir/Downloads/BordingBook/src/app/components/SearchPage.tsx';
let text = fs.readFileSync(filepath, 'utf-8');

// ==== FIX 2 ====
const oldMapRegex = /const persistedNotifications: Notification\[\] = dbNotificationItems\.map\(\(item: any\) => \(\{[\s\S]*?id:.*?[\s\S]*?timestamp:.*?[\s\S]*?actionRequired:.*?[\s\S]*?bookingId:.*?\n\s*\}\)\);/;

const newMapStr = `const persistedNotifications: Notification[] = dbNotificationItems.map((item: any) => ({
      id: \`db-notification-\${item?._id || Math.random().toString(36).slice(2)}\`,
      type: item?.type || 'other',
      title: item?.title || 'Notification',
      message: item?.message || '',
      timestamp: item?.createdAt || new Date().toISOString(),
      read: Boolean(item?.read),
      actionRequired: item?.type === 'agreement_pending' || 
        ['group_invite', 'group_invite_accepted', 'group_invite_rejected'].includes(String(item?.type || '')),
      bookingId: item?.bookingId || item?.data?.bookingId || '',
      data: {
        agreementId: item?.agreementId || item?.data?.agreementId || item?.metadata?.agreementId || '',
        bookingRequestId: item?.bookingRequestId || item?.data?.bookingRequestId || '',
        roomName: item?.roomName || item?.data?.roomName || '',
        ...item?.data,
      },
    }));`;

if (oldMapRegex.test(text)) {
  text = text.replace(oldMapRegex, newMapStr);
  console.log('Fix 2 applied successfully.');
} else {
  console.log('Fix 2 regex failed to match.');
}

// ==== FIX 3 ====
// The user wants to replace the top div of the map to remove onClick, wrap the contents in a clickable div, add the button, and update actionRequired logic.
const notificationsMapRegex = /\{notifications\.map\(\(notif\) => \([\s\S]*?<div\s*key=\{notif\.id\}[\s\S]*?className=\{`p-4[\s\S]*?onClick=\{\(\) => \{[\s\S]*?openNotification[\s\S]*?\}\}[\s\S]*?>([\s\S]*?)<div className="flex items-start gap-3">([\s\S]*?)\{notif\.actionRequired && \([\s\S]*?<div className="mt-2">[\s\S]*?<span className="text-xs px-2 py-1 bg-amber-500\/20 text-amber-300 rounded-full border border-amber-500\/30">[\s\S]*?Action Required[\s\S]*?<\/span>[\s\S]*?<\/div>[\s\S]*?\)\}[\s\S]*?<\/div>\s*\)\}/;

const newNotificationsMapStr = `{notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={\`p-4 mb-2 rounded-lg transition-all \${
                          notif.read
                            ? 'bg-white/5 hover:bg-white/10'
                            : 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 hover:border-cyan-500/40'
                        }\`}
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            dismissPopupNotification();
                            openNotification(notif);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={\`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center \${
                              notif.type === 'agreement_pending' ? 'bg-yellow-500/20' :
                              notif.type === 'owner_approval' ? 'bg-green-500/20' :
                              notif.type === 'payment_pending' ? 'bg-purple-500/20' :
                              notif.type === 'payment_complete' ? 'bg-purple-500/20' :
                              notif.type === 'system' ? 'bg-blue-500/20' :
                              notif.type === 'group_invite' ? 'bg-indigo-500/20' :
                              'bg-amber-500/20'
                            }\`}>
                              {notif.type === 'agreement_pending' && <FaCheckCircle className="text-yellow-400" />}
                              {notif.type === 'owner_approval' && <FaCheckCircle className="text-green-400" />}
                              {notif.type === 'payment_pending' && <FaCreditCard className="text-purple-400" />}
                              {notif.type === 'payment_complete' && <FaCreditCard className="text-purple-400" />}
                              {notif.type === 'system' && <FaInfoCircle className="text-blue-400" />}
                              {notif.type === 'group_invite' && <FaUsers className="text-indigo-400" />}
                              {!['agreement_pending', 'owner_approval', 'payment_pending', 'payment_complete', 'system', 'group_invite'].includes(notif.type) && <FaBell className="text-amber-400" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-white font-semibold text-sm">{notif.title}</h4>
                                {!notif.read && <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>}
                              </div>
                              <p className="text-gray-300 text-xs mb-2">{notif.message}</p>
                              <span className="text-gray-500 text-xs">
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
                        )}
                      </div>
                    )}`;

if (notificationsMapRegex.test(text)) {
  text = text.replace(notificationsMapRegex, newNotificationsMapStr);
  console.log('Fix 3 applied successfully.');
} else {
  console.log('Fix 3 regex failed to match.');
  // Backup text matching
  const searchStart = '{notifications.map((notif) => (';
  const searchEnd = 'Action Required';
  const actionRequiredEndStr = '}</div>)}'; // approximating structure
  // In a real approach, it's easier to just print it out, let's output a chunk if regex fails
}

fs.writeFileSync(filepath, text, 'utf-8');
