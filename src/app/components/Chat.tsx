import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Send, Phone, Video, Search, ArrowLeft, PhoneOff, Loader2, MessageSquarePlus, X } from 'lucide-react';

const API_BASE_URL = (((import.meta as any).env?.VITE_API_URL as string) || '').replace(/\/$/, '');

const ICE_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

interface ChatUser {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  role: string;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  sender: ChatUser;
  content: string;
  messageType: 'text' | 'system';
  createdAt: string;
  mine: boolean;
}

interface ChatConversation {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar: string;
  unreadCount: number;
  participants: Array<ChatUser & { lastReadAt?: string; role?: string }>;
  lastMessage: {
    text: string;
    at: string;
    senderId: string | null;
  };
  updatedAt: string;
}

interface ChatContact {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  role: string;
  conversationId: string | null;
}

interface IncomingCall {
  conversationId: string;
  fromUser: ChatUser;
  callType: 'audio' | 'video';
}

interface ActiveCall {
  conversationId: string;
  targetUserId: string;
  callType: 'audio' | 'video';
  phase: 'dialing' | 'connecting' | 'active';
}

function getCurrentUser(): ChatUser | null {
  try {
    const raw = localStorage.getItem('bb_current_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      id: String(parsed?.id || ''),
      fullName: String(parsed?.fullName || ''),
      email: String(parsed?.email || ''),
      avatar: String(parsed?.profilePicture || ''),
      role: String(parsed?.role || 'student'),
    };
  } catch {
    return null;
  }
}

async function apiFetch<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/chat${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const json = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    console.error('[Chat API] Error response:', {
      status: response.status,
      statusText: response.statusText,
      body: json,
    });
    throw new Error(json?.message || json?.error || `API error: ${response.status}`);
  }

  if (json?.success === false) {
    console.error('[Chat API] API returned success:false:', json);
    throw new Error(json?.message || 'API request failed');
  }

  return json?.data as T;
}

function formatTime(value: string | Date | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function appendMessageIfMissing(existing: ChatMessage[], incoming: ChatMessage): ChatMessage[] {
  if (existing.some((item) => item.id === incoming.id)) {
    return existing;
  }
  return [...existing, incoming];
}

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const token = localStorage.getItem('bb_access_token') || '';

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const lastRecipientBootstrapRef = useRef('');
  const selectedConversationIdRef = useRef('');
  const activeCallRef = useRef<ActiveCall | null>(null);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const targetParticipant = useMemo(() => {
    if (!selectedConversation || !currentUser) return null;
    return selectedConversation.participants.find((participant) => participant.id !== currentUser.id) || null;
  }, [selectedConversation, currentUser]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => conversation.name.toLowerCase().includes(query));
  }, [conversations, searchQuery]);

  const cleanupPeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.onicecandidate = null;
      peerRef.current.close();
      peerRef.current = null;
    }
  }, []);

  const cleanupMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  const endCall = useCallback(
    (notifyRemote: boolean) => {
      if (notifyRemote && activeCall && socketRef.current) {
        socketRef.current.emit('call:end', {
          conversationId: activeCall.conversationId,
          targetUserId: activeCall.targetUserId,
        });
      }
      cleanupPeer();
      cleanupMedia();
      setIncomingCall(null);
      setActiveCall(null);
      activeCallRef.current = null;
    },
    [activeCall, cleanupMedia, cleanupPeer]
  );

  const fetchConversations = useCallback(async (preferredConversationId?: string) => {
    if (!token) return;
    try {
      setLoadingConversations(true);
      const data = await apiFetch<ChatConversation[]>('/conversations', token);
      const nextConversations = data || [];
      setConversations(nextConversations);

      // Only update selection if a preferred ID is explicitly provided, otherwise keep current selection
      if (preferredConversationId && nextConversations.some((conversation) => conversation.id === preferredConversationId)) {
        setSelectedConversationId(preferredConversationId);
      } else if (selectedConversationIdRef.current && nextConversations.some((conversation) => conversation.id === selectedConversationIdRef.current)) {
        // Keep the current selection if it still exists in the updated list
        setSelectedConversationId(selectedConversationIdRef.current);
      } else if (selectedConversationIdRef.current === '' && preferredConversationId === undefined) {
        // On initial load with no selection, keep it empty - let user choose
        setSelectedConversationId('');
      }
    } catch (fetchError) {
      setError((fetchError as Error).message || 'Unable to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  }, [token]);

  const fetchMessages = useCallback(
    async (conversationId: string) => {
      if (!conversationId || !token) return;
      try {
        setLoadingMessages(true);
        const data = await apiFetch<ChatMessage[]>(`/conversations/${conversationId}/messages`, token);
        setMessages(data || []);
        await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}/read`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (fetchError) {
        setError((fetchError as Error).message || 'Unable to load messages');
      } finally {
        setLoadingMessages(false);
      }
    },
    [token]
  );

  const ensureDirectConversationFromRouteState = useCallback(async () => {
    if (!token) return;

    const state = (location.state || {}) as any;
    const selectedRoommate = state?.selectedRoommate;
    const queryRecipientId = new URLSearchParams(location.search).get('recipientId');
    const recipientId = String(
      selectedRoommate?.userId ||
      state?.recipientId ||
      queryRecipientId ||
      selectedRoommate?.id ||
      state?.selectedUserId ||
      ''
    );
    if (!recipientId) return;
    if (lastRecipientBootstrapRef.current === recipientId) return;
    lastRecipientBootstrapRef.current = recipientId;

    try {
      const data = await apiFetch<ChatConversation>('/conversations/direct', token, {
        method: 'POST',
        body: JSON.stringify({ recipientId }),
      });
      setSelectedConversationId(data.id);
      await fetchConversations(data.id);
    } catch (createError) {
      setError((createError as Error).message || 'Unable to open direct conversation');
    }
  }, [fetchConversations, location.search, location.state, token]);

  const fetchContacts = useCallback(
    async (search = '') => {
      if (!token) return;
      try {
        setLoadingContacts(true);
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        const data = await apiFetch<ChatContact[]>(`/contacts${query}`, token);
        setContacts(data || []);
      } catch (fetchError) {
        setError((fetchError as Error).message || 'Unable to load contacts');
      } finally {
        setLoadingContacts(false);
      }
    },
    [token]
  );

  const createOrOpenDirectConversation = useCallback(
    async (recipientId: string) => {
      try {
        setError('');
        console.log('[Chat] Starting direct conversation with:', recipientId);
        const data = await apiFetch<ChatConversation>('/conversations/direct', token, {
          method: 'POST',
          body: JSON.stringify({ recipientId }),
        });

        console.log('[Chat] Conversation created:', data.id);
        setSelectedConversationId(data.id);
        setShowNewChatModal(false);
        setContactSearchQuery('');
        await fetchConversations(data.id);
      } catch (createError) {
        const errorMsg = (createError as Error).message || 'Unable to create direct conversation';
        console.error('[Chat] Error creating conversation:', errorMsg, createError);
        setError(errorMsg);
      }
    },
    [fetchConversations, token]
  );

  const startLocalMedia = useCallback(async (callType: 'audio' | 'video') => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video',
    });

    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }, []);

  const createPeerConnection = useCallback(
    async (params: {
      conversationId: string;
      targetUserId: string;
      callType: 'audio' | 'video';
      initiator: boolean;
    }) => {
      cleanupPeer();

      const peer = new RTCPeerConnection(ICE_CONFIG);
      peerRef.current = peer;

      peer.ontrack = (event) => {
        const [stream] = event.streams;
        remoteStreamRef.current = stream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      };

      peer.onicecandidate = (event) => {
        if (!event.candidate || !socketRef.current) return;
        socketRef.current.emit('call:signal', {
          conversationId: params.conversationId,
          targetUserId: params.targetUserId,
          signal: {
            type: 'ice-candidate',
            candidate: event.candidate,
          },
        });
      };

      const stream = localStreamRef.current;
      if (stream) {
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      }

      if (params.initiator && socketRef.current) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socketRef.current.emit('call:signal', {
          conversationId: params.conversationId,
          targetUserId: params.targetUserId,
          signal: {
            type: 'offer',
            sdp: offer,
          },
        });
      }
    },
    [cleanupPeer]
  );

  const handleSignal = useCallback(
    async (payload: { conversationId: string; fromUserId: string; signal: any }) => {
      const signal = payload?.signal;
      const currentCall = activeCallRef.current;
      if (!signal || !currentCall) return;
      if (payload.conversationId !== currentCall.conversationId) return;

      if (!peerRef.current) {
        await createPeerConnection({
          conversationId: currentCall.conversationId,
          targetUserId: currentCall.targetUserId,
          callType: currentCall.callType,
          initiator: false,
        });
      }

      const peer = peerRef.current;
      if (!peer) return;

      if (signal.type === 'offer' && signal.sdp) {
        await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socketRef.current?.emit('call:signal', {
          conversationId: currentCall.conversationId,
          targetUserId: currentCall.targetUserId,
          signal: {
            type: 'answer',
            sdp: answer,
          },
        });
        setActiveCall((prev) => (prev ? { ...prev, phase: 'active' } : prev));
        return;
      }

      if (signal.type === 'answer' && signal.sdp) {
        await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        setActiveCall((prev) => (prev ? { ...prev, phase: 'active' } : prev));
        return;
      }

      if (signal.type === 'ice-candidate' && signal.candidate) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } catch {
          // Ignore transient ICE race errors.
        }
      }
    },
    [createPeerConnection]
  );

  const handleSendMessage = useCallback(async () => {
    const content = newMessage.trim();
    if (!content || !selectedConversationId || !currentUser) return;

    setNewMessage('');
    setError('');

    const sendViaRest = async () => {
      const response = await apiFetch<ChatMessage>(`/conversations/${selectedConversationId}/messages`, token, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      setMessages((prev) => appendMessageIfMissing(prev, response));
      setConversations((prev) =>
        prev.map((item) =>
          item.id === selectedConversationId
            ? {
                ...item,
                lastMessage: { text: response.content, at: response.createdAt, senderId: currentUser.id },
                updatedAt: response.createdAt,
              }
            : item
        )
      );
    };

    if (socketRef.current?.connected) {
      socketRef.current.emit(
        'message:send',
        { conversationId: selectedConversationId, content },
        async (ack: any) => {
          if (ack?.ok && ack?.data) {
            return;
          }
          try {
            await sendViaRest();
          } catch (sendError) {
            setError((sendError as Error).message || 'Unable to send message');
          }
        }
      );
      return;
    }

    try {
      await sendViaRest();
    } catch (sendError) {
      setError((sendError as Error).message || 'Unable to send message');
    }
  }, [currentUser, newMessage, selectedConversationId, token]);

  const startCall = useCallback(
    (callType: 'audio' | 'video') => {
      if (!selectedConversation || !targetParticipant || !socketRef.current) return;
      setError('');

      socketRef.current.emit(
        'call:initiate',
        {
          conversationId: selectedConversation.id,
          targetUserId: targetParticipant.id,
          callType,
        },
        (ack: any) => {
          if (!ack?.ok) {
            setError(ack?.message || 'Unable to start call');
            return;
          }
          setActiveCall({
            conversationId: selectedConversation.id,
            targetUserId: targetParticipant.id,
            callType,
            phase: 'dialing',
          });
        }
      );
    },
    [selectedConversation, targetParticipant]
  );

  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCall || !socketRef.current) return;
    try {
      await startLocalMedia(incomingCall.callType);
      setActiveCall({
        conversationId: incomingCall.conversationId,
        targetUserId: incomingCall.fromUser.id,
        callType: incomingCall.callType,
        phase: 'connecting',
      });
      socketRef.current.emit('call:accept', {
        conversationId: incomingCall.conversationId,
        targetUserId: incomingCall.fromUser.id,
        callType: incomingCall.callType,
      });
      setIncomingCall(null);
      setSelectedConversationId(incomingCall.conversationId);
    } catch {
      setError('Microphone/Camera permission is required for calls');
    }
  }, [incomingCall, startLocalMedia]);

  const declineIncomingCall = useCallback(() => {
    if (!incomingCall || !socketRef.current) return;
    socketRef.current.emit('call:decline', {
      conversationId: incomingCall.conversationId,
      targetUserId: incomingCall.fromUser.id,
    });
    setIncomingCall(null);
  }, [incomingCall]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    ensureDirectConversationFromRouteState();
  }, [ensureDirectConversationFromRouteState]);

  useEffect(() => {
    if (!showNewChatModal) return;
    fetchContacts(contactSearchQuery);
  }, [contactSearchQuery, fetchContacts, showNewChatModal]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    fetchMessages(selectedConversationId);
    socketRef.current?.emit('conversation:join', selectedConversationId);

    return () => {
      socketRef.current?.emit('conversation:leave', selectedConversationId);
    };
  }, [fetchMessages, selectedConversationId]);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    if (!token || !currentUser) return;
    const socketUrl = API_BASE_URL || window.location.origin;
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('message:new', (incoming: ChatMessage) => {
      setConversations((prev) => {
        const exists = prev.some((conversation) => conversation.id === incoming.conversationId);
        const updated = exists
          ? prev.map((conversation) => {
              if (conversation.id !== incoming.conversationId) return conversation;
              return {
                ...conversation,
                unreadCount:
                  selectedConversationIdRef.current === incoming.conversationId || incoming.sender.id === currentUser.id
                    ? 0
                    : conversation.unreadCount + 1,
                lastMessage: {
                  text: incoming.content,
                  at: incoming.createdAt,
                  senderId: incoming.sender.id,
                },
                updatedAt: incoming.createdAt,
              };
            })
          : prev;

        return [...updated].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
      });

      if (incoming.conversationId === selectedConversationIdRef.current) {
        setMessages((prev) => appendMessageIfMissing(prev, { ...incoming, mine: incoming.sender.id === currentUser.id }));
      }
    });

    socket.on('call:incoming', (payload: IncomingCall) => {
      setIncomingCall(payload);
    });

    socket.on('call:accepted', async (payload: any) => {
      const currentCall = activeCallRef.current;
      if (!currentCall) return;
      if (payload.conversationId !== currentCall.conversationId) return;
      try {
        await startLocalMedia(currentCall.callType);
        setActiveCall((prev) => (prev ? { ...prev, phase: 'connecting' } : prev));
        await createPeerConnection({
          conversationId: currentCall.conversationId,
          targetUserId: currentCall.targetUserId,
          callType: currentCall.callType,
          initiator: true,
        });
      } catch {
        setError('Microphone/Camera permission is required for calls');
        endCall(false);
      }
    });

    socket.on('call:declined', () => {
      setError('Call declined');
      endCall(false);
    });

    socket.on('call:ended', () => {
      endCall(false);
    });

    socket.on('call:signal', (payload: any) => {
      void handleSignal(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      cleanupPeer();
      cleanupMedia();
    };
  }, [cleanupMedia, cleanupPeer, createPeerConnection, currentUser, endCall, handleSignal, startLocalMedia, token]);

  useEffect(
    () => () => {
      cleanupPeer();
      cleanupMedia();
    },
    [cleanupMedia, cleanupPeer]
  );

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverscroll = (document.body.style as any).overscrollBehavior;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    (document.body.style as any).overscrollBehavior = 'none';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      (document.body.style as any).overscrollBehavior = previousBodyOverscroll;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  if (!token || !currentUser) {
    return (
      <div className="min-h-screen bg-[#0b132b] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-200 mb-3">Sign in is required to use chat.</p>
          <button
            onClick={() => navigate('/signin')}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-semibold"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b] flex overflow-hidden">
      <div className="w-full lg:flex h-full overflow-hidden">
        <div className={`w-full lg:w-96 border-r border-white/10 h-full overflow-hidden ${selectedConversation ? 'hidden lg:flex' : 'flex'} flex-col`}>
          <div className="p-4 border-b border-white/10 flex-shrink-0">
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 transition-colors text-xs font-semibold"
                title="Back"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            </div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs text-gray-400">Start direct chat with mutual matches only</p>
              <button
                onClick={() => {
                  setShowNewChatModal(true);
                  setContactSearchQuery('');
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/30 text-xs font-semibold"
              >
                <MessageSquarePlus size={14} /> New Chat
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {loadingConversations && (
              <div className="px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Loading conversations...
              </div>
            )}

            {!loadingConversations && filteredConversations.length === 0 && (
              <div className="p-6 text-gray-400 text-sm">No conversations yet.</div>
            )}

            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className={`w-full p-4 border-b border-white/10 hover:bg-white/5 transition text-left ${
                  selectedConversationId === conversation.id ? 'bg-white/10' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={conversation.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                    alt={conversation.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-white font-semibold truncate">{conversation.name}</h3>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-cyan-400 text-black text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center flex-shrink-0">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm truncate">{conversation.lastMessage?.text || 'No messages yet'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedConversation && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="border-b border-white/10 p-4 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedConversationId('')} className="text-cyan-400 hover:text-cyan-300" title="Close conversation">
                  <ArrowLeft size={20} />
                </button>
                <img
                  src={selectedConversation.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                  alt={selectedConversation.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-white font-semibold">{selectedConversation.name}</h2>
                  <p className="text-gray-400 text-xs">{selectedConversation.type === 'group' ? 'Group' : 'Direct'}</p>
                </div>
              </div>

              {selectedConversation.type === 'direct' && targetParticipant && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startCall('audio')}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                    title="Start audio call"
                  >
                    <Phone size={20} />
                  </button>
                  <button
                    onClick={() => startCall('video')}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                    title="Start video call"
                  >
                    <Video size={20} />
                  </button>
                </div>
              )}
            </div>

            {activeCall && (
              <div className="border-b border-cyan-400/30 bg-cyan-500/10 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-cyan-100">
                    {activeCall.phase === 'dialing' && 'Calling...'}
                    {activeCall.phase === 'connecting' && 'Connecting call...'}
                    {activeCall.phase === 'active' && 'In call'}
                  </p>
                  <button onClick={() => endCall(true)} className="px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1">
                    <PhoneOff size={14} /> End
                  </button>
                </div>

                {activeCall.callType === 'video' && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-36 bg-black/60 rounded-lg object-cover" />
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-36 bg-black/60 rounded-lg object-cover" />
                  </div>
                )}
              </div>
            )}

            {error && <div className="text-xs text-red-200 bg-red-500/10 border-b border-red-500/30 px-4 py-2">{error}</div>}

            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              {loadingMessages && (
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Loading messages...
                </div>
              )}

              {!loadingMessages && messages.length === 0 && (
                <p className="text-gray-400 text-sm">No messages yet. Start the conversation.</p>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                      message.mine
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                        : 'bg-white/10 text-gray-300 border border-white/20'
                    }`}
                  >
                    {selectedConversation.type === 'group' && !message.mine && (
                      <p className="text-xs font-bold mb-1 opacity-75">{message.sender.fullName || message.sender.email}</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.mine ? 'text-cyan-100' : 'text-gray-500'}`}>{formatTime(message.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 p-4 bg-white/5">
              <div className="flex items-end gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
                <button onClick={() => void handleSendMessage()} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 p-2 rounded-lg text-white">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {!selectedConversation && (
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Select a conversation</h2>
              <p className="text-gray-400">Choose a chat from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {incomingCall && !activeCall && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#121a32] border border-white/15 rounded-2xl p-5">
            <p className="text-white font-semibold text-lg">Incoming {incomingCall.callType} call</p>
            <p className="text-gray-300 mt-1">{incomingCall.fromUser.fullName || incomingCall.fromUser.email}</p>
            <div className="mt-5 flex gap-3">
              <button onClick={declineIncomingCall} className="flex-1 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white font-semibold">
                Decline
              </button>
              <button onClick={() => void acceptIncomingCall()} className="flex-1 py-2 rounded-lg bg-emerald-500/80 hover:bg-emerald-500 text-white font-semibold">
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewChatModal && (
        <div className="fixed inset-0 z-[75] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#101a36] border border-white/15 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">New Chat</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1.5 rounded-lg text-gray-300 hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={contactSearchQuery}
                onChange={(event) => setContactSearchQuery(event.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {loadingContacts && (
                <div className="text-xs text-gray-400 flex items-center gap-2 px-2 py-2">
                  <Loader2 size={14} className="animate-spin" /> Loading users...
                </div>
              )}

              {!loadingContacts && contacts.length === 0 && (
                <p className="text-sm text-gray-400 px-2 py-3">No users found.</p>
              )}

              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => void createOrOpenDirectConversation(contact.id)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={contact.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                      alt={contact.fullName || contact.email}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-white font-semibold truncate">{contact.fullName || contact.email}</p>
                      <p className="text-xs text-gray-400 truncate">{contact.email}</p>
                    </div>
                    {contact.conversationId && (
                      <span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">
                        Existing
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
