"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import {
    MdAdd, MdDownload, MdDelete, MdPlayArrow, MdPause,
    MdVolumeUp, MdClose, MdArrowBack, MdGraphicEq,
    MdStar, MdLock, MdSpeed, MdFavorite, MdFavoriteBorder,
    MdStop,
} from 'react-icons/md';
import Sidebar from '@/components/Sidebar';

// ── Constants ─────────────────────────────────────────────────────────────────

const MODEL_LABELS = {
    'fishaudio/fish-speech-1.5': 'Fish Speech 1.5',
    'FunAudioLLM/CosyVoice2-0.5B': 'CosyVoice2-0.5B',
    'IndexTeam/IndexTTS-2': 'IndexTTS-2',
};
const VOICE_META = {
    alex: { emoji: '👨', desc: 'Clear & confident' },
    anna: { emoji: '👩', desc: 'Warm & professional' },
    bella: { emoji: '🌸', desc: 'Bright & friendly' },
    benjamin: { emoji: '🧔', desc: 'Steady & reliable' },
    charles: { emoji: '👨‍💼', desc: 'Authoritative' },
    claire: { emoji: '👧', desc: 'Cheerful & clear' },
    david: { emoji: '🎤', desc: 'Deep & smooth' },
    diana: { emoji: '💃', desc: 'Elegant & expressive' },
};

// Favourites stored in localStorage per user
const FAV_KEY = (userId) => `pt_voice_favs_${userId}`;

function loadFavourites(userId) {
    try { return JSON.parse(localStorage.getItem(FAV_KEY(userId)) || '[]'); }
    catch { return []; }
}
function saveFavourites(userId, favs) {
    localStorage.setItem(FAV_KEY(userId), JSON.stringify(favs));
}
// Fav entry shape: { model_id, voice_id, display_name }
function favKey(modelId, voiceId) { return `${modelId}::${voiceId}`; }

// ── VoiceCard — top-level component (must NOT be inside Audio to avoid hook errors) ──

function VoiceCard({ modelId, voiceId, displayName, isSelected, onSelect,
    previewState, onPreview, isFav, onToggleFav }) {
    const meta = VOICE_META[voiceId] || { emoji: '🎙', desc: '' };
    const key = favKey(modelId, voiceId);
    const pState = previewState[key];
    const isPlaying = pState === 'playing';
    const isLoading = pState === 'loading';
    const fav = isFav(modelId, voiceId);

    return (
        <div className={`relative rounded-xl border-2 transition-all ${isSelected ? 'border-amber-400 bg-amber-500/10 shadow-sm' : 'border-gray-200 dark:border-white/10 hover:border-amber-200 bg-gray-50 dark:bg-[#111111]'
            }`}>
            {/* Fav toggle */}
            <button type="button"
                onClick={() => onToggleFav(modelId, voiceId, displayName)}
                className="absolute top-2 right-2 z-10 text-gray-700 dark:text-gray-300 hover:text-amber-400 transition-colors"
                title={fav ? 'Remove from favourites' : 'Add to favourites'}
            >
                {fav
                    ? <MdFavorite className="w-4 h-4 text-amber-400" />
                    : <MdFavoriteBorder className="w-4 h-4" />}
            </button>

            {/* Select */}
            <button type="button" onClick={() => onSelect(modelId, voiceId)}
                className="w-full flex flex-col items-center gap-1 pt-3 pb-1 px-2 text-center"
            >
                <span className="text-2xl">{meta.emoji}</span>
                <span className={`text-[12px] font-bold ${isSelected ? 'text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {displayName || voiceId}
                </span>
                <span className="text-[9px] text-gray-600 dark:text-gray-500 dark:text-gray-400">{meta.desc}</span>
            </button>

            {/* Preview */}
            <div className="px-2 pb-2">
                <button type="button"
                    onClick={() => onPreview(modelId, voiceId)}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] font-semibold transition-all border ${isPlaying ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                            : isLoading ? 'bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-500 dark:text-gray-400 cursor-wait'
                                : 'bg-gray-50 dark:bg-[#111111] border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 hover:text-gray-700 dark:text-gray-300'
                        }`}
                >
                    {isLoading && <div className="w-2.5 h-2.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />}
                    {isPlaying && <MdStop className="w-3 h-3" />}
                    {!isLoading && !isPlaying && <MdPlayArrow className="w-3 h-3" />}
                    <span>{isLoading ? 'Loading...' : isPlaying ? 'Stop' : 'Preview'}</span>
                </button>
            </div>
        </div>
    );
}

// ── CustomAudioPlayer Component ──
function CustomAudioPlayer({ src, onPlayChange }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [showVolume, setShowVolume] = useState(false);

    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [src]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
            if (onPlayChange) onPlayChange(false);
        } else {
            audioRef.current.play().catch(() => {});
            setIsPlaying(true);
            if (onPlayChange) onPlayChange(true);
        }
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (!audioRef.current) return;
        setDuration(audioRef.current.duration);
    };

    const handleSeek = (e) => {
        if (!audioRef.current || duration === 0) return;
        const newTime = parseFloat(e.target.value);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e) => {
        if (!audioRef.current) return;
        const val = parseFloat(e.target.value);
        audioRef.current.volume = val;
        setVolume(val);
    };

    const formatTime = (secs) => {
        if (isNaN(secs)) return '00:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="w-full bg-[#161616] border border-white/5 rounded-xl p-3 flex items-center gap-3 transition-all">
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => {
                    setIsPlaying(false);
                    if (onPlayChange) onPlayChange(false);
                }}
            />
            
            <button
                type="button"
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-500 flex items-center justify-center text-black hover:scale-105 transition-all shrink-0"
            >
                {isPlaying ? <MdPause className="w-4 h-4" /> : <MdPlayArrow className="w-4 h-4" />}
            </button>

            <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono font-medium">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400 outline-none"
                    style={{
                        background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${
                            duration ? (currentTime / duration) * 100 : 0
                        }%, rgba(255,255,255,0.1) ${
                            duration ? (currentTime / duration) * 100 : 0
                        }%, rgba(255,255,255,0.1) 100%)`,
                    }}
                />
            </div>

            <div className="relative flex items-center gap-1.5 shrink-0">
                <button
                    type="button"
                    onClick={() => setShowVolume(!showVolume)}
                    className="p-1 text-gray-500 hover:text-white transition-colors"
                >
                    <MdVolumeUp className="w-3.5 h-3.5" />
                </button>
                {showVolume && (
                    <div className="absolute bottom-6 right-0 bg-[#202020] border border-white/5 p-2 rounded-lg shadow-xl flex items-center z-20">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-16 h-1 accent-amber-400 cursor-pointer"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Audio() {
    const pathname = usePathname();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [audios, setAudios] = useState([]);
    const [scripts, setScripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingScripts, setLoadingScripts] = useState(true);
    const [error, setError] = useState(null);

    const [currentAudio, setCurrentAudio] = useState(null);
    const [audioPlayer, setAudioPlayer] = useState(null);

    const [viewMode, setViewMode] = useState('albums');
    const [selectedAlbumId, setSelectedAlbumId] = useState(null);
    const [isStitching, setIsStitching] = useState(false);

    // Subscription / plan
    const [subscription, setSubscription] = useState(null);
    const [premiumVoices, setPremiumVoices] = useState({});
    const [hasPremiumVoices, setHasPremiumVoices] = useState(false);
    const [voiceoversUsed, setVoiceoversUsed] = useState(0);
    const [loadingPlan, setLoadingPlan] = useState(true);
    const [edgeVoices, setEdgeVoices] = useState([]);
    const [googleVoices, setGoogleVoices] = useState([]);
    const [geminiVoices, setGeminiVoices] = useState([]);
    const [xttsVoices, setXttsVoices] = useState([]);

    // Favourites
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [favourites, setFavourites] = useState(() => loadFavourites(user.id));

    // Preview state per voice: key = `model_id::voice_id` → 'loading' | 'playing' | null
    const [previewState, setPreviewState] = useState({});
    const previewRefs = useRef({});  // key → HTMLAudioElement

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStage, setGenerationStage] = useState('');
    const [chunkProgress, setChunkProgress] = useState(0);
    const [chunkStage, setChunkStage] = useState('');
    const [isPreviewing, setIsPreviewing] = useState(false);  // edge preview
    const [edgePreviewAudio, setEdgePreviewAudio] = useState(null);

    const [formData, setFormData] = useState({
        script_id: '',
        provider: 'edge',
        voice_id: '',
        model_id: '',
        speed: 1.0,
        scene_number: 1,   // SiliconFlow: which scene to generate (1-based)
    });

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');

    // ── Router state ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (location.state?.selectedAlbumId) {
            if (location.state?.openGenerateModal) {
                setFormData(prev => ({ ...prev, script_id: String(location.state.targetScriptId) }));
                setShowModal(true);
            } else {
                setSelectedAlbumId(location.state.selectedAlbumId);
                setViewMode('album-details');
            }
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // ── Boot fetch ────────────────────────────────────────────────────────────
    useEffect(() => {
        fetchAudios();
        fetchEdgeVoices();
        fetchScripts();
        fetchSubscriptionAndPremiumVoices();
        return () => {
            if (audioPlayer) audioPlayer.pause();
            if (edgePreviewAudio) edgePreviewAudio.pause();
            Object.values(previewRefs.current).forEach(a => a?.pause());
        };
    }, []);

    // ── Fetchers ──────────────────────────────────────────────────────────────

    const fetchAudios = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/audios?user_id=${user.id}`);
            const data = await res.json();
            if (data.success) setAudios(data.audios);
            else setError(data.message);
        } catch { setError('Failed to load audio files'); }
        finally { setLoading(false); }
    };

    const fetchEdgeVoices = async () => {
        try {
            const res = await fetch(`${API_URL}/audios/voices`);
            const data = await res.json();
            if (data.success) {
                if (data.voices?.edge?.length) setEdgeVoices(data.voices.edge);
                if (data.voices?.google?.length) setGoogleVoices(data.voices.google);
                if (data.voices?.gemini?.length) setGeminiVoices(data.voices.gemini);
                if (data.voices?.xtts?.length) setXttsVoices(data.voices.xtts);
                if (data.voices?.edge?.length) {
                    setFormData(prev => ({ ...prev, voice_id: data.voices.edge[0].id }));
                }
            }
        } catch { /* non-critical */ }
    };

    const fetchScripts = async () => {
        try {
            setLoadingScripts(true);
            const res = await fetch(`${API_URL}/scripts?user_id=${user.id}`);
            const data = await res.json();
            if (data.success) setScripts(data.scripts.filter(s => s.status === 'completed'));
        } catch { /* non-critical */ }
        finally { setLoadingScripts(false); }
    };

    const fetchSubscriptionAndPremiumVoices = async () => {
        setLoadingPlan(true);
        try {
            const subRes = await fetch(`${API_URL}/plans/my-subscription?user_id=${user.id}`);
            const subData = await subRes.json();
            if (!subData.success || !subData.subscription) { setLoadingPlan(false); return; }

            const sub = subData.subscription;
            setSubscription(sub);
            setVoiceoversUsed(sub.used_voiceovers || 0);

            if (parseInt(sub.max_voiceovers || 0) > 0 && sub.plan_id) {
                const vRes = await fetch(`${API_URL}/voices/available?plan_id=${sub.plan_id}`);
                const vData = await vRes.json();
                if (vData.success && vData.has_premium) {
                    setPremiumVoices(vData.voices || {});
                    setHasPremiumVoices(true);
                }
            }
        } catch (e) { console.error('Failed to load subscription/voices:', e); }
        finally { setLoadingPlan(false); }
    };

    // ── Favourites ────────────────────────────────────────────────────────────

    const isFav = (modelId, voiceId) =>
        favourites.some(f => f.model_id === modelId && f.voice_id === voiceId);

    const toggleFav = (modelId, voiceId, displayName) => {
        setFavourites(prev => {
            const already = prev.some(f => f.model_id === modelId && f.voice_id === voiceId);
            const next = already
                ? prev.filter(f => !(f.model_id === modelId && f.voice_id === voiceId))
                : [...prev, { model_id: modelId, voice_id: voiceId, display_name: displayName }];
            saveFavourites(user.id, next);
            return next;
        });
    };

    // ── Per-voice preview (premium) ───────────────────────────────────────────

    const stopAllPreviews = () => {
        Object.values(previewRefs.current).forEach(a => { if (a) { a.pause(); a.currentTime = 0; } });
        setPreviewState({});
    };

    // ── Per-voice preview (SiliconFlow called directly from browser) ─────────
    // Server can't resolve api.siliconflow.com DNS — browser calls it directly.
    const SILICON_API_KEY = 'sk-tlxbewvvaojyakeibuonxxddrtlrpkafjrjavtvfpnofcmfe';
    const PREVIEW_PHRASES = {
        alex: "Hey, I'm Alex. Clear, confident, and ready to deliver your message.",
        anna: "Hi there, I'm Anna. Warm, professional, and happy to help.",
        bella: "Hello! Bella here — bright, friendly, and full of energy.",
        benjamin: "Good day. Benjamin speaking. Steady, reliable, and dependable.",
        charles: "Charles here. Authoritative, articulate, and precise in every word.",
        claire: "Hi! I'm Claire — cheerful, approachable, and always crystal clear.",
        david: "David here. Deep, smooth, and built for narration and storytelling.",
        diana: "Hello, I'm Diana. Elegant, expressive, and dynamic in every line.",
    };
    // CosyVoice2 narration style prefix — same as what generation uses
    const COSY_PREFIX = "Speak in a calm, engaging storytelling narrator voice. Pace yourself naturally with clear diction.<|endofprompt|>";

    const [previewError, setPreviewError] = useState('');

    const handleVoicePreview = async (modelId, voiceId) => {
        const key = favKey(modelId, voiceId);

        // Stop if already playing
        if (previewState[key] === 'playing') {
            const a = previewRefs.current[key];
            if (a) { a.pause(); a.currentTime = 0; }
            setPreviewState(prev => ({ ...prev, [key]: null }));
            return;
        }

        stopAllPreviews();
        setPreviewError('');
        setPreviewState(prev => ({ ...prev, [key]: 'loading' }));

        try {
            const phrase = PREVIEW_PHRASES[voiceId] || `Hello, I am ${voiceId}. This is a preview of my voice.`;
            const voiceRef = `${modelId}:${voiceId}`;
            // Apply narration prefix for CosyVoice2 — same as generation
            const input = modelId.includes('CosyVoice2') ? COSY_PREFIX + phrase : phrase;

            const res = await fetch('https://api.siliconflow.com/v1/audio/speech', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SILICON_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: modelId,
                    input,
                    voice: voiceRef,
                    stream: false,
                }),
            });

            if (!res.ok) {
                let msg = `Preview failed (${res.status})`;
                try {
                    const ct = res.headers.get('content-type') || '';
                    if (ct.includes('application/json')) {
                        const err = await res.json();
                        msg = err.message || err.error || msg;
                    } else {
                        msg = (await res.text()).slice(0, 200) || msg;
                    }
                } catch { /* keep default msg */ }
                throw new Error(msg);
            }

            const blob = await res.blob();
            if (blob.size === 0) throw new Error('Empty audio returned from SiliconFlow.');

            const url = URL.createObjectURL(blob);
            const audio = new window.Audio(url);
            previewRefs.current[key] = audio;

            audio.onended = () => {
                setPreviewState(prev => ({ ...prev, [key]: null }));
                URL.revokeObjectURL(url);
            };
            audio.onerror = () => {
                setPreviewState(prev => ({ ...prev, [key]: null }));
                URL.revokeObjectURL(url);
                setPreviewError('Audio playback failed — try a different voice.');
                setTimeout(() => setPreviewError(''), 4000);
            };

            audio.play().catch(playErr => {
                setPreviewState(prev => ({ ...prev, [key]: null }));
                setPreviewError(`Playback blocked: ${playErr.message}`);
                setTimeout(() => setPreviewError(''), 4000);
            });
            setPreviewState(prev => ({ ...prev, [key]: 'playing' }));

        } catch (e) {
            setPreviewState(prev => ({ ...prev, [key]: null }));
            setPreviewError(e.message || 'Preview failed. Check console for details.');
            console.error('[VoicePreview]', e);
            setTimeout(() => setPreviewError(''), 5000);
        }
    };

    // ── Edge voice preview ────────────────────────────────────────────────────

    const handlePreviewVoice = async (provider, voiceId) => {
        if (!voiceId) { alert('Please select a voice to preview.'); return; }
        if (audioPlayer) { audioPlayer.pause(); setCurrentAudio(null); }
        try {
            setIsPreviewing(true);
            const res = await fetch(`${API_URL}/audios/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider, voice_id: voiceId, user_id: user.id,
                    text: 'This is a sample of the audio voice that you have chosen. How does it sound?',
                }),
            });
            const data = await res.json();
            if (data.success && data.url) {
                if (edgePreviewAudio) edgePreviewAudio.pause();
                const a = new window.Audio(data.url);
                a.onended = () => setIsPreviewing(false);
                a.play();
                setEdgePreviewAudio(a);
            } else {
                alert('Error generating preview: ' + data.message);
                setIsPreviewing(false);
            }
        } catch {
            alert('Failed to preview voice.');
            setIsPreviewing(false);
        }
    };

    // ── Provider switch ───────────────────────────────────────────────────────

    const switchToEdge = () => {
        stopAllPreviews();
        setFormData(prev => ({
            ...prev, provider: 'edge',
            voice_id: edgeVoices[0]?.id || '', model_id: '',
        }));
    };

    const switchToPookieEdge = () => {
        stopAllPreviews();
        setFormData(prev => ({
            ...prev, provider: 'pookie-edge',
            voice_id: edgeVoices[0]?.id || '', model_id: '',
        }));
    };

    const switchToGoogle = () => {
        stopAllPreviews();
        setFormData(prev => ({
            ...prev, provider: 'google',
            voice_id: googleVoices[0]?.id || '', model_id: '',
        }));
    };

    const switchToPookieGoogle = () => {
        stopAllPreviews();
        setFormData(prev => ({
            ...prev, provider: 'pookie-google',
            voice_id: googleVoices[0]?.id || '', model_id: '',
        }));
    };

    const switchToGemini = () => {
        stopAllPreviews();
        setFormData(prev => ({
            ...prev, provider: 'gemini',
            voice_id: geminiVoices[0]?.id || '', model_id: '',
        }));
    };

    const switchToXtts = () => {
        stopAllPreviews();
        setFormData(prev => ({
            ...prev, provider: 'xtts',
            voice_id: xttsVoices[0]?.id || 'Claribel Dervla', model_id: '',
        }));
    };

    const selectPremiumVoice = (modelId, voiceId) => {
        setFormData(prev => ({ ...prev, provider: 'siliconflow', model_id: modelId, voice_id: voiceId }));
    };

    const switchToPremium = () => {
        // Auto-select first fav if any, else first available
        if (favourites.length > 0) {
            const fav = favourites[0];
            // Check it's still in available voices
            if (premiumVoices[fav.model_id]?.some(v => v.voice_id === fav.voice_id)) {
                selectPremiumVoice(fav.model_id, fav.voice_id);
                return;
            }
        }
        const firstModel = Object.keys(premiumVoices)[0];
        const firstVoice = premiumVoices[firstModel]?.[0]?.voice_id;
        if (firstModel && firstVoice) selectPremiumVoice(firstModel, firstVoice);
    };

    // ── Playback (existing audio items) ──────────────────────────────────────

    const handlePlayAudio = (audio) => {
        if (edgePreviewAudio) { edgePreviewAudio.pause(); setIsPreviewing(false); }
        stopAllPreviews();
        if (currentAudio?.id === audio.id && currentAudio.isPlaying) {
            audioPlayer.pause();
            setCurrentAudio({ ...currentAudio, isPlaying: false });
        } else {
            if (audioPlayer) audioPlayer.pause();
            const player = new window.Audio(audio.url);
            player.onended = () => setCurrentAudio(prev => ({ ...prev, isPlaying: false }));
            player.play();
            setAudioPlayer(player);
            setCurrentAudio({ id: audio.id, url: audio.url, isPlaying: true });
        }
    };

    const handleDelete = async (audioId) => {
        if (!window.confirm('Delete this audio generation?')) return;
        setAudios(audios.filter(a => a.id !== audioId));
    };

    const handleDownloadAudio = async (url, filename) => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const bUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = bUrl; link.download = filename || 'audio.mp3';
            document.body.appendChild(link); link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(bUrl);
        } catch { window.open(url, '_blank'); }
    };

    const handleStitchAudios = async (voiceName) => {
        if (!selectedAlbumId) return;
        setIsStitching(true);
        try {
            const res = await fetch(`${API_URL}/scripts/${selectedAlbumId}/stitch-audios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, voice: voiceName }),
            });
            const data = await res.json();
            if (data.success) {
                alert('Audios merged successfully into a single Full Story track!');
                fetchAudios();
            } else {
                alert('Stitching failed: ' + data.message);
            }
        } catch (err) {
            alert('Stitching failed due to network error.');
        } finally {
            setIsStitching(false);
        }
    };

    // ── Generate ──────────────────────────────────────────────────────────────

    const handleGenerateAudio = async (e) => {
        e.preventDefault();
        if (!formData.script_id) { alert('Please select a script!'); return; }

        // For SiliconFlow: only block if no quota AND no existing audio for this script
        // (remaining scenes after the first are free — backend handles this)
        if (formData.provider === 'siliconflow' && remainingVoiceovers <= 0) {
            // Check if they've already generated scene 1 for this script (free continuation)
            const scriptHasAudio = audios.some(
                a => String(a.script_id) === String(formData.script_id) && a.provider === 'siliconflow'
            );
            if (!scriptHasAudio) {
                alert(`You have used all ${maxVoiceovers} premium voiceovers on your plan.`);
                return;
            }
        }

        stopAllPreviews();

        if (formData.provider === 'siliconflow' && formData.scene_number === 'all') {
            const selectedScript = scripts.find(s => String(s.id) === String(formData.script_id));
            const sceneCount = selectedScript?.content?.scenes?.length || 0;
            if (sceneCount === 0) {
                alert('No scenes found in this script.');
                return;
            }

            try {
                setIsGenerating(true);
                for (let currentScene = 1; currentScene <= sceneCount; currentScene++) {
                    setGenerationProgress(Math.round(((currentScene - 1) / sceneCount) * 100));
                    setGenerationStage(`Processing scene ${currentScene} of ${sceneCount}...`);
                    setChunkProgress(0);
                    setChunkStage(`Initializing scene ${currentScene}`);

                    const payload = {
                        user_id: user.id,
                        provider: formData.provider,
                        voice_id: formData.voice_id,
                        speed: parseFloat(formData.speed),
                        model_id: formData.model_id,
                        scene_number: currentScene
                    };

                    const response = await fetch(`${API_URL}/scripts/${formData.script_id}/audio`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '', finalAudio = null, hitError = false;

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n\n');
                        buffer = lines.pop();
                        for (const line of lines) {
                            if (!line.startsWith('data: ')) continue;
                            try {
                                const event = JSON.parse(line.replace('data: ', ''));
                                setChunkProgress(event.progress !== undefined ? event.progress : 0);
                                setChunkStage(event.stage || '');
                                if (event.error) {
                                    hitError = true;
                                    throw new Error(event.error);
                                }
                                if (event.done && event.audio) finalAudio = event.audio;
                            } catch (e) {
                                if (e.message && e.message.includes('SiliconFlow error')) {
                                    throw e;
                                }
                            }
                        }
                    }

                    if (hitError || !finalAudio) {
                        throw new Error(`Scene ${currentScene} failed to generate.`);
                    }

                    if (finalAudio && finalAudio.credit_deducted) {
                        setVoiceoversUsed(prev => prev + 1);
                    }
                }

                setGenerationProgress(100);
                setGenerationStage('All scenes generated successfully!');
                setChunkProgress(100);
                setChunkStage('Complete!');
                
                setTimeout(() => {
                    setShowModal(false);
                    fetchAudios();
                    fetchSubscriptionAndPremiumVoices();
                    if (viewMode === 'albums') {
                        setSelectedAlbumId(parseInt(formData.script_id));
                        setViewMode('album-details');
                    }
                }, 600);

            } catch (err) {
                setGenerationProgress(0);
                setGenerationStage('');
                alert('Generation failed: ' + err.message);
            } finally {
                setIsGenerating(false);
            }
            return;
        }

        try {
            setIsGenerating(true);
            setGenerationProgress(0);
            setGenerationStage('Initializing...');
            setChunkProgress(0);
            setChunkStage('');

            const payload = {
                user_id: user.id,
                provider: formData.provider,
                voice_id: formData.voice_id,
                speed: parseFloat(formData.speed),
                ...(formData.provider === 'siliconflow' && {
                    model_id: formData.model_id,
                    scene_number: parseInt(formData.scene_number),
                }),
            };

            const response = await fetch(`${API_URL}/scripts/${formData.script_id}/audio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '', finalAudio = null, hitError = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop();
                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    try {
                        const event = JSON.parse(line.replace('data: ', ''));
                        setGenerationProgress(event.progress !== undefined ? event.progress : 0);
                        setGenerationStage(event.stage || '');
                        if (event.chunk_progress !== undefined) {
                            setChunkProgress(event.chunk_progress);
                        }
                        if (event.chunk_stage !== undefined) {
                            setChunkStage(event.chunk_stage);
                        }
                        if (event.error) { hitError = true; alert('Audio Error: ' + event.error); }
                        if (event.done && event.audio) finalAudio = event.audio;
                    } catch { /* ignore */ }
                }
            }

            if (finalAudio && !hitError) {
                setGenerationProgress(100);
                setGenerationStage('Complete!');
                setChunkProgress(100);
                setChunkStage('Complete!');
                if (formData.provider === 'siliconflow' && finalAudio.credit_deducted) {
                    setVoiceoversUsed(prev => prev + 1);
                }
                setTimeout(() => {
                    setShowModal(false);
                    fetchAudios();
                    fetchSubscriptionAndPremiumVoices();
                    if (viewMode === 'albums') {
                        setSelectedAlbumId(parseInt(formData.script_id));
                        setViewMode('album-details');
                    }
                }, 600);
            } else if (!hitError) {
                setGenerationProgress(0); setGenerationStage('');
                setChunkProgress(0); setChunkStage('');
                alert('Generation completed but no audio returned. Check backend logs.');
            }
        } catch (err) {
            setGenerationProgress(0); setGenerationStage('');
            alert('Network error during audio generation: ' + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // ── Derived ───────────────────────────────────────────────────────────────

    const maxVoiceovers = parseInt(subscription?.max_voiceovers || 0);
    const remainingVoiceovers = Math.max(0, maxVoiceovers - voiceoversUsed);
    const canUsePremium = hasPremiumVoices && remainingVoiceovers > 0;

    const scriptsWithAudios = scripts.map(s => ({
        ...s, audios: audios.filter(a => String(a.script_id) === String(s.id)),
    })).filter(s => s.audios.length > 0);

    const activeAlbum = selectedAlbumId ? scripts.find(s => s.id === selectedAlbumId) : null;
    const activeAlbumAudios = activeAlbum
        ? audios.filter(a => String(a.script_id) === String(activeAlbum.id))
        : [];

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex h-screen bg-white dark:bg-[#0a0a0a]">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto relative pb-20">

                {/* Header */}
                <div className="bg-gray-50 dark:bg-[#111111] border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                {viewMode === 'album-details' && (
                                    <button onClick={() => setViewMode('albums')} className="p-2 bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-full transition-colors shrink-0">
                                        <MdArrowBack className="w-5 h-5" />
                                    </button>
                                )}
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {viewMode === 'albums' ? 'Audio Folders' : activeAlbum?.title || 'Story Audio'}
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                        {viewMode === 'albums' ? 'Audio generations grouped by your stories' : `${activeAlbumAudios.length} Rendered Narratives`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {hasPremiumVoices && !loadingPlan && (
                                    <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${remainingVoiceovers > 0
                                            ? 'bg-amber-500/10 border-amber-200 text-amber-300'
                                            : 'bg-gray-200 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-500 dark:text-gray-400'
                                        }`}>
                                        <MdStar className="w-3.5 h-3.5" />
                                        {remainingVoiceovers} / {maxVoiceovers} premium left
                                    </div>
                                )}
                                {/* Merge Scenes Button */}
                                {viewMode === 'album-details' && (() => {
                                    const mergeableAudios = activeAlbumAudios.filter(
                                        a => a.provider === 'siliconflow' && a.voice_name?.includes(' - Scene ')
                                    );
                                    const voiceGroups = {};
                                    mergeableAudios.forEach(a => {
                                        const baseVoice = a.voice_name.split(' - ')[0];
                                        if (!voiceGroups[baseVoice]) voiceGroups[baseVoice] = [];
                                        voiceGroups[baseVoice].push(a);
                                    });
                                    const mergeableVoices = Object.keys(voiceGroups).filter(v => voiceGroups[v].length >= 2);
                                    
                                    return mergeableVoices.map(voice => (
                                        <button
                                            key={voice}
                                            disabled={isStitching}
                                            onClick={() => handleStitchAudios(voice)}
                                            className="bg-amber-400 hover:bg-amber-500 text-black px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                                        >
                                            <MdGraphicEq className="w-4 h-4" />
                                            {isStitching ? 'Merging...' : `Merge ${voice} Scenes`}
                                        </button>
                                    ));
                                })()}

                                <button
                                    onClick={() => setShowModal(true)}
                                    className="bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 justify-center"
                                >
                                    <MdAdd className="w-4 h-4" />
                                    <span className="hidden sm:inline">Render Audio</span>
                                    <span className="sm:hidden">Generate</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content (albums / album-detail — unchanged from original) */}
                <div className="p-4 sm:p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading library...</p>
                        </div>
                    ) : audios.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 dark:bg-[#111111] rounded-xl border border-dashed border-white/20 shadow-sm max-w-2xl mx-auto flex flex-col items-center">
                            <MdGraphicEq className="w-16 h-16 text-gray-700 dark:text-gray-300 mb-3" />
                            <h3 className="text-lg font-bold text-gray-200">No Audio Renders Yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mt-2 mb-6">Instantly narrate your scripted stories using expressive ultra-realistic voice profiles!</p>
                            <button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">Generate First Narration</button>
                        </div>
                    ) : viewMode === 'albums' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
                            {scriptsWithAudios.map(album => (
                                <div key={album.id} onClick={() => { setSelectedAlbumId(album.id); setViewMode('album-details'); }}
                                    className="bg-gray-50 dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 hover:border-purple-300 hover:shadow-lg transition-all overflow-hidden cursor-pointer group flex flex-col">
                                    <div className="aspect-video bg-white dark:bg-[#0a0a0a] border-b border-white/5 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-500/20 transition-all">
                                            <MdGraphicEq className="w-8 h-8 text-red-400 group-hover:text-red-500" />
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{album.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                            <MdVolumeUp className="w-4 h-4 text-gray-600 dark:text-gray-500 dark:text-gray-400" />
                                            <span>{album.audios.length} Variations</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {activeAlbumAudios.map(audio => (
                                <div key={audio.id} className={`bg-gray-50 dark:bg-[#111111] rounded-xl border transition-all p-4 ${currentAudio?.id === audio.id ? 'border-purple-300 shadow-md ring-1 ring-purple-100' : 'border-gray-200 dark:border-white/10 hover:border-white/20'}`}>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1 min-w-0 flex flex-col justify-between pt-1">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1 truncate pr-2">{audio.script_title || 'Untitled Script'}</h3>
                                                    <div className="flex gap-1 flex-shrink-0 -mt-1 -mr-2 text-gray-600 dark:text-gray-500 dark:text-gray-400">
                                                        <button onClick={() => handleDownloadAudio(audio.url, `${activeAlbum?.title}_${audio.id}.mp3`)} className="p-1.5 hover:bg-gray-200 dark:bg-white/5 hover:text-gray-700 dark:text-gray-300 rounded transition-colors"><MdDownload className="w-5 h-5" /></button>
                                                        <button onClick={() => handleDelete(audio.id)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition-colors"><MdDelete className="w-5 h-5" /></button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-xs font-medium mt-1">
                                                    <span className="text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">{audio.niche_name || 'General'}</span>
                                                    <span className="text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-white/5 px-2 py-0.5 rounded-full flex items-center gap-1"><MdVolumeUp className="w-3 h-3" /> {audio.voice_name}</span>
                                                    {audio.provider === 'siliconflow' && <span className="text-amber-300 bg-amber-500/10 border border-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1"><MdStar className="w-3 h-3" /> Premium</span>}
                                                </div>
                                            </div>
                                            <div className="mt-4 w-full">
                                                <CustomAudioPlayer
                                                    src={audio.url}
                                                    onPlayChange={(playing) => {
                                                        if (playing) {
                                                            setCurrentAudio({ id: audio.id, url: audio.url, isPlaying: true });
                                                        } else {
                                                            setCurrentAudio(prev => prev?.id === audio.id ? { ...prev, isPlaying: false } : prev);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="mt-2 text-[11px] text-gray-600 dark:text-gray-500 dark:text-gray-400 flex justify-between">
                                                <span>{new Date(audio.created_at).toLocaleString()}</span>
                                                <span>{audio.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════
                GENERATE AUDIO MODAL
            ══════════════════════════════════════════════════ */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-gray-50 dark:bg-[#111111] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Generate Audio</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Render a script into lifelike speech.</p>
                                </div>
                                <button onClick={() => { setShowModal(false); stopAllPreviews(); }} className="p-2 bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 rounded-full text-gray-500 dark:text-gray-400">
                                    <MdClose className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleGenerateAudio} className="space-y-5">

                                {/* Script */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Target Script</label>
                                    <select required value={formData.script_id}
                                        onChange={e => setFormData({ ...formData, script_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-gray-50 dark:bg-[#111111] transition-colors">
                                        <option value="">-- Choose a Completed Script --</option>
                                        {scripts.map(s => <option key={s.id} value={s.id}>{s.title} ({s.niche_name || 'General'})</option>)}
                                    </select>
                                    {scripts.length === 0 && <p className="text-xs text-red-500 mt-1">No completed scripts found. Go generate one first!</p>}
                                </div>

                                {/* Engine picker */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Text-to-Speech Engine</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <button type="button" onClick={switchToEdge}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${formData.provider === 'edge' ? 'border-purple-600 bg-purple-900/20' : 'border-gray-200 dark:border-white/10 hover:border-white/20 bg-[#111]'}`}>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">Edge TTS</div>
                                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Microsoft Neural · Free</div>
                                        </button>

                                        <button type="button" onClick={switchToPookieEdge}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${formData.provider === 'pookie-edge' ? 'border-purple-600 bg-purple-900/20' : 'border-gray-200 dark:border-white/10 hover:border-white/20 bg-[#111]'}`}>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">Pookie Edge</div>
                                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Humanized Edge · Free</div>
                                        </button>

                                        <button type="button" onClick={switchToGoogle}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${formData.provider === 'google' ? 'border-blue-600 bg-blue-900/20' : 'border-gray-200 dark:border-white/10 hover:border-white/20 bg-[#111]'}`}>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">Google TTS</div>
                                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Standard Voice · Free</div>
                                        </button>

                                        <button type="button" onClick={switchToPookieGoogle}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${formData.provider === 'pookie-google' ? 'border-blue-600 bg-blue-900/20' : 'border-gray-200 dark:border-white/10 hover:border-white/20 bg-[#111]'}`}>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">Pookie GG</div>
                                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Humanized Google · Free</div>
                                        </button>

                                        <button type="button" onClick={switchToGemini}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${formData.provider === 'gemini' ? 'border-teal-600 bg-teal-900/20' : 'border-gray-200 dark:border-white/10 hover:border-white/20 bg-[#111]'}`}>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">Gemini TTS</div>
                                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Google GenAI · Free</div>
                                        </button>

                                        {xttsVoices.length > 0 && (
                                            <button type="button" onClick={switchToXtts}
                                                className={`p-3 rounded-xl border-2 text-left transition-all ${formData.provider === 'xtts' ? 'border-indigo-600 bg-indigo-900/20' : 'border-gray-200 dark:border-white/10 hover:border-white/20 bg-[#111]'}`}>
                                                <div className="font-bold text-sm text-gray-900 dark:text-white">XTTS v2</div>
                                                <div className="text-[10px] text-indigo-400 mt-0.5">Local Server · GPU</div>
                                            </button>
                                        )}

                                        <button type="button"
                                            onClick={() => { if (canUsePremium) switchToPremium(); }}
                                            disabled={!hasPremiumVoices}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${!hasPremiumVoices ? 'border-white/5 bg-white dark:bg-[#0a0a0a] opacity-60 cursor-not-allowed'
                                                    : remainingVoiceovers <= 0 ? 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] cursor-not-allowed'
                                                        : formData.provider === 'siliconflow' ? 'border-amber-400 bg-amber-500/10'
                                                            : 'border-gray-200 dark:border-white/10 hover:border-amber-300 bg-[#111]'
                                                }`}>
                                            <div className="flex items-center gap-1">
                                                <MdStar className={`w-3.5 h-3.5 ${hasPremiumVoices ? 'text-amber-500' : 'text-gray-700 dark:text-gray-300'}`} />
                                                <span className="font-bold text-sm text-gray-900 dark:text-white">Premium</span>
                                                {!hasPremiumVoices && <MdLock className="w-3 h-3 text-gray-600 dark:text-gray-500 dark:text-gray-400 ml-auto" />}
                                            </div>
                                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                {!hasPremiumVoices ? 'Upgrade plan to unlock' : remainingVoiceovers <= 0 ? 'Quota exhausted' : `SiliconFlow · ${remainingVoiceovers} left`}
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* ── Edge voice picker ── */}
                                {(formData.provider === 'edge' || formData.provider === 'pookie-edge') && (
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Select Voice</label>
                                            <button type="button" onClick={() => handlePreviewVoice(formData.provider, formData.voice_id)} disabled={isPreviewing}
                                                className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 bg-purple-900/30 px-2 py-1 rounded disabled:opacity-50">
                                                {isPreviewing ? <MdPause className="w-3 h-3" /> : <MdPlayArrow className="w-3 h-3" />}
                                                {isPreviewing ? 'Playing...' : 'Preview'}
                                            </button>
                                        </div>
                                        <select required value={formData.voice_id}
                                            onChange={e => setFormData({ ...formData, voice_id: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-gray-50 dark:bg-[#111111] transition-colors">
                                            {edgeVoices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {/* ── Google voice picker ── */}
                                {(formData.provider === 'google' || formData.provider === 'pookie-google') && (
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Select Voice</label>
                                            <button type="button" onClick={() => handlePreviewVoice(formData.provider, formData.voice_id)} disabled={isPreviewing}
                                                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-900/30 px-2 py-1 rounded disabled:opacity-50">
                                                {isPreviewing ? <MdPause className="w-3 h-3" /> : <MdPlayArrow className="w-3 h-3" />}
                                                {isPreviewing ? 'Playing...' : 'Preview'}
                                            </button>
                                        </div>
                                        <select required value={formData.voice_id}
                                            onChange={e => setFormData({ ...formData, voice_id: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-gray-50 dark:bg-[#111111] transition-colors">
                                            {googleVoices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                        </select>
                                    </div>
                                )}


                                {/* ── Gemini voice picker ── */}
                                {formData.provider === 'gemini' && (
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Select Voice</label>
                                            <button type="button" onClick={() => handlePreviewVoice('gemini', formData.voice_id)} disabled={isPreviewing}
                                                className="text-xs font-medium text-teal-400 hover:text-teal-300 flex items-center gap-1 bg-teal-900/30 px-2 py-1 rounded disabled:opacity-50">
                                                {isPreviewing ? <MdPause className="w-3 h-3" /> : <MdPlayArrow className="w-3 h-3" />}
                                                {isPreviewing ? 'Playing...' : 'Preview'}
                                            </button>
                                        </div>
                                        <select required value={formData.voice_id}
                                            onChange={e => setFormData({ ...formData, voice_id: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-gray-900 focus:bg-gray-50 dark:bg-[#111111] transition-colors">
                                            {geminiVoices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {/* ── XTTS voice picker ── */}
                                {formData.provider === 'xtts' && (
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Select Voice</label>
                                            <button type="button" onClick={() => handlePreviewVoice('xtts', formData.voice_id)} disabled={isPreviewing}
                                                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-900/30 px-2 py-1 rounded disabled:opacity-50">
                                                {isPreviewing ? <MdPause className="w-3 h-3" /> : <MdPlayArrow className="w-3 h-3" />}
                                                {isPreviewing ? 'Playing...' : 'Preview'}
                                            </button>
                                        </div>
                                        <select required value={formData.voice_id}
                                            onChange={e => setFormData({ ...formData, voice_id: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-900 focus:bg-gray-50 dark:bg-[#111111] transition-colors">
                                            {xttsVoices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {/* ── Premium voice picker ── */}
                                {formData.provider === 'siliconflow' && (
                                    <div className="space-y-4">

                                        {/* Quota */}
                                        <div className="flex items-center justify-between px-3 py-2 bg-amber-500/10 border border-amber-200 rounded-lg">
                                            <span className="text-xs font-medium text-amber-400 flex items-center gap-1"><MdStar className="w-3.5 h-3.5" /> Premium Voiceovers</span>
                                            <span className="text-xs font-bold text-amber-900">{remainingVoiceovers} / {maxVoiceovers} remaining</span>
                                        </div>

                                        {/* Preview error */}
                                        {previewError && (
                                            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-start gap-1.5">
                                                <span className="flex-shrink-0 mt-0.5">⚠</span>
                                                <span>{previewError}</span>
                                            </div>
                                        )}

                                        {/* ── Favourites section ── */}
                                        {favourites.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                    <MdFavorite className="w-3.5 h-3.5 text-amber-400" /> Favourites
                                                </p>
                                                <div className="grid grid-cols-4 gap-2 mb-1">
                                                    {favourites
                                                        .filter(f => premiumVoices[f.model_id]?.some(v => v.voice_id === f.voice_id))
                                                        .map(f => (
                                                            <VoiceCard
                                                                key={favKey(f.model_id, f.voice_id)}
                                                                modelId={f.model_id}
                                                                voiceId={f.voice_id}
                                                                displayName={f.display_name}
                                                                isSelected={formData.model_id === f.model_id && formData.voice_id === f.voice_id}
                                                                onSelect={selectPremiumVoice}
                                                                previewState={previewState}
                                                                onPreview={handleVoicePreview}
                                                                isFav={isFav}
                                                                onToggleFav={toggleFav}
                                                            />
                                                        ))}
                                                </div>
                                                <div className="border-t border-dashed border-gray-200 dark:border-white/10 my-3" />
                                            </div>
                                        )}

                                        {/* ── All voices by model ── */}
                                        {Object.entries(premiumVoices).map(([modelId, modelVoices]) => (
                                            <div key={modelId}>
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                    {MODEL_LABELS[modelId] || modelId}
                                                </p>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {modelVoices.map(voice => (
                                                        <VoiceCard
                                                            key={favKey(modelId, voice.voice_id)}
                                                            modelId={modelId}
                                                            voiceId={voice.voice_id}
                                                            displayName={voice.display_name || voice.voice_id}
                                                            isSelected={formData.model_id === modelId && formData.voice_id === voice.voice_id}
                                                            onSelect={selectPremiumVoice}
                                                            previewState={previewState}
                                                            onPreview={handleVoicePreview}
                                                            isFav={isFav}
                                                            onToggleFav={toggleFav}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {/* Scene selector */}
                                        {(() => {
                                            const selectedScript = scripts.find(s => String(s.id) === String(formData.script_id));
                                            const sceneCount = selectedScript?.content?.scenes?.length || 0;
                                            const scriptHasAudio = audios.some(
                                                a => String(a.script_id) === String(formData.script_id) && a.provider === 'siliconflow'
                                            );
                                            return sceneCount > 0 ? (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Generation Mode</label>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData(prev => ({ ...prev, scene_number: 1 }))}
                                                                className={`py-2 px-3 rounded-xl border-2 text-center text-xs font-bold transition-all ${formData.scene_number !== 'all'
                                                                        ? 'border-amber-400 bg-amber-500/10 text-amber-400'
                                                                        : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-amber-200'
                                                                    }`}
                                                            >
                                                                Single Scene
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData(prev => ({ ...prev, scene_number: 'all' }))}
                                                                className={`py-2 px-3 rounded-xl border-2 text-center text-xs font-bold transition-all ${formData.scene_number === 'all'
                                                                        ? 'border-amber-400 bg-amber-500/10 text-amber-400'
                                                                        : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-amber-200'
                                                                    }`}
                                                            >
                                                                Stitch All Scenes
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {formData.scene_number !== 'all' ? (
                                                        <div className="space-y-2 animate-in fade-in duration-200">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Scene to Generate</label>
                                                                {scriptHasAudio && (
                                                                    <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                                        ✓ Extra scenes are free
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-4 gap-2">
                                                                {Array.from({ length: sceneCount }, (_, i) => i + 1).map(n => {
                                                                    const hasAudio = audios.some(
                                                                        a => String(a.script_id) === String(formData.script_id) &&
                                                                            a.provider === 'siliconflow' &&
                                                                            a.voice_name?.includes(`Scene ${n}`)
                                                                    );
                                                                    return (
                                                                        <button
                                                                            key={n}
                                                                            type="button"
                                                                            onClick={() => setFormData({ ...formData, scene_number: n })}
                                                                            className={`relative py-2 rounded-lg text-sm font-bold border-2 transition-all ${formData.scene_number === n
                                                                                    ? 'border-amber-400 bg-amber-500/10 text-amber-400'
                                                                                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:border-amber-200'
                                                                                }`}
                                                                        >
                                                                            {n}
                                                                            {hasAudio && (
                                                                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500/100 rounded-full border border-white" title="Already generated" />
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                            <p className="text-[10px] text-gray-600 dark:text-gray-500 dark:text-gray-400 mt-1">
                                                                Generating scene {formData.scene_number} of {sceneCount} •{' '}
                                                                {scriptHasAudio ? 'No credit used' : '1 credit will be used for this script'}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="p-3 bg-amber-500/5 border border-dashed border-amber-500/20 rounded-xl text-xs text-amber-500/90 leading-relaxed animate-in fade-in duration-200">
                                                            All {sceneCount} scenes will be generated sequentially in the background and stitched together with natural pause intervals. This will consume 1 premium credit (or be free if this script has already been initiated).
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                )}

                                {/* Speed */}
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            <MdSpeed className="w-4 h-4 text-gray-600 dark:text-gray-500 dark:text-gray-400" /> Playback Speed
                                        </label>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">{parseFloat(formData.speed).toFixed(1)}×</span>
                                    </div>
                                    <input type="range" min="0.5" max="2.0" step="0.1" value={formData.speed}
                                        onChange={e => setFormData({ ...formData, speed: parseFloat(e.target.value) })}
                                        className="w-full h-2 accent-amber-500 cursor-pointer" />
                                    <div className="flex justify-between text-[10px] text-gray-600 dark:text-gray-500 dark:text-gray-400 mt-1">
                                        <span>0.5× Slow</span><span>1.0× Normal</span><span>2.0× Fast</span>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="pt-1">
                                    {isGenerating ? (
                                        <div className="space-y-5 p-5 bg-gradient-to-br from-purple-900/10 via-amber-900/5 to-black border border-purple-500/20 rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.15)] relative overflow-hidden backdrop-blur-md">
                                            {/* Micro-sparkle ambient background lights */}
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-amber-500 to-cyan-500 animate-pulse" />
                                            
                                            {/* Loader 1: Overall progress */}
                                            <div className="space-y-2 relative">
                                                <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-purple-300 uppercase">
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                                                        <span className="truncate max-w-[240px] font-medium">{generationStage || 'Preparing script...'}</span>
                                                    </span>
                                                    <span className="font-mono text-purple-400 font-bold">{Math.round(generationProgress)}%</span>
                                                </div>
                                                <div className="w-full bg-purple-950/40 rounded-full h-3 overflow-hidden border border-purple-500/10 shadow-inner">
                                                    <div className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out relative shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                                                         style={{ width: `${generationProgress}%` }}>
                                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[move-stripes_1.5s_linear_infinite]" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Loader 2: Chunk engine progress */}
                                            {chunkStage && (
                                                <div className="space-y-2 pt-2 border-t border-white/5">
                                                    <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-amber-300 uppercase">
                                                        <span className="flex items-center gap-2">
                                                            {chunkProgress < 100 ? (
                                                                <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <span className="text-emerald-400 font-bold text-sm">✓</span>
                                                            )}
                                                            <span className="truncate max-w-[240px] text-[11px] font-medium text-amber-400/90 lowercase first-letter:uppercase">{chunkStage}</span>
                                                        </span>
                                                        <span className="font-mono text-amber-400 font-bold">{Math.round(chunkProgress)}%</span>
                                                    </div>
                                                    <div className="w-full bg-amber-950/20 rounded-full h-2 overflow-hidden border border-amber-500/10">
                                                        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(245,158,11,0.4)]" 
                                                             style={{ width: `${chunkProgress}%` }} />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="text-[10px] text-gray-500 text-center select-none pt-1">
                                                <span>You can close this tab/website. Rendering will finish securely in the background!</span>
                                            </div>
                                            <style>{`
                                                @keyframes move-stripes {
                                                    0% { background-position: 0 0; }
                                                    100% { background-position: 1rem 0; }
                                                }
                                            `}</style>
                                        </div>
                                    ) : (
                                        <button type="submit"
                                            disabled={!formData.script_id || (formData.provider === 'siliconflow' && !formData.voice_id)}
                                            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${formData.provider === 'siliconflow'
                                                    ? 'bg-amber-500/100 hover:bg-amber-600 text-gray-900 dark:text-white'
                                                    : 'bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white'
                                                }`}>
                                            {formData.provider === 'siliconflow'
                                                ? <><MdStar className="w-4 h-4" /> Render Premium Audio Track</>
                                                : 'Render Single Audio Track'}
                                        </button>
                                    )}
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}