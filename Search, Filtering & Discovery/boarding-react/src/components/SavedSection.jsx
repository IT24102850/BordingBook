import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';

function getSaved() {
    try { return JSON.parse(localStorage.getItem('bbsl_v2') || '[]'); } catch { return []; }
}
function setSaved(a) { localStorage.setItem('bbsl_v2', JSON.stringify(a)); }

function getFilterSummary(filters) {
    const { priceMax, dist, room, avail, facs, rating, search } = filters;
    const t = [];
    if (priceMax < 50000) t.push(`Rs. max ${(priceMax / 1000).toFixed(0)}k`);
    if (dist !== '1km') t.push(`📏 ${dist}`);
    if (room !== 'All') t.push(`🛏️ ${room}`);
    if (rating > 0) t.push(`⭐ ${rating}+`);
    facs.forEach(f => t.push(f));
    if (avail !== 'all') t.push(avail === 'available' ? '✅ Available' : '❌ Occupied');
    if (search) t.push(`🔍 "${search}"`);
    return t;
}

export default function SavedSection({ filters, onApplySaved }) {
    const toast = useToast();
    const [savedList, setSavedList] = useState([]);
    const [saveName, setSaveName] = useState('');

    useEffect(() => {
        setSavedList(getSaved());
    }, []);

    // Observe when section enters viewport to refresh preview
    const tags = getFilterSummary(filters);

    function handleSave() {
        if (!saveName.trim()) { toast('⚠️ Enter a name for this search.', 'error'); return; }
        if (tags.length === 0) { toast('⚠️ No active filters to save.', 'error'); return; }
        const list = getSaved();
        list.push({ id: Date.now(), name: saveName.trim(), tags, snap: { ...filters, facs: [...filters.facs] } });
        setSaved(list);
        setSavedList(list);
        setSaveName('');
        toast(`🔖 "${saveName.trim()}" saved!`, 'success');
    }

    function handleApply(id) {
        const s = savedList.find(x => x.id === id);
        if (!s) return;
        onApplySaved(s.snap);
        document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' });
        toast(`✅ Applied "${s.name}"`, 'success');
    }

    function handleDelete(id) {
        const list = getSaved().filter(s => s.id !== id);
        setSaved(list);
        setSavedList(list);
        toast('🗑️ Deleted.', 'success');
    }

    return (
        <section className="saved-section" id="saved">
            <div className="container">
                <div className="section-label">🔖 Saved Searches</div>
                <h2 className="section-title">Your <span className="hl">Saved Preferences</span></h2>
                <p className="section-sub">Save your search filters and reuse them anytime for faster discovery.</p>

                <div className="saved-layout">
                    {/* Save Current */}
                    <div className="saved-card">
                        <h3>💾 Save Current Search</h3>
                        <p>Save your active filters and search criteria for later.</p>
                        <div className="af-preview" id="afPreview">
                            {tags.length === 0
                                ? <span style={{ fontSize: '.8rem', color: 'var(--text3)' }}>No active filters yet — try searching first</span>
                                : tags.map((t, i) => <span key={i} className="af-chip">{t}</span>)
                            }
                        </div>
                        <div className="save-row">
                            <input
                                className="save-input"
                                id="saveNameInput"
                                type="text"
                                placeholder="Name this search (e.g. Near SLIIT, Budget)"
                                value={saveName}
                                onChange={e => setSaveName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSave()}
                            />
                            <button className="btn-save" onClick={handleSave}>
                                <i className="fa-solid fa-floppy-disk"></i> Save Search
                            </button>
                        </div>
                    </div>

                    {/* Saved List */}
                    <div className="saved-card">
                        <h3>📂 Your Saved Searches</h3>
                        {savedList.length === 0 ? (
                            <div className="no-saved" style={{ display: 'flex' }}>
                                <div className="no-saved-icon">📁</div>
                                <p>No saved searches yet</p>
                                <p>Apply filters and save your search to access it anytime.</p>
                            </div>
                        ) : (
                            <div className="saved-items" id="savedItems">
                                {savedList.map(s => (
                                    <div key={s.id} className="si">
                                        <div className="si-header">
                                            <div className="si-name">📌 {s.name}</div>
                                            <div className="si-actions">
                                                <button className="btn-apply" onClick={() => handleApply(s.id)}>▶ Apply</button>
                                                <button className="btn-del" onClick={() => handleDelete(s.id)}>✕</button>
                                            </div>
                                        </div>
                                        <div className="si-tags">
                                            {s.tags.map((t, i) => <span key={i} className="si-tag">{t}</span>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
