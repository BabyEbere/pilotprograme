"use client";

import { useState, useEffect, useRef } from 'react';
import {
    MdRecordVoiceOver, MdToggleOn, MdToggleOff,
    MdSave, MdCheckCircle, MdWarning, MdPlayArrow, MdStop,
    MdVolumeUp, MdDelete,
} from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

// ── Constants ─────────────────────────────────────────────────────────────────

const MODEL_META = {
    'fishaudio/fish-speech-1.5': {
        name: 'Fish Speech 1.5',
        bg: 'bg-blue-50', border: 'border-blue-200',
        headerText: 'text-blue-900', badge: 'bg-blue-100 text-blue-700',
        supportsEmotion: false,
    },
    'FunAudioLLM/CosyVoice2-0.5B': {
        name: 'CosyVoice2-0.5B',
        bg: 'bg-purple-50', border: 'border-purple-200',
        headerText: 'text-purple-900', badge: 'bg-purple-100 text-purple-700',
        supportsEmotion: true,  // supports <|endofprompt|> style prefix
    },
    'IndexTeam/IndexTTS-2': {
        name: 'IndexTTS-2',
        bg: 'bg-emerald-50', border: 'border-emerald-200',
        headerText: 'text-emerald-900', badge: 'bg-emerald-100 text-emerald-700',
        supportsEmotion: false,
    },
    'hexgrad/Kokoro-82M': {
        name: 'Kokoro (82M) Offline',
        bg: 'bg-rose-50', border: 'border-rose-200',
        headerText: 'text-rose-900', badge: 'bg-rose-100 text-rose-700',
        supportsEmotion: false,
    },
    'coqui/xtts-v2': {
        name: 'Coqui XTTS v2 Offline',
        bg: 'bg-indigo-55 bg-indigo-50/70', border: 'border-indigo-200',
        headerText: 'text-indigo-900', badge: 'bg-indigo-100 text-indigo-700',
        supportsEmotion: false,
    },
    'F5-TTS': {
        name: 'F5-TTS Zero-Shot Cloner',
        bg: 'bg-indigo-50 border-indigo-100', border: 'border-indigo-200',
        headerText: 'text-indigo-900', badge: 'bg-indigo-100 text-indigo-700',
        supportsEmotion: false,
        isCloning: true,
    },
    'resemble/chatterbox': {
        name: 'Resemble AI Chatterbox',
        bg: 'bg-amber-50', border: 'border-amber-200',
        headerText: 'text-amber-900', badge: 'bg-[#fdf3c7] text-[#b45309]',
        supportsEmotion: false,
        isCloning: true,
    },
};

const isCoreVoice = (modelId, voiceId) => {
    const coreModels = ['fishaudio/fish-speech-1.5', 'FunAudioLLM/CosyVoice2-0.5B', 'IndexTeam/IndexTTS-2'];
    const coreVoices = ['alex', 'anna', 'bella', 'benjamin', 'charles', 'claire', 'david', 'diana'];
    return coreModels.includes(modelId) && coreVoices.includes(voiceId);
};

const VOICE_META = {
    alex: { emoji: '👨', label: 'Alex', desc: 'Clear & confident' },
    anna: { emoji: '👩', label: 'Anna', desc: 'Warm & professional' },
    bella: { emoji: '🌸', label: 'Bella', desc: 'Bright & friendly' },
    benjamin: { emoji: '🧔', label: 'Benjamin', desc: 'Steady & reliable' },
    charles: { emoji: '👨‍💼', label: 'Charles', desc: 'Authoritative' },
    claire: { emoji: '👧', label: 'Claire', desc: 'Cheerful & clear' },
    david: { emoji: '🎤', label: 'David', desc: 'Deep & smooth' },
    diana: { emoji: '💃', label: 'Diana', desc: 'Elegant & expressive' },
    af_bella: { emoji: '👩', label: 'Bella (Kokoro)', desc: 'Smooth & natural female' },
    af_sarah: { emoji: '👧', label: 'Sarah (Kokoro)', desc: 'Friendly female' },
    af_nicole: { emoji: '👩‍🦰', label: 'Nicole (Kokoro)', desc: 'Clear female' },
    af_sky: { emoji: '🌅', label: 'Sky (Kokoro)', desc: 'Warm female' },
    am_adam: { emoji: '👨', label: 'Adam (Kokoro)', desc: 'Deep male' },
    am_michael: { emoji: '👦', label: 'Michael (Kokoro)', desc: 'Confident male' },
    bf_emma: { emoji: '🇬🇧', label: 'Emma (Kokoro)', desc: 'British female' },
    bf_isabella: { emoji: '👸', label: 'Isabella (Kokoro)', desc: 'British female' },
    bm_george: { emoji: '🧔', label: 'George (Kokoro)', desc: 'British male' },
    bm_lewis: { emoji: '🇬🇧', label: 'Lewis (Kokoro)', desc: 'British male' },
    'Claribel Dervla': { emoji: '🎙', label: 'Claribel (Coqui)', desc: 'Warm storytelling voice' },
    'Daisy Granger': { emoji: '🎙', label: 'Daisy (Coqui)', desc: 'Expressive female voice' },
    'Gracie Standard': { emoji: '🎙', label: 'Gracie (Coqui)', desc: 'Professional narration' },
    'Otis Roberts': { emoji: '🎙', label: 'Otis (Coqui)', desc: 'Deep narrative male' },
    'Baldur Edmund': { emoji: '🎙', label: 'Baldur (Coqui)', desc: 'Steady male voice' },
};

// Character phrases tailored per voice personality
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

// CosyVoice2 emotion style prefix — applied before the character phrase
// This triggers the model's expressive narration mode
const COSY_NARRATION_PREFIX = "Speak in a calm, engaging storytelling narrator voice. Pace yourself naturally with clear diction.<|endofprompt|>";

// SiliconFlow API key — preview is called from the browser directly
// to bypass server DNS resolution issues
const SILICON_API_KEY = 'sk-tlxbewvvaojyakeibuonxxddrtlrpkafjrjavtvfpnofcmfe';

function buildPreviewInput(modelId, voiceId) {
    const phrase = PREVIEW_PHRASES[voiceId] || `Hello, I am ${voiceId}. This is a preview of my voice.`;
    const meta = MODEL_META[modelId];
    // Only CosyVoice2 supports the emotion prompt prefix
    if (meta?.supportsEmotion) {
        return COSY_NARRATION_PREFIX + phrase;
    }
    return phrase;
}


// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminVoices() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const [voices, setVoices] = useState([]);
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saveStatus, setSaveStatus] = useState('idle');

    // Add Voice form state
    const [showAddModal, setShowAddModal] = useState(false);
    const [newVoiceModel, setNewVoiceModel] = useState('hexgrad/Kokoro-82M');
    const [newVoiceName, setNewVoiceName] = useState('');
    const [newVoiceId, setNewVoiceId] = useState('');
    const [newVoiceFile, setNewVoiceFile] = useState(null);
    const [addingVoice, setAddingVoice] = useState(false);

    // Preview: key = "model_id:voice_id" → 'loading' | 'playing' | null
    const [previewState, setPreviewState] = useState({});
    const audioRefs = useRef({});

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const adminData = JSON.parse(localStorage.getItem('user') || '{}');
    const headers = { Authorization: `Bearer ${adminData.token}`, 'Content-Type': 'application/json' };

    useEffect(() => { fetchVoices(); }, []);

    const fetchVoices = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/admin/voices`, { headers });
            const data = await res.json();
            if (data.success) {
                setVoices(data.voices || []);
                setPacks(data.packs || []);
            } else {
                setError(data.message || 'Failed to load voices.');
            }
        } catch {
            setError('Network error — could not load voice configs.');
        } finally {
            setLoading(false);
        }
    };

    // ── Mutators ──────────────────────────────────────────────────────────────

    const updateVoice = (id, patch) =>
        setVoices(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v));

    const toggleEnabled = (id) =>
        setVoices(prev => prev.map(v => v.id === id ? { ...v, enabled: !v.enabled } : v));

    const setGain = (id, val) => updateVoice(id, { gain: parseFloat(val) });

    const togglePackAssignment = (id, packId) => {
        setVoices(prev => prev.map(v => {
            if (v.id !== id) return v;
            const has = v.pack_ids.includes(packId);
            return { ...v, pack_ids: has ? v.pack_ids.filter(p => p !== packId) : [...v.pack_ids, packId] };
        }));
    };

    const enableAllInModel = (modelId) =>
        setVoices(prev => prev.map(v => v.model_id === modelId ? { ...v, enabled: true } : v));
    const disableAllInModel = (modelId) =>
        setVoices(prev => prev.map(v => v.model_id === modelId ? { ...v, enabled: false } : v));

    const handleAddVoice = async (e) => {
        e.preventDefault();
        if (!newVoiceName) {
            setError('Please enter a voice display name.');
            return;
        }

        const modelMeta = MODEL_META[newVoiceModel];
        const isCloningModel = modelMeta?.isCloning;

        if (isCloningModel && !newVoiceFile) {
            setError('Cloning models require uploading a reference voice audio file.');
            return;
        }
        if (!isCloningModel && !newVoiceId) {
            setError('Non-cloning models require entering a voice identifier.');
            return;
        }

        setAddingVoice(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('model_id', newVoiceModel);
            formData.append('display_name', newVoiceName);
            
            if (isCloningModel) {
                formData.append('reference_audio', newVoiceFile);
            } else {
                formData.append('voice_id', newVoiceId);
            }

            const res = await fetch(`${API_URL}/admin/voices/add`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${adminData.token}` }, // Form data must not define 'Content-Type' header manually
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                setShowAddModal(false);
                setNewVoiceName('');
                setNewVoiceId('');
                setNewVoiceFile(null);
                fetchVoices();
            } else {
                setError(data.message || 'Failed to add voice.');
            }
        } catch {
            setError('Network error — failed to add custom voice.');
        } finally {
            setAddingVoice(false);
        }
    };

    const handleDeleteVoice = async (id) => {
        if (!window.confirm('Are you sure you want to delete this custom voice configuration? This cannot be undone.')) {
            return;
        }

        setError('');
        try {
            const res = await fetch(`${API_URL}/admin/voices/${id}`, {
                method: 'DELETE',
                headers
            });
            const data = await res.json();
            if (data.success) {
                fetchVoices();
            } else {
                setError(data.message || 'Failed to delete voice.');
            }
        } catch {
            setError('Network error — failed to delete voice.');
        }
    };

    // ── Save ──────────────────────────────────────────────────────────────────

    const saveAll = async () => {
        setSaveStatus('saving');
        try {
            const res = await fetch(`${API_URL}/admin/voices/save`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    voices: voices.map(v => ({
                        id: v.id,
                        enabled: !!v.enabled,
                        gain: parseFloat(v.gain ?? 0),
                        pack_ids: v.pack_ids || [],
                    })),
                    packs: packs.map(p => ({ id: p.id, name: p.name })),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 2500);
            } else {
                setSaveStatus('error');
                setError(data.message || 'Save failed.');
            }
        } catch {
            setSaveStatus('error');
            setError('Network error — save failed.');
        }
    };

    // ── Preview (browser → SiliconFlow directly) ──────────────────────────────
    // Server has DNS issues with api.siliconflow.com so we call from the browser.
    // CosyVoice2 gets the narration style prefix for expressive output.

    const previewKey = (modelId, voiceId) => `${modelId}:${voiceId}`;

    const previewVoice = async (modelId, voiceId) => {
        const key = previewKey(modelId, voiceId);

        if (previewState[key] === 'playing') {
            const audio = audioRefs.current[key];
            if (audio) { audio.pause(); audio.currentTime = 0; }
            setPreviewState(prev => ({ ...prev, [key]: null }));
            return;
        }

        // Stop all other previews
        Object.entries(audioRefs.current).forEach(([k, a]) => {
            if (k !== key && a) { a.pause(); a.currentTime = 0; }
        });
        setPreviewState(() => ({ [key]: 'loading' }));

        try {
            let audioUrl;
            if (voiceId.startsWith('uploads/voice_clones/')) {
                const filename = voiceId.split('/').pop();
                audioUrl = `${API_URL}/voices/clones/view/${filename}`;
            } else if (modelId === 'hexgrad/Kokoro-82M' || modelId === 'F5-TTS' || modelId === 'resemble/chatterbox') {
                throw new Error(`Offline preview is not available for built-in or custom offline model (${modelId}).`);
            } else if (modelId === 'coqui/xtts-v2') {
                const res = await fetch(`${API_URL}/admin/voices/preview`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${adminData.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ model_id: modelId, voice_id: voiceId })
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || `Preview failed (${res.status})`);
                }
                const blob = await res.blob();
                audioUrl = URL.createObjectURL(blob);
            } else {
                const voiceRef = `${modelId}:${voiceId}`;
                const input = buildPreviewInput(modelId, voiceId);

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
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || `Preview failed (${res.status})`);
                }

                const blob = await res.blob();
                audioUrl = URL.createObjectURL(blob);
            }

            const audio = new Audio(audioUrl);
            audioRefs.current[key] = audio;

            audio.onended = () => {
                setPreviewState(prev => ({ ...prev, [key]: null }));
                URL.revokeObjectURL(url);
            };
            audio.onerror = () => {
                setPreviewState(prev => ({ ...prev, [key]: null }));
                URL.revokeObjectURL(url);
            };

            audio.play();
            setPreviewState(prev => ({ ...prev, [key]: 'playing' }));

        } catch (e) {
            setPreviewState(prev => ({ ...prev, [key]: null }));
            setError(e.message || 'Preview failed.');
            setTimeout(() => setError(''), 5000);
        }
    };

    // ── Derived ───────────────────────────────────────────────────────────────

    const grouped = voices.reduce((acc, v) => {
        if (!acc[v.model_id]) acc[v.model_id] = [];
        acc[v.model_id].push(v);
        return acc;
    }, {});

    const enabledCount = voices.filter(v => v.enabled).length;

    // ── Loading screen ────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading voice configurations...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">

                {/* Sticky header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-6 py-4 flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <MdRecordVoiceOver className="w-6 h-6 text-red-600" />
                                SiliconFlow Voice Management
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                Control voices, gain, pack assignments, and preview with narration style.
                                <span className="ml-2 font-semibold text-gray-700">{enabledCount} / {voices.length} enabled</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-red-55/60 hover:bg-red-100/80 text-red-600 px-5 py-2.5 rounded-xl text-sm font-bold border border-red-200 transition-all flex items-center gap-1.5 shadow-sm"
                            >
                                <MdRecordVoiceOver className="w-4 h-4" />
                                <span>Add Custom Voice</span>
                            </button>

                            <button
                                onClick={saveAll}
                                disabled={saveStatus === 'saving'}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md ${saveStatus === 'success'
                                        ? 'bg-green-600 text-gray-900 dark:text-white'
                                        : 'bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white disabled:opacity-60'
                                    }`}
                            >
                                {saveStatus === 'saving' && <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Saving...</span></>}
                                {saveStatus === 'success' && <><MdCheckCircle className="w-4 h-4" /><span>Saved!</span></>}
                                {(saveStatus === 'idle' || saveStatus === 'error') && <><MdSave className="w-4 h-4" /><span>Save All</span></>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error banner */}
                {error && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                        <MdWarning className="flex-shrink-0" /> {error}
                    </div>
                )}

                {/* Pack legend */}
                {packs.length > 0 && (
                    <div className="mx-6 mt-4 p-4 bg-white rounded-xl border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Voice Packs (assign voices below)</p>
                        <div className="flex flex-wrap gap-3">
                            {packs.map(p => (
                                <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-500">Pack {p.id}</span>
                                    <input
                                        type="text"
                                        value={p.name}
                                        onChange={e => setPacks(prev => prev.map(pk => pk.id === p.id ? { ...pk, name: e.target.value } : pk))}
                                        className="text-sm text-gray-800 bg-transparent border-b border-dashed border-gray-400 focus:outline-none focus:border-red-500 w-28"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Model sections */}
                <div className="p-6 max-w-6xl mx-auto space-y-8">
                    {Object.entries(grouped).map(([modelId, modelVoices]) => {
                        const meta = MODEL_META[modelId] || { name: modelId, bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700', headerText: 'text-gray-900', supportsEmotion: false };
                        const enabledInModel = modelVoices.filter(v => v.enabled).length;

                        return (
                            <div key={modelId} className={`rounded-2xl border-2 ${meta.border} overflow-hidden shadow-sm`}>

                                {/* Model header */}
                                <div className={`${meta.bg} px-5 py-4 flex items-center justify-between`}>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className={`font-bold text-lg ${meta.headerText}`}>{meta.name}</h2>
                                            {meta.supportsEmotion && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
                                                    ✨ Expressive narration
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 font-mono mt-0.5">{modelId}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge}`}>
                                            {enabledInModel}/{modelVoices.length} enabled
                                        </span>
                                        <button onClick={() => enableAllInModel(modelId)} className="text-xs text-emerald-700 hover:underline font-medium">Enable all</button>
                                        <button onClick={() => disableAllInModel(modelId)} className="text-xs text-red-600  hover:underline font-medium">Disable all</button>
                                    </div>
                                </div>

                                {/* CosyVoice2 narration note */}
                                {meta.supportsEmotion && (
                                    <div className="bg-purple-50/60 border-b border-purple-100 px-5 py-2 text-xs text-purple-700 flex items-center gap-2">
                                        <span>🎙</span>
                                        Preview uses narration style prompt for realistic storytelling output. Production audio uses the same prefix automatically.
                                    </div>
                                )}

                                {/* Voice cards grid */}
                                <div className="bg-white p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {modelVoices.map(voice => {
                                        const vm = VOICE_META[voice.voice_id] || { emoji: '🎙', label: voice.voice_id, desc: '' };
                                        const key = previewKey(voice.model_id, voice.voice_id);
                                        const pState = previewState[key] || null;
                                        const isPlaying = pState === 'playing';
                                        const isLoading = pState === 'loading';

                                        return (
                                            <div
                                                key={voice.id}
                                                className={`rounded-xl border-2 transition-all ${voice.enabled
                                                        ? 'border-emerald-300 bg-emerald-50/50'
                                                        : 'border-gray-200 bg-gray-50'
                                                    }`}
                                            >
                                                {/* Voice header */}
                                                <div className="flex items-center justify-between px-3 pt-3 pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl">{vm.emoji}</span>
                                                        <div>
                                                            <p className={`text-sm font-bold ${voice.enabled ? 'text-gray-800' : 'text-gray-600 dark:text-gray-500 dark:text-gray-400'}`}>
                                                                {vm.label}
                                                            </p>
                                                            <p className="text-[10px] text-gray-600 dark:text-gray-500 dark:text-gray-400">{vm.desc}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleEnabled(voice.id)}
                                                        className="flex-shrink-0"
                                                        title={voice.enabled ? 'Click to disable' : 'Click to enable'}
                                                    >
                                                        {voice.enabled
                                                            ? <MdToggleOn className="w-8 h-8 text-emerald-500" />
                                                            : <MdToggleOff className="w-8 h-8 text-gray-700 dark:text-gray-300" />}
                                                    </button>
                                                </div>

                                                {/* Gain slider */}
                                                <div className="px-3 pb-2">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
                                                            <MdVolumeUp className="w-3 h-3" /> Gain
                                                        </label>
                                                        <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
                                                            {parseFloat(voice.gain ?? 0) > 0 ? '+' : ''}{parseFloat(voice.gain ?? 0).toFixed(1)} dB
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="-10"
                                                        max="10"
                                                        step="0.5"
                                                        value={voice.gain ?? 0}
                                                        onChange={e => setGain(voice.id, e.target.value)}
                                                        className="w-full h-1.5 accent-red-500 cursor-pointer"
                                                    />
                                                    <div className="flex justify-between text-[9px] text-gray-700 dark:text-gray-300 mt-0.5">
                                                        <span>-10dB</span><span>0</span><span>+10dB</span>
                                                    </div>
                                                </div>

                                                {/* Pack assignment */}
                                                {packs.length > 0 && (
                                                    <div className="px-3 pb-2">
                                                        <p className="text-[9px] text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1.5">Assign to packs</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {packs.map(p => {
                                                                const assigned = voice.pack_ids?.includes(p.id);
                                                                return (
                                                                    <button
                                                                        key={p.id}
                                                                        onClick={() => togglePackAssignment(voice.id, p.id)}
                                                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${assigned
                                                                                ? 'bg-red-500 border-red-500 text-gray-900 dark:text-white'
                                                                                : 'bg-white border-gray-300 text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:border-red-300'
                                                                            }`}
                                                                    >
                                                                        {p.name}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action buttons */}
                                                <div className="px-3 pb-3 flex gap-2">
                                                    <button
                                                        onClick={() => previewVoice(voice.model_id, voice.voice_id)}
                                                        disabled={isLoading}
                                                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${isPlaying
                                                                ? 'bg-red-100 border border-red-300 text-red-700 hover:bg-red-200'
                                                                : isLoading
                                                                    ? 'bg-gray-100 border border-gray-200 text-gray-600 dark:text-gray-500 dark:text-gray-400 cursor-wait'
                                                                    : 'bg-white border border-gray-200 text-gray-600 dark:text-gray-500 hover:border-gray-400 hover:text-gray-800'
                                                            }`}
                                                    >
                                                        {isLoading && <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />}
                                                        {isPlaying && <MdStop className="w-3.5 h-3.5" />}
                                                        {!isLoading && !isPlaying && <MdPlayArrow className="w-3.5 h-3.5" />}
                                                        <span>{isLoading ? 'Loading...' : isPlaying ? 'Stop' : 'Preview'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Custom Voice Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden border border-gray-150 animate-scale-up">
                        <div className="bg-gradient-to-r from-red-650 to-red-550 text-gray-900 dark:text-white px-6 py-4 flex items-center justify-between">
                            <h3 className="font-bold text-base flex items-center gap-2">
                                <MdRecordVoiceOver className="w-5 h-5" />
                                Add Custom Voice
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setError('');
                                }}
                                className="text-gray-900 dark:text-white/80 hover:text-gray-900 dark:text-white text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleAddVoice} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                                    <MdWarning className="flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Select Voice Engine</label>
                                <select
                                    value={newVoiceModel}
                                    onChange={(e) => {
                                        setNewVoiceModel(e.target.value);
                                        setError('');
                                    }}
                                    className="w-full bg-gray-50 border border-gray-250 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-750 focus:ring-2 focus:ring-red-500 outline-none"
                                >
                                    <option value="hexgrad/Kokoro-82M">♊ Kokoro (82M) Offline</option>
                                    <option value="coqui/xtts-v2">🗣 Coqui XTTS v2 Offline</option>
                                    <option value="F5-TTS">🤖 F5-TTS Zero-Shot Cloner (Requires Upload)</option>
                                    <option value="resemble/chatterbox">🎙 Resemble AI Chatterbox (Requires Upload)</option>
                                    <option value="FunAudioLLM/CosyVoice2-0.5B">⚡ CosyVoice2-0.5B (SiliconFlow)</option>
                                    <option value="fishaudio/fish-speech-1.5">🐟 Fish Speech 1.5 (SiliconFlow)</option>
                                    <option value="IndexTeam/IndexTTS-2">📊 IndexTTS-2 (SiliconFlow)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Display Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Emily (Calm Narration)"
                                    value={newVoiceName}
                                    onChange={(e) => setNewVoiceName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-250 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-red-500 outline-none"
                                    required
                                />
                            </div>

                            {MODEL_META[newVoiceModel]?.isCloning ? (
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                        Voice Reference Audio (.wav / .mp3)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-250 hover:border-red-300 rounded-xl p-4 bg-gray-50/50 transition-colors text-center relative cursor-pointer">
                                        <input
                                            type="file"
                                            accept="audio/*"
                                            onChange={(e) => setNewVoiceFile(e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            required
                                        />
                                        <div className="text-gray-500 dark:text-gray-400">
                                            <p className="text-xs font-bold mb-1">
                                                {newVoiceFile ? `Selected: ${newVoiceFile.name}` : 'Click to Upload Reference Audio'}
                                            </p>
                                            <p className="text-[10px] text-gray-450">Recommended: 5 to 10 seconds of clear, noise-free speech</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Voice Identifier (voice_id)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. af_bella"
                                        value={newVoiceId}
                                        onChange={(e) => setNewVoiceId(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-250 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-red-500 outline-none"
                                        required
                                    />
                                </div>
                            )}

                            <div className="pt-4 flex gap-3 justify-end border-t border-gray-150">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setError('');
                                    }}
                                    className="px-4 py-2 border border-gray-250 text-gray-600 dark:text-gray-500 hover:bg-gray-50 font-bold rounded-xl text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addingVoice}
                                    className="px-5 py-2 bg-red-650 hover:bg-red-750 disabled:opacity-60 text-gray-900 dark:text-white font-bold rounded-xl text-sm transition-colors shadow-md flex items-center gap-1.5"
                                >
                                    {addingVoice ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            <span>Adding...</span>
                                        </>
                                    ) : (
                                        <span>Add Voice</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}