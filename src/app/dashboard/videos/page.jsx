"use client";

import { useState, useEffect, useRef } from 'react';
import {
    MdMovie, MdPlayArrow, MdStop, MdDownload, MdDelete,
    MdAutoAwesome, MdSettings, MdClose, MdRefresh,
    MdTimer, MdAspectRatio, MdMusicNote, MdMusicOff,
    MdVideoLibrary, MdStar, MdStarBorder
} from 'react-icons/md';
import Sidebar from '@/components/Sidebar';
import { useNotification } from '@/context/NotificationContext';

const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000');

// ── Model cards shown in the selector ──────────────────────────────────────
const MODEL_TIERS = {
    free: { label: 'FREE', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
    premium: { label: 'PREMIUM', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
};

export default function Videos() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [tab, setTab] = useState('generate'); // 'generate' | 'gallery'
    const { showToast, showConfirm } = useNotification();

    // Generation state
    const [prompt, setPrompt] = useState('');
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [duration, setDuration] = useState(5);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [includeAudio, setIncludeAudio] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState('');
    const [generatedVideo, setGeneratedVideo] = useState(null);
    const [error, setError] = useState('');

    // Image-to-Video States
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    // Gallery state
    const [videos, setVideos] = useState([]);
    const [galleryLoading, setGalleryLoading] = useState(false);
    const [playingId, setPlayingId] = useState(null);

    const eventSourceRef = useRef(null);
    const videoPlayerRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        document.title = 'Videos | AI Studio';
        fetchModels();
        fetchVideos();
        return () => {
            if (eventSourceRef.current) eventSourceRef.current.close();
        };
    }, []);

    // ── Data fetching ──────────────────────────────────────────────────────
    const fetchModels = async () => {
        try {
            const res = await fetch(`${API_URL}/videos/models`);
            const data = await res.json();
            if (data.success && data.models?.length) {
                setModels(data.models);
                setSelectedModel(data.models[0].id);
            }
        } catch (e) {
            console.error('Failed to load video models:', e);
        }
    };

    const fetchVideos = async () => {
        if (!user.id) return;
        setGalleryLoading(true);
        try {
            const res = await fetch(`${API_URL}/videos?user_id=${user.id}`);
            const data = await res.json();
            if (data.success) setVideos(data.videos || []);
        } catch (e) {
            console.error('Failed to load videos:', e);
        } finally {
            setGalleryLoading(false);
        }
    };

    // ── Video Generation (SSE) ─────────────────────────────────────────────
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || generating) return;
        setGenerating(true);
        setProgress(0);
        setStage('Starting...');
        setError('');
        setGeneratedVideo(null);

        try {
            let finalImage = imageUrl;
            if (imageFile) {
                try {
                    finalImage = await fileToBase64(imageFile);
                } catch (e) {
                    setError('Failed to process the uploaded image.');
                    setGenerating(false);
                    return;
                }
            }

            const res = await fetch(`${API_URL}/videos/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    prompt: prompt.trim(),
                    model: selectedModel,
                    duration,
                    aspect_ratio: aspectRatio,
                    audio: includeAudio,
                    image: finalImage,
                }),
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    try {
                        const event = JSON.parse(line.slice(6));
                        setProgress(event.progress || 0);
                        setStage(event.stage || '');

                        if (event.error) {
                            setError(event.error);
                            setGenerating(false);
                            return;
                        }
                        if (event.done && event.video) {
                            setGeneratedVideo(event.video);
                            setGenerating(false);
                            fetchVideos();
                            return;
                        }
                    } catch (pe) {
                        // Ignore incomplete SSE lines
                    }
                }
            }
            setGenerating(false);
        } catch (err) {
            setError('Network error: ' + err.message);
            setGenerating(false);
        }
    };

    const handleDelete = async (uuid) => {
        const confirmed = await showConfirm('Delete Video', 'Delete this video permanently?');
        if (!confirmed) return;
        try {
            const res = await fetch(`${API_URL}/videos/${uuid}?user_id=${user.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showToast('Video deleted successfully.', 'success');
                fetchVideos();
            } else {
                showToast('Error deleting: ' + data.message, 'error');
            }
        } catch (e) {
            console.error('Delete failed:', e);
            showToast('Failed to delete video. Please try again.', 'error');
        }
    };

    // ── Selected model config ─────────────────────────────────────────────
    const currentModel = models.find(m => m.id === selectedModel) || {};
    const tierBadge = MODEL_TIERS[currentModel.tier] || MODEL_TIERS.free;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-white/10 sticky top-0 z-20 transition-colors">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                <MdMovie className="text-purple-500" />
                                Video Generation
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-1">Create AI-powered videos from text prompts</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTab('generate')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                    tab === 'generate'
                                        ? 'bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                                        : 'text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-200 dark:bg-white/5'
                                }`}
                            >
                                <MdAutoAwesome className="inline mr-1" /> Generate
                            </button>
                            <button
                                onClick={() => { setTab('gallery'); fetchVideos(); }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                    tab === 'gallery'
                                        ? 'bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                                        : 'text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-200 dark:bg-white/5'
                                }`}
                            >
                                <MdVideoLibrary className="inline mr-1" /> Gallery ({videos.length})
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 max-w-6xl mx-auto">
                    {/* ════════════════════════════════════════════════════════ */}
                    {/* GENERATE TAB                                           */}
                    {/* ════════════════════════════════════════════════════════ */}
                    {tab === 'generate' && (
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            {/* ── Left: Controls ──────────────── */}
                            <div className="lg:col-span-2 space-y-5">
                                {/* Prompt */}
                                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-5 transition-colors">
                                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-2 block">
                                        Prompt
                                    </label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe the video you want to create..."
                                        rows={4}
                                        maxLength={5000}
                                        className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500/40 resize-none transition-all"
                                    />
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-600 mt-1 text-right">{prompt.length}/5000</p>
                                </div>

                                {/* Image Input for Image-to-Video models */}
                                {currentModel.supports_i2v && (
                                    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-5 transition-colors space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-2 block">
                                                Reference Image
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Paste image URL (from generated images)..."
                                                    value={imageUrl}
                                                    onChange={(e) => {
                                                        setImageUrl(e.target.value);
                                                        setImageFile(null);
                                                        setImagePreview(e.target.value);
                                                    }}
                                                    className="flex-1 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-650 focus:outline-none focus:border-purple-500/40 transition-all"
                                                />
                                                <div className="relative overflow-hidden bg-purple-650 text-gray-900 dark:text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer hover:bg-purple-600 transition-colors flex items-center justify-center">
                                                    <span>Upload</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                setImageFile(file);
                                                                setImageUrl('');
                                                                setImagePreview(URL.createObjectURL(file));
                                                            }
                                                        }}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {imagePreview && (
                                            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 aspect-video bg-black/20">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain"
                                                />
                                                <button
                                                    onClick={() => {
                                                        setImageUrl('');
                                                        setImageFile(null);
                                                        setImagePreview('');
                                                    }}
                                                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-gray-900 dark:text-white rounded-full transition-colors"
                                                    title="Clear Image"
                                                >
                                                    <MdClose className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Model Selector */}
                                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-5 transition-colors">
                                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-3 block">
                                        Model
                                    </label>
                                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                                        {models.map(m => {
                                            const t = MODEL_TIERS[m.tier] || MODEL_TIERS.free;
                                            const selected = m.id === selectedModel;
                                            return (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setSelectedModel(m.id)}
                                                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                                                        selected
                                                            ? 'border-purple-500/40 bg-purple-500/10'
                                                            : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20 hover:border-gray-300 dark:hover:border-white/20'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{m.name}</span>
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${t.color}`}>
                                                            {t.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400">{m.description}</p>
                                                </button>
                                            );
                                        })}
                                        {models.length === 0 && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 text-center py-4">
                                                No models available. Check Admin Settings.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Settings Row */}
                                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-5 transition-colors">
                                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-3 block">
                                        Settings
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Duration */}
                                        <div>
                                            <label className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400 flex items-center gap-1 mb-1">
                                                <MdTimer className="w-3 h-3" /> Duration
                                            </label>
                                            <select
                                                value={duration}
                                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/30"
                                            >
                                                <option value={3} className="bg-white dark:bg-[#111111] text-gray-900 dark:text-white">3 seconds</option>
                                                <option value={5} className="bg-white dark:bg-[#111111] text-gray-900 dark:text-white">5 seconds</option>
                                                <option value={8} className="bg-white dark:bg-[#111111] text-gray-900 dark:text-white">8 seconds</option>
                                                <option value={10} className="bg-white dark:bg-[#111111] text-gray-900 dark:text-white">10 seconds</option>
                                            </select>
                                        </div>
                                        {/* Aspect Ratio */}
                                        <div>
                                            <label className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400 flex items-center gap-1 mb-1">
                                                <MdAspectRatio className="w-3 h-3" /> Aspect Ratio
                                            </label>
                                            <select
                                                value={aspectRatio}
                                                onChange={(e) => setAspectRatio(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/30"
                                            >
                                                <option value="16:9" className="bg-white dark:bg-[#111111] text-gray-900 dark:text-white">16:9 Landscape</option>
                                                <option value="9:16" className="bg-white dark:bg-[#111111] text-gray-900 dark:text-white">9:16 Portrait</option>
                                                <option value="1:1" className="bg-white dark:bg-[#111111] text-gray-900 dark:text-white">1:1 Square</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Audio toggle */}
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400 flex items-center gap-1">
                                            {includeAudio ? <MdMusicNote className="w-3 h-3 text-purple-500 dark:text-purple-400" /> : <MdMusicOff className="w-3 h-3" />}
                                            AI Soundtrack
                                        </span>
                                        <button
                                            onClick={() => setIncludeAudio(!includeAudio)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                includeAudio ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
                                            }`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                includeAudio ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <button
                                    onClick={handleGenerate}
                                    disabled={generating || !prompt.trim() || models.length === 0 || (currentModel.supports_i2v && !imageUrl && !imageFile)}
                                    className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 text-gray-900 dark:text-white"
                                >
                                    {generating ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                            Generating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <MdAutoAwesome /> Generate Video
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* ── Right: Preview / Progress ───── */}
                            <div className="lg:col-span-3">
                                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden min-h-[400px] flex flex-col transition-colors">
                                    {/* Progress bar */}
                                    {generating && (
                                        <div className="p-5 border-b border-gray-150 dark:border-white/5">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">{stage}</span>
                                                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 dark:text-gray-400">{progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 dark:bg-black/40 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Error display */}
                                    {error && (
                                        <div className="m-5 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                                            <p className="text-xs text-red-600 dark:text-red-400 font-bold">{error}</p>
                                        </div>
                                    )}

                                    {/* Video player / Placeholder */}
                                    <div className="flex-1 flex items-center justify-center p-5">
                                        {generatedVideo ? (
                                            <div className="w-full space-y-4">
                                                <video
                                                    ref={videoPlayerRef}
                                                    src={generatedVideo.url}
                                                    controls
                                                    autoPlay
                                                    className="w-full rounded-xl max-h-[500px] bg-black"
                                                />
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">
                                                            {generatedVideo.model} • {generatedVideo.duration}s • {generatedVideo.file_size_mb}MB
                                                        </p>
                                                    </div>
                                                    <a
                                                        href={generatedVideo.url}
                                                        download
                                                        className="flex items-center gap-1 px-4 py-2 bg-purple-600/20 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-600/30 transition-all border border-purple-500/20"
                                                    >
                                                        <MdDownload /> Download
                                                    </a>
                                                </div>
                                            </div>
                                        ) : !generating ? (
                                            <div className="text-center">
                                                <MdMovie className="w-16 h-16 text-gray-700 dark:text-gray-300 dark:text-gray-800 mx-auto mb-4" />
                                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 dark:text-gray-400 mb-1">No video yet</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">
                                                    Write a prompt and hit Generate to create your first video.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="relative mx-auto w-20 h-20 mb-4">
                                                    <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
                                                    <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin" />
                                                    <MdMovie className="absolute inset-0 m-auto w-8 h-8 text-purple-500" />
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 font-bold uppercase tracking-widest">
                                                    {stage || 'Processing...'}
                                                </p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-600 mt-1">
                                                    This can take 30–120 seconds depending on the model
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════ */}
                    {/* GALLERY TAB                                            */}
                    {/* ════════════════════════════════════════════════════════ */}
                    {tab === 'gallery' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-widest">
                                    Your Videos ({videos.length})
                                </h2>
                                <button
                                    onClick={fetchVideos}
                                    className="p-2 text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white transition-all bg-gray-100 dark:bg-white/5 rounded-lg"
                                >
                                    <MdRefresh className={galleryLoading ? 'animate-spin' : ''} />
                                </button>
                            </div>

                            {galleryLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
                                </div>
                            ) : videos.length === 0 ? (
                                <div className="text-center py-20">
                                    <MdVideoLibrary className="w-16 h-16 text-gray-700 dark:text-gray-300 dark:text-gray-800 mx-auto mb-4" />
                                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 dark:text-gray-400 mb-1">No videos yet</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">Generated videos will appear here.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {videos.map(v => (
                                        <div
                                            key={v.uuid || v.id}
                                            className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden group hover:border-purple-500/20 shadow-sm hover:shadow-md transition-all transition-colors"
                                        >
                                            {/* Video / Thumbnail */}
                                            <div className="relative bg-black aspect-video">
                                                {v.url ? (
                                                    <video
                                                        src={v.url}
                                                        className="w-full h-full object-cover"
                                                        controls={playingId === v.uuid}
                                                        autoPlay={playingId === v.uuid}
                                                        onClick={() => setPlayingId(playingId === v.uuid ? null : v.uuid)}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full ${
                                                            v.status === 'generating'
                                                                ? 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10'
                                                                : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
                                                        }`}>
                                                            {v.status}
                                                        </span>
                                                    </div>
                                                )}

                                                {v.url && playingId !== v.uuid && (
                                                    <button
                                                        onClick={() => setPlayingId(v.uuid)}
                                                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <MdPlayArrow className="w-12 h-12 text-gray-900 dark:text-white" />
                                                    </button>
                                                )}

                                                {/* Duration badge */}
                                                <span className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-gray-900 dark:text-white font-mono">
                                                    {v.duration}s
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div className="p-4">
                                                <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 mb-2 leading-relaxed">
                                                    {v.prompt}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400">
                                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded-full">{v.model}</span>
                                                        {v.file_size_mb && <span>{v.file_size_mb}MB</span>}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {v.url && (
                                                            <a
                                                                href={v.url}
                                                                download
                                                                className="p-1.5 text-gray-600 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                                                title="Download"
                                                            >
                                                                <MdDownload className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(v.uuid)}
                                                            className="p-1.5 text-gray-600 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <MdDelete className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
