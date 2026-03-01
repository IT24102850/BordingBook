import { useState, useRef, useEffect } from 'react';
import { parseNLP, buildReply, facIco } from '../data/rooms';
import { useToast } from '../hooks/useToast';

const SUGG_CHIPS = [
    'Cheap room near SLIIT Malabe with WiFi',
    'Master room under Rs. 15000 with AC',
    'Budget boarding with meals included',
    'Single room 1km from campus',
];

export default function ChatbotSection({ onApplyAI }) {
    const toast = useToast();
    const [messages, setMessages] = useState([
        {
            id: 0, role: 'bot',
            html: `👋 Hi! I'm <strong>BoardingBot SL</strong>. Tell me what you're looking for and I'll find the best boarding houses for you!<br><br>Try: <em>"cheap single room near SLIIT Malabe with WiFi and AC"</em>`
        }
    ]);
    const [input, setInput] = useState('');
    const [aiExtracted, setAiExtracted] = useState(null);
    const msgCounter = useRef(1);
    const chatRef = useRef(null);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    function addMsg(role, html) {
        const id = msgCounter.current++;
        setMessages(prev => [...prev, { id, role, html }]);
        return id;
    }

    function sendMsg(txt) {
        const text = txt || input.trim();
        if (!text) return;
        setInput('');
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        setMessages(prev => [...prev,
        { id: msgCounter.current++, role: 'user', html: text, time },
        { id: msgCounter.current, role: 'bot', html: '<span style="color:var(--text3)">…</span>', time, loading: true }
        ]);
        const loadId = msgCounter.current++;

        setTimeout(() => {
            const e = parseNLP(text);
            const reply = buildReply(e);
            setAiExtracted(e);
            setMessages(prev => prev.map(m =>
                m.loading ? { ...m, html: reply, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }), loading: false } : m
            ));
        }, 600 + Math.random() * 400);
    }

    function getAIRows() {
        if (!aiExtracted) return [];
        const rows = [];
        if (aiExtracted.campus) rows.push(['Campus', aiExtracted.campus]);
        if (aiExtracted.pMax) rows.push(['Max Price', `Rs. ${aiExtracted.pMax.toLocaleString()}/mo`]);
        if (aiExtracted.pMin) rows.push(['Min Price', `Rs. ${aiExtracted.pMin.toLocaleString()}/mo`]);
        if (aiExtracted.dist) rows.push(['Distance', aiExtracted.dist + ' from campus']);
        if (aiExtracted.room) rows.push(['Room Type', aiExtracted.room]);
        aiExtracted.facs.forEach(f => rows.push(['Facility', `${facIco[f] || '✔'} ${f}`]));
        if (aiExtracted.avail) rows.push(['Availability', aiExtracted.avail]);
        return rows;
    }

    function handleApplyAI() {
        if (!aiExtracted) return;
        onApplyAI(aiExtracted);
        document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' });
        toast('✅ AI Filters applied!', 'success');
    }

    const aiRows = getAIRows();

    return (
        <section className="chatbot-section" id="chatbot">
            <div className="container">
                <div className="section-label">🤖 AI Assistant</div>
                <h2 className="section-title">AI <span className="hl">Chatbot</span> Search</h2>
                <p className="section-sub">Type your request naturally and the AI will extract filters for you.</p>

                <div className="chatbot-layout">
                    {/* Chat Window */}
                    <div className="chat-window">
                        <div className="chat-head">
                            <div className="chat-avatar">🤖</div>
                            <div>
                                <div className="chat-name">BoardingBot SL</div>
                                <div className="chat-status">Online – AI Powered</div>
                            </div>
                        </div>

                        <div className="chat-msgs" id="chatMsgs" ref={chatRef}>
                            {messages.map(m => {
                                const time = m.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                return (
                                    <div key={m.id} className={`msg ${m.role}`}>
                                        <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: m.html }} />
                                        <div className="msg-time">{time}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Suggestion chips */}
                        <div className="chat-suggestions">
                            {SUGG_CHIPS.map((chip, i) => (
                                <button key={i} className="sugg-chip" onClick={() => sendMsg(chip)}>{chip}</button>
                            ))}
                        </div>

                        <div className="chat-input-area">
                            <input
                                className="chat-input"
                                id="chatInput"
                                type="text"
                                placeholder="e.g. cheap boarding near SLIIT Malabe with WiFi…"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMsg()}
                            />
                            <button className="btn-send" onClick={() => sendMsg()}>
                                <i className="fa-solid fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>

                    {/* AI Filters Side Panel */}
                    <div className="ai-panel">
                        <div className="ai-panel-title">
                            <span className="star-ico">⭐</span> AI Extracted Filters
                        </div>
                        <div id="aiFilterRows">
                            {aiRows.length === 0 ? (
                                <div className="ai-empty">
                                    Your search filters will appear here after you send a message to BoardingBot.
                                </div>
                            ) : (
                                aiRows.map(([k, v], i) => (
                                    <div key={i} className="ai-row">
                                        <span className="ai-key">{k}</span>
                                        <span className="ai-val">{v}</span>
                                    </div>
                                ))
                            )}
                        </div>
                        {aiRows.length > 0 && (
                            <button className="btn-apply-ai show" id="btnApplyAI" onClick={handleApplyAI}>
                                Apply These Filters
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
