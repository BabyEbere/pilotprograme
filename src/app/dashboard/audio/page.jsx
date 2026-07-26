"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import {
    MdAdd, MdDownload, MdDelete, MdPlayArrow, MdPause,
    MdVolumeUp, MdClose, MdArrowBack, MdGraphicEq,
    MdStar, MdFavorite, MdFavoriteBorder,
    MdStop, MdFolder, MdFolderOpen, MdMergeType, MdSearch,
    MdAutoAwesome
} from 'react-icons/md';
import Sidebar from '@/components/Sidebar';

// ── Constants ─────────────────────────────────────────────────────────────────

const MODEL_LABELS = {
    'fishaudio/fish-speech-1.5': 'Fish Speech 1.5 (Expressive)',
    'FunAudioLLM/CosyVoice2-0.5B': 'CosyVoice2-0.5B (Storyteller)',
    'IndexTeam/IndexTTS-2': 'IndexTTS-2 (Cinematic)',
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
function favKey(modelId, voiceId) { return `${modelId}::${voiceId}`; }

// ── VoiceCard Component ───────────────────────────────────────────────────

function VoiceCard({ modelId, voiceId, displayName, isSelected, onSelect,
    previewState, onPreview, isFav, onToggleFav }) {
    const meta = VOICE_META[voiceId] || { emoji: '🎙️', desc: '' };
    const key = favKey(modelId, voiceId);
    const pState = previewState[key];
    const isPlaying = pState === 'playing';
    const isLoading = pState === 'loading';
    const fav = isFav(modelId, voiceId);

    return (
        <div className={`relative rounded-xl border transition-all p-3 flex flex-col justify-between ${
            isSelected 
                ? 'border-red-600 bg-red-600/10 text-red-500' 
                : 'border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 bg-white dark:bg-[#141417]'
        }`}>
            <button type="button"
                onClick={() => onToggleFav(modelId, voiceId, displayName)}
                className="absolute top-2.5 right-2.5 z-10 text-gray-400 hover:text-red-500 transition-colors"
                title={fav ? 'Remove from favourites' : 'Add to favourites'}
            >
                {fav ? <MdFavorite className="w-4 h-4 text-red-500" /> : <MdFavoriteBorder className="w-4 h-4" />}
            </button>

            <button type="button" onClick={() => onSelect(modelId, voiceId)}
                className="w-full flex flex-col items-center gap-1 text-center pt-1 pb-2"
            >
                <span className="text-xl filter drop-shadow-sm">{meta.emoji}</span>
                <span className={`text-xs font-bold ${isSelected ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'}`}>
                    {displayName || voiceId}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">{meta.desc}</span>
            </button>

            <button type="button"
                onClick={() => onPreview(modelId, voiceId)}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    isPlaying 
                        ? 'bg-red-600/20 border-red-600/40 text-red-500'
                        : isLoading 
                            ? 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 cursor-wait'
                            : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
            >
                {isLoading && <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />}
                {isPlaying && <MdStop className="w-3.5 h-3.5" />}
                {!isLoading && !isPlaying && <MdPlayArrow className="w-3.5 h-3.5" />}
                <span>{isLoading ? 'Loading...' : isPlaying ? 'Stop' : 'Preview'}</span>
            </button>
        </div>
    );
}

// ── Serious Cyber Techy Audio Player ───────────────────────────────────────

function TechyAudioPlayer({ src, title, voice, onPlayChange }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [volume, setVolume] = useState(1.0);
    const [showVolume, setShowVolume] = useState(false);

    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        if (audioRef.current) {
            audioRef.current.load();
            audioRef.current.playbackRate = playbackRate;
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

    const changeSpeed = () => {
        const rates = [0.75, 1.0, 1.25, 1.5, 2.0];
        const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
        const nextRate = rates[nextIdx];
        setPlaybackRate(nextRate);
        if (audioRef.current) {
            audioRef.current.playbackRate = nextRate;
        }
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
        <div className="w-full bg-[#121216] border border-white/10 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
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

            <div className="relative z-10 flex flex-col gap-3">
                {/* Track Title & Clean Equalizer */}
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 pr-2 overflow-hidden">
                        <h4 className="text-xs font-bold text-gray-200 truncate max-w-[180px] sm:max-w-[260px] tracking-wide" title={title}>
                            {title || "Audio Track"}
                        </h4>
                        {voice && (
                            <p className="text-[10px] font-mono text-gray-400 mt-0.5 uppercase tracking-wider truncate max-w-[180px] sm:max-w-[260px]">{voice}</p>
                        )}
                    </div>

                    {/* Equalizer Visualizer Bars (Clean Monochrome) */}
                    <div className="flex items-center gap-1 h-4 px-2 bg-white/5 rounded-lg border border-white/5">
                        {[40, 70, 30, 90, 50, 80, 40].map((height, i) => (
                            <div
                                key={i}
                                className={`w-0.5 bg-red-500 rounded-full transition-all duration-150 ${isPlaying ? 'animate-bounce' : 'opacity-30'}`}
                                style={{
                                    height: isPlaying ? `${Math.max(20, (height * Math.random()) + 20)}%` : '30%',
                                    animationDelay: `${i * 0.1}s`
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Scrubber & Controls */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={togglePlay}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${
                            isPlaying
                                ? 'bg-red-600 text-white shadow-md shadow-red-900/40 ring-1 ring-red-500'
                                : 'bg-gray-800 hover:bg-gray-700 text-white'
                        }`}
                    >
                        {isPlaying ? <MdPause className="w-5 h-5" /> : <MdPlayArrow className="w-5 h-5 ml-0.5" />}
                    </button>

                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                            <span className="text-red-400 font-bold">{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-600 outline-none"
                            style={{
                                background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.1) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.1) 100%)`,
                            }}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={changeSpeed}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-mono font-bold text-gray-300 transition-all shrink-0"
                        title="Playback Speed"
                    >
                        {playbackRate}x
                    </button>

                    <div className="relative flex items-center shrink-0">
                        <button
                            type="button"
                            onClick={() => setShowVolume(!showVolume)}
                            className="p-1.5 text-gray-400 hover:text-white transition-colors"
                        >
                            <MdVolumeUp className="w-4 h-4" />
                        </button>
                        {showVolume && (
                            <div className="absolute bottom-8 right-0 bg-[#1c1c22] border border-white/10 p-2 rounded-xl shadow-2xl flex items-center z-30">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-20 h-1 accent-red-600 cursor-pointer"
                                />
                            </div>
                        )}
                    </div>
                </div>
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

    // Track downloading audio ID for button spinner
    const [downloadingId, setDownloadingId] = useState(null);

    // Filter states for Select Target Script Dropdown
    const [scriptFilterTab, setScriptFilterTab] = useState('all');
    const [scriptSearchQuery, setScriptSearchQuery] = useState('');

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

    // Preview state per voice
    const [previewState, setPreviewState] = useState({});
    const previewRefs = useRef({});

    // Modal & Progress
    const [showModal, setShowModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStage, setGenerationStage] = useState('');
    const [chunkProgress, setChunkProgress] = useState(0);
    const [chunkStage, setChunkStage] = useState('');
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [edgePreviewAudio, setEdgePreviewAudio] = useState(null);

    const [formData, setFormData] = useState({
        script_id: '',
        provider: 'edge',
        voice_id: '',
        model_id: '',
        speed: 1.0,
        scene_number: 1,
    });

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');

    useEffect(() => {
        document.title = 'Audio Library | AI Studio';
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

    // Auto-open target script folder if passed in URL query parameters
    useEffect(() => {
        if (typeof window !== 'undefined' && scripts.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const sId = params.get('script_id') || params.get('id');
            if (sId) {
                const matchedScript = scripts.find(s => String(s.id) === String(sId) || String(s.uuid) === String(sId));
                if (matchedScript) {
                    setSelectedAlbumId(matchedScript.id);
                    setViewMode('album_detail');
                } else if (!isNaN(Number(sId))) {
                    setSelectedAlbumId(Number(sId));
                    setViewMode('album_detail');
                }
            }
        }
    }, [scripts]);

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
        } catch {}
    };

    const fetchScripts = async () => {
        try {
            setLoadingScripts(true);
            const res = await fetch(`${API_URL}/scripts?user_id=${user.id}`);
            const data = await res.json();
            if (data.success) setScripts(data.scripts.filter(s => s.status === 'completed'));
        } catch {}
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

    // ── Previews ──────────────────────────────────────────────────────────────

    const stopAllPreviews = () => {
        Object.values(previewRefs.current).forEach(a => { if (a) { a.pause(); a.currentTime = 0; } });
        setPreviewState({});
    };

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
    const COSY_PREFIX = "Speak in a calm, engaging storytelling narrator voice. Pace yourself naturally with clear diction.<|endofprompt|>";

    const [previewError, setPreviewError] = useState('');

    const handleVoicePreview = async (modelId, voiceId) => {
        const key = favKey(modelId, voiceId);

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
                } catch {}
                throw new Error(msg);
            }

            const blob = await res.blob();
            if (blob.size === 0) throw new Error('Empty audio returned.');

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
                setPreviewError('Audio playback failed — try another voice.');
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
            setPreviewError(e.message || 'Preview failed.');
            setTimeout(() => setPreviewError(''), 5000);
        }
    };

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

    // Provider switches
    const switchToEdge = () => { stopAllPreviews(); setFormData(prev => ({ ...prev, provider: 'edge', voice_id: edgeVoices[0]?.id || '', model_id: '' })); };
    const switchToPookieEdge = () => { stopAllPreviews(); setFormData(prev => ({ ...prev, provider: 'pookie-edge', voice_id: edgeVoices[0]?.id || '', model_id: '' })); };
    const switchToGoogle = () => { stopAllPreviews(); setFormData(prev => ({ ...prev, provider: 'google', voice_id: googleVoices[0]?.id || '', model_id: '' })); };
    const switchToPookieGoogle = () => { stopAllPreviews(); setFormData(prev => ({ ...prev, provider: 'pookie-google', voice_id: googleVoices[0]?.id || '', model_id: '' })); };
    const switchToGemini = () => { stopAllPreviews(); setFormData(prev => ({ ...prev, provider: 'gemini', voice_id: geminiVoices[0]?.id || '', model_id: '' })); };
    const switchToXtts = () => { stopAllPreviews(); setFormData(prev => ({ ...prev, provider: 'xtts', voice_id: xttsVoices[0]?.id || 'Claribel Dervla', model_id: '' })); };

    const selectPremiumVoice = (modelId, voiceId) => {
        setFormData(prev => ({ ...prev, provider: 'siliconflow', model_id: modelId, voice_id: voiceId }));
    };

    const switchToPremium = () => {
        if (favourites.length > 0) {
            const fav = favourites[0];
            if (premiumVoices[fav.model_id]?.some(v => v.voice_id === fav.voice_id)) {
                selectPremiumVoice(fav.model_id, fav.voice_id);
                return;
            }
        }
        const firstModel = Object.keys(premiumVoices)[0];
        const firstVoice = premiumVoices[firstModel]?.[0]?.voice_id;
        if (firstModel && firstVoice) selectPremiumVoice(firstModel, firstVoice);
    };

    // Actions
    const handleDelete = async (audioId) => {
        if (!window.confirm('Delete this audio generation?')) return;
        setAudios(audios.filter(a => a.id !== audioId));
    };

    // Refactored Download with Loading Spinner State
    const handleDownloadAudio = async (audioId, url, filename) => {
        try {
            setDownloadingId(audioId);
            const res = await fetch(url);
            if (!res.ok) throw new Error('Download failed');
            const blob = await res.blob();
            const bUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = bUrl;
            link.download = filename || 'audio.mp3';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(bUrl);
        } catch {
            window.open(url, '_blank');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleStitchAudios = async (scriptId, voiceName) => {
        const targetId = scriptId || selectedAlbumId;
        if (!targetId) return;
        setIsStitching(true);
        try {
            const res = await fetch(`${API_URL}/scripts/${targetId}/stitch-audios`, {
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

    // Generate Audio Form Submission
    const handleGenerateAudio = async (e) => {
        e.preventDefault();
        if (!formData.script_id) { alert('Please select a script!'); return; }

        if (formData.provider === 'siliconflow' && remainingVoiceovers <= 0) {
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
                    setIsGenerating(false);
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
                setIsGenerating(false);
            }
            return;
        }

        try {
            setIsGenerating(true);
            setGenerationProgress(0);
            setGenerationStage('Initializing audio renderer...');
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
                    } catch {}
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
                    setIsGenerating(false);
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
                alert('Generation completed but no audio returned.');
                setIsGenerating(false);
            }
        } catch (err) {
            setGenerationProgress(0); setGenerationStage('');
            alert('Network error during audio generation: ' + err.message);
            setIsGenerating(false);
        }
    };

    // Derived
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

    // Filtered scripts for the Target Dropdown
    const filteredScripts = scripts.filter(s => {
        const hasAudio = audios.some(a => String(a.script_id) === String(s.id));
        if (scriptFilterTab === 'generated' && !hasAudio) return false;
        if (scriptFilterTab === 'pending' && hasAudio) return false;
        if (scriptSearchQuery.trim()) {
            const query = scriptSearchQuery.toLowerCase();
            return (s.title || '').toLowerCase().includes(query) || (s.niche_name || '').toLowerCase().includes(query);
        }
        return true;
    });

    return (
        <div className="flex h-screen bg-gray-55 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto relative pb-20 p-4 sm:p-6 lg:p-8">

                {/* Top Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/5 pb-5 mb-6">
                    <div className="flex items-center gap-3">
                        {viewMode === 'album-details' && (
                            <button
                                onClick={() => setViewMode('albums')}
                                className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl transition-colors shrink-0"
                            >
                                <MdArrowBack className="w-5 h-5" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                                <MdGraphicEq className="text-red-500 w-6 h-6" />
                                {viewMode === 'albums' ? 'Audio Library' : activeAlbum?.title || 'Story Audio Vault'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                                {viewMode === 'albums' ? 'Organized story narrative document folders' : `${activeAlbumAudios.length} Rendered Track files`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {hasPremiumVoices && !loadingPlan && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-red-500/10 border-red-500/20 text-red-500">
                                <MdStar className="w-4 h-4 text-red-500" />
                                {remainingVoiceovers} / {maxVoiceovers} Premium Voiceovers
                            </div>
                        )}

                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow"
                        >
                            <MdAdd className="w-4 h-4" />
                            <span>Render Audio</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Loading audio documents...</p>
                    </div>
                ) : audios.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-[#111116] rounded-3xl border border-gray-200 dark:border-white/10 max-w-xl mx-auto p-8 shadow-sm">
                        <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                            <MdFolder className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">No Audio Files Found</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">Synthesize voice narrations for your story scripts!</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow"
                        >
                            Render First Audio
                        </button>
                    </div>
                ) : viewMode === 'albums' ? (
                    /* 📁 FOLDER CONTAINER VIEW */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/5 pb-3">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <MdFolderOpen className="text-red-500 w-4 h-4" /> Story Audio Folders ({scriptsWithAudios.length})
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {scriptsWithAudios.map(album => {
                                const mergeableAudios = album.audios.filter(
                                    a => a.provider === 'siliconflow' && a.voice_name?.includes(' - Scene ')
                                );
                                const voiceGroups = {};
                                mergeableAudios.forEach(a => {
                                    const baseVoice = a.voice_name.split(' - ')[0];
                                    if (!voiceGroups[baseVoice]) voiceGroups[baseVoice] = [];
                                    voiceGroups[baseVoice].push(a);
                                });
                                const mergeableVoices = Object.keys(voiceGroups).filter(v => voiceGroups[v].length >= 2);

                                return (
                                    <div
                                        key={album.id}
                                        className="bg-white dark:bg-[#121217] border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-red-500/40 transition-all shadow-sm group flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
                                                    <MdFolder className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                    {album.audios.length} {album.audios.length === 1 ? 'Track' : 'Tracks'}
                                                </span>
                                            </div>

                                            <h3 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-red-500 transition-colors">
                                                {album.title}
                                            </h3>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                                                {album.niche_name || 'Story Project'}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-2">
                                            {mergeableVoices.length > 0 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStitchAudios(album.id, mergeableVoices[0]);
                                                    }}
                                                    disabled={isStitching}
                                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow"
                                                >
                                                    <MdMergeType className="w-4 h-4" />
                                                    <span>{isStitching ? 'Merging...' : `Merge Audio (${mergeableVoices[0]})`}</span>
                                                </button>
                                            )}

                                            <button
                                                onClick={() => { setSelectedAlbumId(album.id); setViewMode('album-details'); }}
                                                className="w-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                <MdFolderOpen className="w-4 h-4 text-red-500" />
                                                <span>View Audio Documents</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* 🎧 ALBUM DETAILS VIEW WITH REFINED AUDIO CARDS & CLEAN DOWNLOAD BUTTON */
                    <div className="space-y-6">
                        {(() => {
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

                            return mergeableVoices.length > 0 && (
                                <div className="bg-gray-100 dark:bg-[#121217] border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <MdMergeType className="w-5 h-5 text-red-500" />
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Separate Scene Audios Available</h4>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">Merge scene audio chunks into a full narrative track.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {mergeableVoices.map(voice => (
                                            <button
                                                key={voice}
                                                disabled={isStitching}
                                                onClick={() => handleStitchAudios(activeAlbum?.id, voice)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow"
                                            >
                                                <MdGraphicEq className="w-4 h-4" />
                                                {isStitching ? 'Stitching...' : `Merge ${voice} Scenes`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {activeAlbumAudios.map(audio => {
                                const isDownloadingThis = downloadingId === audio.id;
                                return (
                                    <div
                                        key={audio.id}
                                        className={`bg-white dark:bg-[#121217] rounded-2xl border p-5 transition-all shadow-sm ${
                                            currentAudio?.id === audio.id
                                                ? 'border-red-600 ring-1 ring-red-600/30'
                                                : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex flex-col gap-4">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="min-w-0 flex-1 overflow-hidden pr-2">
                                                    <h3 className="font-bold text-gray-900 dark:text-white text-xs truncate max-w-[160px] sm:max-w-[240px]" title={audio.script_title || 'Untitled Script'}>
                                                        {audio.script_title || 'Untitled Script'}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold mt-1">
                                                        <span className="text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                            {audio.voice_name}
                                                        </span>
                                                        {audio.provider === 'siliconflow' && (
                                                            <span className="text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                                                                <MdStar className="w-3 h-3" /> SiliconFlow Premium
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* REFINED DOWNLOAD BUTTON WITH LOADER */}
                                                    <button
                                                        type="button"
                                                        disabled={isDownloadingThis}
                                                        onClick={() => handleDownloadAudio(audio.id, audio.url, `${activeAlbum?.title}_${audio.id}.mp3`)}
                                                        className="bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50"
                                                    >
                                                        {isDownloadingThis ? (
                                                            <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <MdDownload className="w-3.5 h-3.5 text-red-500" />
                                                        )}
                                                        <span>{isDownloadingThis ? 'Downloading...' : 'Download MP3'}</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(audio.id)}
                                                        className="p-1.5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                                                        title="Delete Audio"
                                                    >
                                                        <MdDelete className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Techy Audio Player */}
                                            <TechyAudioPlayer
                                                src={audio.url}
                                                title={audio.script_title || activeAlbum?.title}
                                                voice={audio.voice_name}
                                                onPlayChange={(playing) => {
                                                    if (playing) {
                                                        setCurrentAudio({ id: audio.id, url: audio.url, isPlaying: true });
                                                    } else {
                                                        setCurrentAudio(prev => prev?.id === audio.id ? { ...prev, isPlaying: false } : prev);
                                                    }
                                                }}
                                            />

                                            <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 pt-1">
                                                <span>Rendered: {new Date(audio.created_at).toLocaleString()}</span>
                                                <span className="font-mono">{audio.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════
                GENERATE AUDIO MODAL WITH FILTERABLE DROPDOWN
            ══════════════════════════════════════════════════ */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#121217] border border-gray-200 dark:border-white/10 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 p-6 relative">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-4">
                            <div>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <MdGraphicEq className="text-red-500 w-5 h-5" /> Render Narrative Audio
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Synthesize professional speech narration for your scripts.</p>
                            </div>
                            <button
                                onClick={() => { setShowModal(false); stopAllPreviews(); }}
                                className="p-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
                            >
                                <MdClose className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleGenerateAudio} className="space-y-5">
                            {/* TARGET SCRIPT DROPDOWN WITH FILTERS */}
                            <div className="space-y-2.5">
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Select Target Script</label>
                                
                                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#1a1a22] p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setScriptFilterTab('all')}
                                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                                            scriptFilterTab === 'all'
                                                ? 'bg-red-600 text-white shadow'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        📜 All ({scripts.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setScriptFilterTab('generated')}
                                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                                            scriptFilterTab === 'generated'
                                                ? 'bg-red-600 text-white shadow'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        🎙️ With Audio ({scripts.filter(s => audios.some(a => String(a.script_id) === String(s.id))).length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setScriptFilterTab('pending')}
                                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                                            scriptFilterTab === 'pending'
                                                ? 'bg-red-600 text-white shadow'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        ⏳ Pending Audio ({scripts.filter(s => !audios.some(a => String(a.script_id) === String(s.id))).length})
                                    </button>
                                </div>

                                <div className="relative">
                                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search target scripts by title..."
                                        value={scriptSearchQuery}
                                        onChange={(e) => setScriptSearchQuery(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-[#1a1a22] border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 dark:text-white focus:outline-none"
                                    />
                                </div>

                                <select
                                    required
                                    value={formData.script_id}
                                    onChange={e => setFormData({ ...formData, script_id: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a22] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-semibold text-gray-800 dark:text-white focus:outline-none"
                                >
                                    <option value="">-- Choose Target Script ({filteredScripts.length} available) --</option>
                                    {filteredScripts.map(s => {
                                        const hasAudio = audios.some(a => String(a.script_id) === String(s.id));
                                        return (
                                            <option key={s.id} value={s.id}>
                                                {hasAudio ? "🎙️ " : "⏳ "}{s.title} ({s.niche_name || 'General'})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Provider Picker */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Voice Engine</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    <button type="button" onClick={switchToEdge}
                                        className={`p-3 rounded-xl border text-left transition-all ${formData.provider === 'edge' ? 'border-red-600 bg-red-600/10' : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a22]'}`}>
                                        <div className="font-bold text-xs text-gray-900 dark:text-white">Edge TTS</div>
                                        <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">Microsoft Neural · Free</div>
                                    </button>

                                    <button type="button" onClick={switchToPookieEdge}
                                        className={`p-3 rounded-xl border text-left transition-all ${formData.provider === 'pookie-edge' ? 'border-red-600 bg-red-600/10' : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a22]'}`}>
                                        <div className="font-bold text-xs text-gray-900 dark:text-white">Pookie Edge</div>
                                        <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">Humanized Edge · Free</div>
                                    </button>

                                    <button type="button" onClick={switchToGoogle}
                                        className={`p-3 rounded-xl border text-left transition-all ${formData.provider === 'google' ? 'border-red-600 bg-red-600/10' : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a22]'}`}>
                                        <div className="font-bold text-xs text-gray-900 dark:text-white">Google TTS</div>
                                        <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">Standard Voice · Free</div>
                                    </button>

                                    <button type="button" onClick={switchToPookieGoogle}
                                        className={`p-3 rounded-xl border text-left transition-all ${formData.provider === 'pookie-google' ? 'border-red-600 bg-red-600/10' : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a22]'}`}>
                                        <div className="font-bold text-xs text-gray-900 dark:text-white">Pookie GG</div>
                                        <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">Humanized Google · Free</div>
                                    </button>

                                    <button type="button" onClick={switchToGemini}
                                        className={`p-3 rounded-xl border text-left transition-all ${formData.provider === 'gemini' ? 'border-red-600 bg-red-600/10' : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a22]'}`}>
                                        <div className="font-bold text-xs text-gray-900 dark:text-white">Gemini TTS</div>
                                        <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">Google GenAI · Free</div>
                                    </button>

                                    <button type="button"
                                        onClick={() => { if (canUsePremium) switchToPremium(); }}
                                        disabled={!hasPremiumVoices}
                                        className={`p-3 rounded-xl border text-left transition-all ${!hasPremiumVoices ? 'border-white/5 opacity-50 cursor-not-allowed'
                                            : formData.provider === 'siliconflow' ? 'border-red-600 bg-red-600/10'
                                                : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a22]'
                                        }`}>
                                        <div className="flex items-center gap-1">
                                            <MdStar className="w-3.5 h-3.5 text-amber-500" />
                                            <span className="font-bold text-xs text-gray-900 dark:text-white">SiliconFlow</span>
                                        </div>
                                        <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">
                                            {!hasPremiumVoices ? 'Upgrade plan' : `${remainingVoiceovers} remaining`}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {(formData.provider === 'edge' || formData.provider === 'pookie-edge') && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Select Voice</label>
                                        <button type="button" onClick={() => handlePreviewVoice(formData.provider, formData.voice_id)} disabled={isPreviewing}
                                            className="text-[10px] font-bold text-red-500 flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-lg">
                                            {isPreviewing ? <MdPause className="w-3 h-3" /> : <MdPlayArrow className="w-3 h-3" />}
                                            {isPreviewing ? 'Playing...' : 'Preview Voice'}
                                        </button>
                                    </div>
                                    <select required value={formData.voice_id}
                                        onChange={e => setFormData({ ...formData, voice_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a22] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-semibold text-gray-800 dark:text-white focus:outline-none">
                                        {edgeVoices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {(formData.provider === 'google' || formData.provider === 'pookie-google') && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Select Voice</label>
                                        <button type="button" onClick={() => handlePreviewVoice(formData.provider, formData.voice_id)} disabled={isPreviewing}
                                            className="text-[10px] font-bold text-red-500 flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-lg">
                                            {isPreviewing ? <MdPause className="w-3 h-3" /> : <MdPlayArrow className="w-3 h-3" />}
                                            {isPreviewing ? 'Playing...' : 'Preview Voice'}
                                        </button>
                                    </div>
                                    <select required value={formData.voice_id}
                                        onChange={e => setFormData({ ...formData, voice_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a22] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-semibold text-gray-800 dark:text-white focus:outline-none">
                                        {googleVoices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {formData.provider === 'siliconflow' && (
                                <div className="space-y-4">
                                    {Object.entries(premiumVoices).map(([modelId, modelVoices]) => (
                                        <div key={modelId}>
                                            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                {MODEL_LABELS[modelId] || modelId}
                                            </p>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, scene_number: 1 }))}
                                            className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all ${formData.scene_number !== 'all'
                                                ? 'border-red-600 bg-red-600/10 text-red-500'
                                                : 'border-gray-200 dark:border-white/10 text-gray-400'
                                            }`}
                                        >
                                            Single Scene
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, scene_number: 'all' }))}
                                            className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all ${formData.scene_number === 'all'
                                                ? 'border-red-600 bg-red-600/10 text-red-500'
                                                : 'border-gray-200 dark:border-white/10 text-gray-400'
                                            }`}
                                        >
                                            Stitch All Scenes
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isGenerating}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase py-3.5 rounded-2xl text-xs tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow"
                            >
                                <MdAutoAwesome className="w-4 h-4" />
                                <span>Start Rendering Audio</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* SCENE RENDERING PROGRESS POP-UP MODAL */}
            {isGenerating && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#121217] border border-gray-200 dark:border-white/10 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-5 relative overflow-hidden">
                        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow">
                            <div className="w-7 h-7 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">
                                Rendering Narrative Audio
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{generationStage || "Synthesizing vocal track..."}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 font-mono">
                                <span>{chunkStage || "Processing..."}</span>
                                <span className="text-red-500">{generationProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-red-600 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${generationProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}