import { useState } from 'react';
import { ROOMS, campusCoords, roomCoords, haversine, fi } from '../data/rooms';
import { useToast } from '../hooks/useToast';

export default function LocationSection() {
    const toast = useToast();
    const [locSort, setLocSort] = useState('distance');
    const [nearbyRooms, setNearbyRooms] = useState([]);
    const [gpsLabel, setGpsLabel] = useState('Use My Current Location');
    const [gpsLoading, setGpsLoading] = useState(false);
    const [lastArgs, setLastArgs] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    function renderNearby(lat, lng, campus, sort = locSort) {
        setLastArgs([lat, lng, campus]);
        let rooms = ROOMS.map(r => {
            const co = roomCoords[r.id] || { lat: lat + (Math.random() - 0.5) * 0.05, lng: lng + (Math.random() - 0.5) * 0.05 };
            return { ...r, realDist: haversine(lat, lng, co.lat, co.lng) };
        });
        if (campus) rooms = rooms.filter(r => r.campus === campus || r.realDist < 12);
        rooms.sort((a, b) => {
            if (sort === 'price') return a.price - b.price;
            if (sort === 'rating') return b.rating - a.rating;
            return a.realDist - b.realDist;
        });
        setNearbyRooms(rooms.slice(0, 8));
        setMapLoaded(true);
    }

    function handleLocSort(el, val) {
        setLocSort(val);
        if (lastArgs) renderNearby(lastArgs[0], lastArgs[1], lastArgs[2], val);
    }

    function useGPS() {
        setGpsLoading(true);
        setGpsLabel('Getting location…');
        if (!navigator.geolocation) {
            toast('❌ Geolocation not supported', 'error');
            setGpsLabel('Use My Current Location');
            setGpsLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            pos => {
                setGpsLabel('Location found!');
                setGpsLoading(false);
                toast('📍 Location acquired! Showing nearby boarding houses.', 'success');
                renderNearby(pos.coords.latitude, pos.coords.longitude, null, locSort);
            },
            () => {
                toast('⚠️ Could not get location. Showing demo results.', 'error');
                setGpsLabel('Use My Current Location');
                setGpsLoading(false);
                renderNearby(6.9147, 79.9772, null, locSort);
            },
            { timeout: 8000 }
        );
    }

    function pickCampus(e) {
        const val = e.target.value;
        if (!val) return;
        const c = campusCoords[val];
        if (c) {
            toast(`🏫 Showing boarding near ${val}`, 'success');
            renderNearby(c.lat, c.lng, val, locSort);
        }
    }

    return (
        <section className="location-section" id="location">
            <div className="container">
                <div className="section-label">📍 Location-Based</div>
                <h2 className="section-title">Discover Rooms <span className="hl">Near You</span></h2>
                <p className="section-sub">Find boarding houses around your current location or select a campus area.</p>

                <div className="loc-layout">
                    <div className="loc-card">
                        <button className="btn-gps" id="gpsBtn" onClick={useGPS} disabled={gpsLoading}>
                            <i className={`fa-solid ${gpsLoading ? 'fa-spinner fa-spin' : 'fa-location-crosshairs'}`}></i> {gpsLabel}
                        </button>
                        <div className="or-line">OR</div>
                        <div className="control-label">Select Campus</div>
                        <select className="select-campus" id="campusSel" onChange={pickCampus} style={{ marginBottom: '18px' }}>
                            <option value="">-- Choose Campus --</option>
                            <option value="SLIIT Malabe">SLIIT Malabe</option>
                            <option value="SLIIT City">SLIIT City (Colombo)</option>
                            <option value="UOM">UOM – Moratuwa</option>
                            <option value="USJP">USJP – Jayawardenepura</option>
                            <option value="UOC">UOC – Colombo</option>
                            <option value="UOK">UOK – Kandy</option>
                            <option value="NSBM">NSBM Green University</option>
                            <option value="IIT">IIT Colombo</option>
                            <option value="SAITM">SAITM Malabe</option>
                            <option value="Aquinas">Aquinas College</option>
                        </select>

                        <div className="control-label">Sort Nearby By</div>
                        <div className="pill-group" style={{ marginTop: '8px' }}>
                            {['distance', 'price', 'rating'].map(v => (
                                <button
                                    key={v}
                                    className={`pill${locSort === v ? ' active' : ''}`}
                                    onClick={e => handleLocSort(e.currentTarget, v)}
                                >
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div style={{ marginTop: '18px', padding: '12px', background: 'var(--bg4)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '.7rem', color: 'var(--text3)', marginBottom: '5px' }}>ℹ️ Info</div>
                            <p style={{ fontSize: '.78rem', color: 'var(--text2)', lineHeight: '1.55' }}>
                                GPS uses your browser's geolocation. Distances are approximate based on campus coordinates.
                            </p>
                        </div>
                    </div>

                    <div className={`map-area${mapLoaded ? ' loaded' : ''}`} id="mapArea">
                        {!mapLoaded && (
                            <>
                                <div className="map-icon" id="mapIcon">📍</div>
                                <p className="map-placeholder" id="mapPlaceholder">Click "Use My Location" to explore nearby boarding houses</p>
                            </>
                        )}
                        {nearbyRooms.length > 0 && (
                            <div className="nearby-list show" id="nearbyList">
                                {nearbyRooms.map(r => (
                                    <div key={r.id} className="nearby-item">
                                        <div>
                                            <div className="ni-name">{r.name}</div>
                                            <div className="ni-loc">📍 {r.location} · {r.campus}
                                                {r.available && <span className="dist-chip">Available</span>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
                                                {r.facilities.slice(0, 3).map(f => (
                                                    <span key={f} className="dist-chip">{fi(f)}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div className="ni-price">Rs. {r.price.toLocaleString()}/mo</div>
                                            <div className="ni-dist">📏 {r.realDist.toFixed(1)} km away</div>
                                            <div style={{ fontSize: '.74rem', color: '#f59e0b', marginTop: '3px' }}>⭐ {r.rating}</div>
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
