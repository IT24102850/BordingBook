import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Phone, Video, MoreVertical, Search, ArrowLeft, Smile } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  senderType: 'user' | 'owner';
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  name: string;
  type: 'owner' | 'group';
  lastMessage: string;
  unreadCount: number;
  avatar: string;
  messages: Message[];
}

const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    name: 'Mr. Janaka Perera (Owner)',
    type: 'owner',
    lastMessage: 'See you at check-in!',
    unreadCount: 0,
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    messages: [
      { id: '1', sender: 'Mr. Janaka Perera', senderType: 'owner', content: 'Welcome to our boarding house!', timestamp: '10:30 AM', read: true },
      { id: '2', sender: 'You', senderType: 'user', content: 'Thank you! I\'m excited to move in', timestamp: '10:35 AM', read: true },
      { id: '3', sender: 'Mr. Janaka Perera', senderType: 'owner', content: 'Check-in time is 3:00 PM. Please bring your ID and documents.', timestamp: '10:40 AM', read: true },
      { id: '4', sender: 'You', senderType: 'user', content: 'Got it. See you then!', timestamp: '11:00 AM', read: true },
      { id: '5', sender: 'Mr. Janaka Perera', senderType: 'owner', content: 'See you at check-in!', timestamp: '11:05 AM', read: false }
    ]
  },
  {
    id: 'conv2',
    name: 'SLIIT Friends Group',
    type: 'group',
    lastMessage: 'Can\'t wait to move in together!',
    unreadCount: 2,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    messages: [
      { id: '1', sender: 'Ayesha', senderType: 'user', content: 'Hey everyone! Excited to meet you all!', timestamp: '2:00 PM', read: true },
      { id: '2', sender: 'Nuwan', senderType: 'user', content: 'Same here! Can\'t wait to move in together!', timestamp: '2:15 PM', read: false }
    ]
  }
];

export default function Chat() {
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const newMsg: Message = {
        id: Date.now().toString(),
        sender: 'You',
        senderType: 'user',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true
      };
      selectedConversation.messages.push(newMsg);
      setNewMessage('');
    }
  };

  const filteredConversations = mockConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b] flex">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0a1124] to-[#131d3a] border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 lg:hidden"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-white">Messages</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="w-full lg:flex pt-16">
        {/* Conversations List */}
        <div className={`w-full lg:w-96 border-r border-white/10 ${selectedConversation ? 'hidden lg:block' : 'block'}`}>
          {/* Search */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="overflow-y-auto max-h-screen">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 border-b border-white/10 hover:bg-white/5 transition text-left ${
                  selectedConversation?.id === conv.id ? 'bg-white/10' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-white font-semibold truncate">{conv.name}</h3>
                      {conv.unreadCount > 0 && (
                        <span className="bg-cyan-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        {selectedConversation && (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-white/10 p-4 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden text-cyan-400 hover:text-cyan-300"
                >
                  <ArrowLeft size={20} />
                </button>
                <img
                  src={selectedConversation.avatar}
                  alt={selectedConversation.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-white font-semibold">{selectedConversation.name}</h2>
                  <p className="text-gray-400 text-xs">{selectedConversation.type === 'group' ? 'Group' : 'Direct'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                  <Phone size={20} />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                  <Video size={20} />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderType === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                        : 'bg-white/10 text-gray-300 border border-white/20'
                    }`}
                  >
                    {selectedConversation.type === 'group' && msg.senderType !== 'user' && (
                      <p className="text-xs font-bold mb-1 opacity-75">{msg.sender}</p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.senderType === 'user' ? 'text-cyan-200' : 'text-gray-500'}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t border-white/10 p-4 bg-white/5">
              <div className="flex items-end gap-3">
                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                  <Smile size={24} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 p-2 rounded-lg text-white"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedConversation && (
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Select a conversation</h2>
              <p className="text-gray-400">Choose a chat from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
