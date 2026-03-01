import { useState, useEffect, useCallback } from 'react';
import { ToastProvider } from './hooks/useToast';
import Navbar from './components/Navbar';
import MobileDrawer from './components/MobileDrawer';
import ScrollDots from './components/ScrollDots';
import HeroSection from './components/HeroSection';
import SearchSection from './components/SearchSection';
import LocationSection from './components/LocationSection';
import SavedSection from './components/SavedSection';
import ChatbotSection from './components/ChatbotSection';
import RoomModal from './components/RoomModal';
import Footer from './components/Footer';
import { ROOMS } from './data/rooms';

// ─── DEFAULT FILTER STATE ──────────────────────────
const DEFAULT_FILTERS = {
    search: '',
    priceMax: 25000,
    dist: '1km',
    room: 'All',
    avail: 'all',
    facs: [],
    rating: 0,
    sort: 'recommended',
};

export default function App() {
    // ── Filter State ──────────────────────────────────
    const [search, setSearch] = useState('');
    const [priceMax, setPriceMax] = useState(25000);
    const [dist, setDist] = useState('1km');
    const [room, setRoom] = useState('All');
    const [avail, setAvail] = useState('all');
    const [facs, setFacs] = useState([]);
    const [rating, setRating] = useState(0);
    const [sort, setSort] = useState('recommended');

    // ── UI State ─────────────────────────────────────
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [modalRoom, setModalRoom] = useState(null);

    // ─── Drawer: close on outside click ──────────────
    useEffect(() => {
        function onClick(e) {
            const drawer = document.getElementById('mobileDrawer');
            const burger = document.getElementById('burgerBtn');
            if (
                drawerOpen &&
                drawer && !drawer.contains(e.target) &&
                burger && !burger.contains(e.target)
            ) {
                setDrawerOpen(false);
            }
        }
        document.addEventListener('click', onClick);
        return () => document.removeEventListener('click', onClick);
    }, [drawerOpen]);

    // ── Modal open/close ──────────────────────────────
    function openModal(id) {
        const r = ROOMS.find(x => x.id === id);
        if (r) setModalRoom(r);
    }
    function closeModal() { setModalRoom(null); }

    // ── Find Rooms button (hero / nav) ────────────────
    function onFindRooms() {
        document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' });
    }

    // ── Apply saved search snapshot ───────────────────
    function onApplySaved(snap) {
        setSearch(snap.search || '');
        setPriceMax(snap.priceMax ?? 25000);
        setDist(snap.dist || '1km');
        setRoom(snap.room || 'All');
        setAvail(snap.avail || 'all');
        setFacs(Array.isArray(snap.facs) ? [...snap.facs] : []);
        setRating(snap.rating ?? 0);
        setSort(snap.sort || 'recommended');
    }

    // ── Apply AI extracted filters ────────────────────
    function onApplyAI(e) {
        if (e.campus) setSearch(e.campus);
        if (e.pMax) setPriceMax(e.pMax);
        if (e.dist) setDist(e.dist);
        if (e.room) setRoom(e.room);
        if (e.avail) setAvail(e.avail);
        if (e.facs?.length) setFacs(prev => [...new Set([...prev, ...e.facs])]);
    }

    const filters = { search, priceMax, dist, room, avail, facs, rating, sort };
    const setters = { setSearch, setPriceMax, setDist, setRoom, setAvail, setFacs, setRating, setSort };

    return (
        <ToastProvider>
            <Navbar
                onFindRooms={onFindRooms}
                onToggleDrawer={() => setDrawerOpen(o => !o)}
            />
            <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
            <ScrollDots />

            <HeroSection onFindRooms={onFindRooms} />
            <SearchSection filters={filters} setters={setters} onOpenModal={openModal} />
            <LocationSection />
            <SavedSection filters={filters} onApplySaved={onApplySaved} />
            <ChatbotSection onApplyAI={onApplyAI} />

            <Footer />

            {modalRoom && <RoomModal room={modalRoom} onClose={closeModal} />}
        </ToastProvider>
    );
}
