"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { MdAdd, MdDownload, MdDelete, MdZoomIn, MdClose, MdImage, MdAutoAwesome, MdArrowBack, MdFolder, MdLock, MdRefresh } from 'react-icons/md';
import Sidebar from '@/components/Sidebar';
import { Key } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

export default function Images() {
    const pathname = usePathname();
    const router = useRouter();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [scripts, setScripts] = useState([]);
    const [loadingScripts, setLoadingScripts] = useState(false);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    // View State: 'albums' | 'album-details'
    const [viewMode, setViewMode] = useState('albums');
    const [selectedAlbumId, setSelectedAlbumId] = useState(null);

    // Image Generation Engine State
    const [preferredEngine, setPreferredEngine] = useState(() => localStorage.getItem('preferred_image_engine') || 'auto');

    // Limit error modal
    const [limitError, setLimitError] = useState(null); // null or string message

    // Intercept Router state to auto-open album or preset script
    useEffect(() => {
        if (location.state) {
            if (location.state.selectedAlbumId) {
                setSelectedAlbumId(location.state.selectedAlbumId);
                setViewMode('album-details');
            }
            if (location.state.presetScriptId) {
                setFormData(prev => ({ ...prev, script_id: location.state.presetScriptId }));
                setShowModal(true);
            }
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);

    // Sequential Generation State
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);
    const [generatingId, setGeneratingId] = useState(null);

    // Visual Bible State
    const [isBuildingBible, setIsBuildingBible] = useState(false);
    const [visualBible, setVisualBible] = useState(null);
    const { showToast, showConfirm, showQuotaModal } = useNotification();

    const [formData, setFormData] = useState({
        script_id: '',
        scene_number: 1
    });

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');

    // ── HELPER: Prevent Mixed-Content Browser Block ──
    // Upgrades cPanel/Passenger backend HTTP urls to HTTPS on live secure domains
    const getSecureUrl = (url) => {
        if (!url) return '';
        if (window.location.protocol === 'https:' && url.startsWith('http://')) {
            if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
                return url.replace('http://', 'https://');
            }
        }
        return url;
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchPrompts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/images/prompts?user_id=${user.id}`);
            const data = await response.json();
            if (data.success) {
                setImages(data.prompts);
            }
        } catch (err) {
            console.error('Error fetching prompts:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchScripts = async () => {
        try {
            setLoadingScripts(true);
            const response = await fetch(`${API_URL}/scripts?user_id=${user.id}`);
            const data = await response.json();
            if (data.success) {
                setScripts(data.scripts.filter(s => s.status === 'completed'));
            }
        } catch (err) {
            console.error('Error fetching scripts:', err);
        } finally {
            setLoadingScripts(false);
        }
    };

    useEffect(() => {
        fetchScripts();
        fetchPrompts();
    }, []);

    const getAvailableScenes = () => {
        if (!formData.script_id) return [];
        const selectedScript = scripts.find(s => 
            s.id.toString() === formData.script_id.toString() || 
            (s.uuid && s.uuid === formData.script_id.toString())
        );
        if (!selectedScript) return [];

        try {
            const content = typeof selectedScript.content === 'string'
                ? JSON.parse(selectedScript.content)
                : selectedScript.content;
            if (content && content.scenes) return content.scenes;
        } catch (e) {
            console.error("Error parsing script scenes", e);
        }
        return [];
    };

    useEffect(() => {
        if (formData.script_id) {
            const scriptImages = images.filter(img => String(img.script_id) === String(formData.script_id));
            const existingScenes = scriptImages.map(img => img.scene_number);
            const highestScene = existingScenes.length > 0 ? Math.max(...existingScenes) : 0;
            const available = getAvailableScenes();
            const maxScenes = available.length || 1;
            const nextScene = Math.min(highestScene + 1, maxScenes);
            setFormData(prev => ({ ...prev, scene_number: nextScene }));

            // Also check for existing bible
            const selectedScript = scripts.find(s => s.id.toString() === formData.script_id.toString());
            if (selectedScript?.visual_bible) {
                try {
                    setVisualBible(typeof selectedScript.visual_bible === 'string' ? JSON.parse(selectedScript.visual_bible) : selectedScript.visual_bible);
                } catch(e) { setVisualBible(null); }
            } else {
                setVisualBible(null);
            }
        }
    }, [formData.script_id, scripts]);

    const handleBuildBible = async () => {
        if (!formData.script_id) return;
        setIsBuildingBible(true);
        try {
            const response = await fetch(`${API_URL}/images/build-bible`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script_id: formData.script_id, user_id: user.id })
            });
            const data = await response.json();
            if (data.success) {
                setVisualBible(data.bible);
                // Update scripts list locally so we don't refetch
                setScripts(prev => prev.map(s => s.id.toString() === formData.script_id.toString() ? { ...s, visual_bible: data.bible } : s));
            } else {
                const message = data.message || '';
                const isQuotaError = response.status === 429 || 
                    message.toLowerCase().includes('quota') || 
                    message.toLowerCase().includes('resource_exhausted') || 
                    message.toLowerCase().includes('429') ||
                    message.toLowerCase().includes('rate_limit') ||
                    message.toLowerCase().includes('rate limit');

                if (isQuotaError) {
                    showQuotaModal(message || "You've exceeded your Gemini API Key free tier quota. Please change or update your API Key in Settings to continue.");
                } else {
                    showToast('Error creating visual identity: ' + message, 'error');
                }
            }
        } catch (error) {
            console.error('Error building bible:', error);
        } finally {
            setIsBuildingBible(false);
        }
    };

    const handleGeneratePrompts = async (e) => {
        e.preventDefault();
        
        const currentScript = scripts.find(s => 
            s.id.toString() === formData.script_id.toString() || 
            (s.uuid && s.uuid === formData.script_id.toString())
        );

        // 1. Check if bible exists, if not build it first
        if (!visualBible && !currentScript?.visual_bible) {
            const confirmed = await showConfirm(
                "Create Visual Identity", 
                "This script doesn't have a Visual Identity (Faces & Environments) yet. Create it now for consistency?"
            );
            if (confirmed) {
                await handleBuildBible();
            }
        }

        setIsGeneratingPrompts(true);
        
        try {
            const response = await fetch(`${API_URL}/images/generate-prompts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script_id: currentScript?.id, 
                    user_id: user.id,
                    scene_number: formData.scene_number
                })
            });

            const data = await response.json();

            if (data.success && data.prompts) {
                fetchPrompts();

                const currentScenes = getAvailableScenes();
                const nextScene = Math.min(formData.scene_number + 1, currentScenes.length || 1);
                setFormData(prev => ({ ...prev, scene_number: nextScene }));

                if (viewMode === 'albums') {
                    setSelectedAlbumId(parseInt(formData.script_id));
                    setViewMode('album-details');
                }
                showToast(`Successfully generated 4 cinematic prompts for Scene ${formData.scene_number}!`, 'success');
            } else {
                const message = data.message || '';
                const isQuotaError = response.status === 429 || 
                    message.toLowerCase().includes('quota') || 
                    message.toLowerCase().includes('resource_exhausted') || 
                    message.toLowerCase().includes('429') ||
                    message.toLowerCase().includes('rate_limit') ||
                    message.toLowerCase().includes('rate limit');

                if (isQuotaError) {
                    showQuotaModal(message || "You've exceeded your Gemini API Key free tier quota. Please change or update your API Key in Settings to continue.");
                } else {
                    showToast('Error: ' + message, 'error');
                }
            }
        } catch (error) {
            console.error('Error generating prompts:', error);
            showToast('Error generating prompts. Please try again.', 'error');
        } finally {
            setIsGeneratingPrompts(false);
        }
    };

    const deletePrompt = async (id) => {
        const confirmed = await showConfirm(
            "Delete Prompt",
            "Are you sure you want to delete this prompt and its image?"
        );
        if (!confirmed) return;
        try {
            setImages(images.filter(img => img.id !== id));
            await fetch(`${API_URL}/images/prompts/${id}`, { method: 'DELETE' });
            showToast('Prompt deleted successfully.', 'success');
        } catch (e) {
            console.error('Failed to delete prompt');
            showToast('Failed to delete prompt.', 'error');
        }
    };

    const generateSingleImage = async (promptId) => {
        if (isGeneratingImages) return;
        setGeneratingId(promptId);

        try {
            const response = await fetch(`${API_URL}/images/generate/${promptId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user_id: user.id,
                    provider: preferredEngine
                })
            });
            const data = await response.json();

            if (data.success) {
                setImages(prev => prev.map(img =>
                    img.id === promptId
                        ? { ...img, status: 'completed', image_url: data.image_url }
                        : img
                ));
                return true;
            } else {
                // Check if it's a limit/plan error — show modal instead of console
                const isLimitError = data.message && (
                    data.message.toLowerCase().includes('limit') ||
                    data.message.toLowerCase().includes('plan') ||
                    data.message.toLowerCase().includes('upgrade') ||
                    data.message.toLowerCase().includes('reached')
                );

                if (isLimitError) {
                    setLimitError(data.message);
                } else {
                    // Generic failure — mark card as failed, no modal
                    setImages(prev => prev.map(img =>
                        img.id === promptId ? { ...img, status: 'failed' } : img
                    ));
                }
                return false;
            }
        } catch (err) {
            console.error("Network error during image generation", err);
            setImages(prev => prev.map(img =>
                img.id === promptId ? { ...img, status: 'failed' } : img
            ));
            return false;
        } finally {
            setGeneratingId(null);
        }
    };

    const handleGenerateAllRemaining = async (specificScriptId = null) => {
        if (isGeneratingImages) return;
        setIsGeneratingImages(true);

        const pendingPrompts = images.filter(img =>
            img.status === 'pending' &&
            (specificScriptId ? String(img.script_id) === String(specificScriptId) : true)
        );

        if (pendingPrompts.length === 0) {
            showToast('No pending image generations found!', 'warning');
            setIsGeneratingImages(false);
            return;
        }

        let successCount = 0;

        for (const prompt of pendingPrompts) {
            const result = await generateSingleImage(prompt.id);
            if (result) {
                successCount++;
            } else {
                // Stop the sequence — either limit hit (modal shown) or error (card marked failed)
                break;
            }
        }

        setIsGeneratingImages(false);

        if (successCount > 0 && !limitError) {
            showToast(`Done! Successfully generated ${successCount} image${successCount > 1 ? 's' : ''}.`, 'success');
        }
    };

    const handleDownloadImage = async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'download.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (e) {
            console.error('Download failed', e);
            window.open(url, '_blank');
        }
    };

    const downloadGroup = async (groupImages, groupName) => {
        const completed = groupImages.filter(img => img.status === 'completed' && img.image_url);
        if (completed.length === 0) return showToast('No generated images in this group to download!', 'warning');

        showToast(`Starting download of ${completed.length} images...`, 'info');
        for (let i = 0; i < completed.length; i++) {
            const img = completed[i];
            const secureUrl = getSecureUrl(img.image_url);
            const filename = `${groupName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_scene_${img.scene_number}_${i + 1}.jpg`;
            await handleDownloadImage(secureUrl, filename);
            await new Promise(r => setTimeout(r, 600));
        }
    };

    // View Computed Data
    const scriptsWithImages = scripts.map(script => {
        const scriptPrompts = images.filter(img => String(img.script_id) === String(script.id));
        return { ...script, prompts: scriptPrompts };
    }).filter(script => script.prompts.length > 0);

    const activeAlbum = selectedAlbumId ? scripts.find(s => s.id === selectedAlbumId) : null;
    const activeAlbumImages = activeAlbum
        ? images.filter(img => String(img.script_id) === String(activeAlbum.id))
        : [];

    const scenesInAlbum = [...new Set(activeAlbumImages.map(img => img.scene_number))].sort((a, b) => a - b);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto relative pb-20">

                {/* ── Header ── */}
                <div className="bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-white/10 sticky top-0 z-10 transition-colors">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                {viewMode === 'album-details' && (
                                    <button
                                        onClick={() => setViewMode('albums')}
                                        className="p-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-gray-200/50 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-full transition-colors shrink-0"
                                    >
                                        <MdArrowBack className="w-5 h-5" />
                                    </button>
                                )}
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {viewMode === 'albums' ? 'Image Albums' : activeAlbum?.title || 'Album Details'}
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                        {viewMode === 'albums'
                                            ? 'Organized grouped frames for your scripts'
                                            : `${activeAlbumImages.length} Prompts • Generated sequentially`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                                <select
                                    value={preferredEngine}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setPreferredEngine(val);
                                        localStorage.setItem('preferred_image_engine', val);
                                        showToast(`Image generator switched to ${val === 'auto' ? 'Auto (Flux/Pollinations)' : val.toUpperCase()}`, 'info');
                                    }}
                                    className="bg-white dark:bg-[#111111] border border-gray-250 dark:border-white/10 rounded-lg px-2.5 py-2 text-xs font-semibold focus:ring-1 focus:ring-purple-500 outline-none text-gray-700 dark:text-gray-200"
                                >
                                    <option value="auto">🤖 Auto (Flux/Pollinations)</option>
                                    <option value="gemini">♊ Gemini Imagen 3</option>
                                    <option value="siliconflow">⚡ Flux.1 Schnell (SiliconFlow)</option>
                                    <option value="pollinations">🎨 Pollinations AI</option>
                                </select>

                                {viewMode === 'albums' && images.some(i => i.status === 'pending') && (
                                    <button
                                        onClick={() => handleGenerateAllRemaining(null)}
                                        disabled={isGeneratingImages}
                                        className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <MdAutoAwesome className={`w-4 h-4 ${isGeneratingImages ? 'animate-spin' : ''}`} />
                                        <span className="hidden sm:inline">{isGeneratingImages ? 'Sequencing...' : 'Generate All Pending'}</span>
                                        <span className="sm:hidden">{isGeneratingImages ? 'Wait...' : 'Gen All'}</span>
                                    </button>
                                )}

                                {viewMode === 'album-details' && activeAlbumImages.some(i => i.status === 'pending') && (
                                    <button
                                        onClick={() => handleGenerateAllRemaining(activeAlbum.id)}
                                        disabled={isGeneratingImages}
                                        className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <MdAutoAwesome className={`w-4 h-4 ${isGeneratingImages ? 'animate-spin' : ''}`} />
                                        <span className="hidden sm:inline">{isGeneratingImages ? 'Sequencing Album...' : 'Generate Album'}</span>
                                        <span className="sm:hidden">{isGeneratingImages ? 'Wait...' : 'Gen Album'}</span>
                                    </button>
                                )}

                                {viewMode === 'album-details' && (
                                    <button
                                        onClick={() => downloadGroup(activeAlbumImages, activeAlbum?.title || 'Album')}
                                        className="bg-purple-50 border border-purple-250 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <MdDownload className="w-4 h-4" />
                                        <span className="hidden sm:inline">Download Album</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        if (viewMode === 'album-details') {
                                            setFormData({ ...formData, script_id: activeAlbum.id });
                                        }
                                        setShowModal(true);
                                    }}
                                    className="bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 justify-center shadow-sm"
                                >
                                    <MdAdd className="w-4 h-4" />
                                    <span className="hidden sm:inline">Extract Prompts</span>
                                    <span className="sm:hidden">Extract</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main Content ── */}
                <div className="p-4 sm:p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading image library...</p>
                        </div>

                    ) : images.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-[#111111] rounded-xl border border-dashed border-gray-250 dark:border-white/20 shadow-sm max-w-2xl mx-auto flex flex-col items-center">
                            <MdFolder className="w-16 h-16 text-gray-600 dark:text-gray-500 dark:text-gray-400 mb-3" />
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">No Image Albums Yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mt-2 mb-6">
                                Extract highly detailed descriptive generation prompts directly from the scenes in your scripts to automatically create organized albums!
                            </p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors animate-pulse"
                            >
                                Extract Scene Prompts First
                            </button>
                        </div>

                    ) : viewMode === 'albums' ? (
                        /* ── Albums Grid ── */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
                            {scriptsWithImages.map(album => {
                                const completedCount = album.prompts.filter(p => p.status === 'completed').length;
                                const firstCompleted = album.prompts.find(p => p.status === 'completed' && p.image_url);

                                return (
                                    <div
                                        key={album.id}
                                        onClick={() => { setSelectedAlbumId(album.id); setViewMode('album-details'); }}
                                        className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 hover:border-purple-300 hover:shadow-lg transition-all overflow-hidden cursor-pointer group flex flex-col"
                                    >
                                        <div className="aspect-video bg-gray-100 dark:bg-white/5 relative overflow-hidden flex items-center justify-center">
                                            {firstCompleted ? (
                                                <img
                                                    src={getSecureUrl(firstCompleted.image_url)}
                                                    alt="Cover"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <MdFolder className="w-16 h-16 text-gray-600 dark:text-gray-500 dark:text-gray-400 group-hover:text-purple-400 transition-colors" />
                                            )}
                                        </div>
                                        <div className="p-4 flex-1">
                                            <h3 className="font-bold text-gray-950 dark:text-white line-clamp-1">{album.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                                <MdImage className="w-4 h-4 text-gray-600 dark:text-gray-500 dark:text-gray-400" />
                                                <span>{completedCount} / {album.prompts.length} Images</span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    ) : (
                        /* ── Album Detail ── */
                        <div className="space-y-10">
                            {scenesInAlbum.map(sceneNumber => {
                                const sceneImages = activeAlbumImages.filter(img => img.scene_number === sceneNumber);

                                return (
                                    <div key={sceneNumber} className="bg-white dark:bg-[#111111] p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                                        {/* Scene Header */}
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 border-b border-gray-150 dark:border-white/5 pb-4 gap-4">
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-950 dark:text-white">Scene {sceneNumber}</h2>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Contains {sceneImages.length} generative frames</p>
                                            </div>
                                            <button
                                                onClick={() => downloadGroup(sceneImages, `${activeAlbum?.title}_scene_${sceneNumber}`)}
                                                className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-250 dark:hover:bg-gray-200/50 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors w-fit"
                                            >
                                                <MdDownload className="w-4 h-4" />
                                                Download Scene
                                            </button>
                                        </div>

                                        {/* Scene Images Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
                                            {sceneImages.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={`bg-white dark:bg-[#111111] rounded-xl border transition-all overflow-hidden flex flex-col ${generatingId === item.id
                                                        ? 'border-purple-400 shadow-lg ring-1 ring-purple-100 dark:ring-purple-950/30'
                                                        : 'border-gray-200 dark:border-white/10 hover:shadow-md'
                                                        }`}
                                                >
                                                    {/* Image / Placeholder */}
                                                    <div className="aspect-video bg-gray-100 dark:bg-white/5 relative group overflow-hidden">
                                                        {item.status === 'completed' && item.image_url ? (
                                                            <>
                                                                <img
                                                                    src={getSecureUrl(item.image_url)}
                                                                    alt={item.title}
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                                    <a
                                                                        href={getSecureUrl(item.image_url)}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="p-2.5 bg-gray-50 dark:bg-[#111111]/90 hover:bg-gray-50 dark:bg-[#111111] text-gray-900 dark:text-white rounded-full transition-transform hover:scale-110"
                                                                    >
                                                                        <MdZoomIn className="w-5 h-5" />
                                                                    </a>
                                                                    <button
                                                                        onClick={() => handleDownloadImage(getSecureUrl(item.image_url), `${activeAlbum?.title}_scene${sceneNumber}_${item.id}.jpg`)}
                                                                        className="p-2.5 bg-purple-600 hover:bg-purple-500 text-gray-900 dark:text-white rounded-full transition-transform hover:scale-110"
                                                                        title="Download Image"
                                                                    >
                                                                        <MdDownload className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => generateSingleImage(item.id)}
                                                                        className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-gray-900 dark:text-white rounded-full transition-transform hover:scale-110"
                                                                        title="Regenerate Image"
                                                                    >
                                                                        <MdRefresh className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </>
                                                        ) : generatingId === item.id ? (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-purple-55 dark:bg-purple-950/20">
                                                                <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                                                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 mt-3 animate-pulse">Rendering Image...</span>
                                                            </div>
                                                        ) : (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/5 p-2 text-center">
                                                                <div className="w-12 h-12 bg-white dark:bg-[#111111] rounded-full shadow-sm flex items-center justify-center mb-2 text-gray-600 dark:text-gray-500 dark:text-gray-400 dark:text-gray-300">
                                                                    <MdImage className="w-6 h-6" />
                                                                </div>
                                                                {item.status === 'failed' ? (
                                                                    <span className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-955/25 px-3 py-1 rounded-full border border-red-100 dark:border-red-900/30">
                                                                        Generation Failed
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => generateSingleImage(item.id)}
                                                                        disabled={isGeneratingImages}
                                                                        className="flex items-center justify-center w-fit mx-auto gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/25 hover:bg-purple-100 dark:hover:bg-purple-900/30 px-3 py-2 border border-purple-100 dark:border-purple-800/30 transition-colors rounded-full"
                                                                    >
                                                                        <MdAutoAwesome className="w-3.5 h-3.5" />
                                                                        Generate Image
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Status badge */}
                                                        <div className="absolute top-2 right-2">
                                                            {item.status === 'completed' && (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded shadow text-green-700 bg-green-50 border border-green-200">
                                                                    RENDERED
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Info */}
                                                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                                                        <div className="flex justify-between items-start mb-2 border-b border-gray-150 dark:border-white/5 pb-2">
                                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight truncate pr-2" title={item.title}>
                                                                {item.title}
                                                            </h3>
                                                            <button
                                                                onClick={() => deletePrompt(item.id)}
                                                                className="text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                                            >
                                                                <MdDelete className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        <div className="flex-1 mt-1">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 leading-relaxed font-medium line-clamp-3" title={item.prompt}>
                                                                "{item.prompt}"
                                                            </p>
                                                        </div>

                                                        <div className="mt-4 pt-3 border-t border-gray-150 dark:border-white/5 flex items-center justify-between">
                                                            {item.status === 'failed' && (
                                                                <button
                                                                    onClick={() => generateSingleImage(item.id)}
                                                                    className="text-[10px] font-bold text-red-600 hover:underline"
                                                                >
                                                                    Retry Render
                                                                </button>
                                                            )}
                                                            {item.status === 'completed' && (
                                                                <button
                                                                    onClick={() => generateSingleImage(item.id)}
                                                                    className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                                                                >
                                                                    Regenerate
                                                                </button>
                                                            )}
                                                            {item.status === 'pending' && (
                                                                <span className="text-[10px] text-gray-600 dark:text-gray-500 dark:text-gray-400 hidden sm:inline">
                                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={() => navigator.clipboard.writeText(item.prompt).then(() => showToast('Copied prompt to clipboard!', 'success'))}
                                                                className="text-[10px] sm:text-xs font-bold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-gray-200/50 dark:bg-white/10 px-2 py-1.5 rounded text-gray-600 dark:text-gray-500 dark:text-gray-300 transition-colors ml-auto"
                                                            >
                                                                COPY PROMPT
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Limit Reached Modal ── */}
            {limitError && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#111111] rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10 transition-colors">
                        {/* Top accent */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 text-gray-900 dark:text-white text-center">
                            <div className="w-14 h-14 bg-black/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <MdLock className="w-7 h-7 text-gray-900 dark:text-white" />
                            </div>
                            <h2 className="text-lg font-bold">Generation Limit Reached</h2>
                            <p className="text-sm text-orange-100 mt-1">You've hit your current plan's image quota</p>
                        </div>

                        {/* Body */}
                        <div className="p-6 text-center">
                            <p className="text-gray-700 dark:text-gray-305 text-sm leading-relaxed mb-6">
                                {limitError}
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setLimitError(null);
                                        router.push('/dashboard/plans');
                                    }}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-gray-900 dark:text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
                                >
                                    View Available Plans
                                </button>
                                <button
                                    onClick={() => setLimitError(null)}
                                    className="w-full py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-gray-200/50 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gemini API Quota Exhausted Warning Modal is now handled globally */}

            {/* ── Prompt Generation Modal ── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-[#111111] rounded-2xl max-w-lg w-full overflow-hidden my-auto border border-gray-250 dark:border-white/10 shadow-2xl transition-colors">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 sm:p-6 text-gray-900 dark:text-white flex justify-between items-start">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Extract Scene Prompts</h2>
                                <p className="text-purple-100 text-xs sm:text-sm mt-1 opacity-90">
                                    Generate AI prompts based on your custom script scenes.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 bg-black/20 hover:bg-gray-200 dark:bg-black/30 rounded-full transition-colors shrink-0"
                            >
                                <MdClose className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 sm:p-6">
                            <form onSubmit={handleGeneratePrompts} className="space-y-4 sm:space-y-5">

                                {/* Script Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Source Script</label>
                                    <select
                                        required
                                        value={formData.script_id}
                                        onChange={(e) => setFormData({ ...formData, script_id: e.target.value })}
                                        disabled={loadingScripts}
                                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-250 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-sm text-gray-900 dark:text-white"
                                    >
                                        <option value="">-- Choose a Completed Script --</option>
                                        {scripts.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.title} ({s.niche_name || 'General'})
                                            </option>
                                        ))}
                                    </select>
                                    {scripts.length === 0 && !loadingScripts && (
                                        <p className="text-xs text-red-500 mt-2 font-medium">
                                            No completed scripts found. Go generate one first!
                                        </p>
                                    )}
                                </div>

                                {/* Scene Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Target Scene{' '}
                                        <span className="font-normal text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 ml-1">(Smart selected)</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.scene_number}
                                        onChange={(e) => setFormData({ ...formData, scene_number: parseInt(e.target.value) })}
                                        disabled={!formData.script_id || getAvailableScenes().length === 0}
                                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-250 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-900 dark:text-white"
                                    >
                                        {formData.script_id ? (
                                            getAvailableScenes().length > 0 ? (
                                                getAvailableScenes().map(scene => (
                                                    <option key={scene.scene_number} value={scene.scene_number}>
                                                        Scene {scene.scene_number} — {scene.narration?.substring(0, 40) || 'Narrative scene...'}...
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="">Unable to load scenes for this script</option>
                                            )
                                        ) : (
                                            <option value="">Select a script first</option>
                                        )}
                                    </select>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 dark:text-gray-450 mt-2 italic bg-gray-50 dark:bg-[#0a0a0a] p-2 rounded border border-gray-200 dark:border-white/5">
                                        Extracts 4 robust cinematic prompts (including story hooks and character focus) from this scene.
                                    </p>
                                </div>

                                {/* Visual Identity Status */}
                                {formData.script_id && (
                                    <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-xl p-4 mt-2">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-bold text-gray-450 dark:text-gray-400 uppercase tracking-widest">Visual Identity</h4>
                                            {visualBible ? (
                                                <span className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded border border-green-200 dark:border-green-500/20 font-bold uppercase tracking-tighter">Established</span>
                                            ) : (
                                                <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded border border-red-200 dark:border-red-500/20 font-bold uppercase tracking-tighter">Missing</span>
                                            )}
                                        </div>
                                        
                                        {visualBible ? (
                                            <div className="space-y-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {visualBible.characters?.slice(0, 3).map((c, i) => (
                                                        <span key={i} className="text-[10px] bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-white/10">{c.name}</span>
                                                    ))}
                                                    {(visualBible.characters?.length > 3) && <span className="text-[10px] text-gray-500 dark:text-gray-400">+{visualBible.characters.length - 3} more</span>}
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={handleBuildBible}
                                                    disabled={isBuildingBible}
                                                    className="text-[10px] text-purple-650 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-bold underline disabled:opacity-50"
                                                >
                                                    {isBuildingBible ? 'Re-building...' : 'Regenerate Character Faces & Environments'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 dark:text-gray-400 leading-relaxed">
                                                    Build a "Visual Bible" first to ensure characters (faces, age, skin tone) and environments stay the same across every scene.
                                                </p>
                                                <button 
                                                    type="button"
                                                    onClick={handleBuildBible}
                                                    disabled={isBuildingBible}
                                                    className="w-full py-2 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2 shadow-sm"
                                                >
                                                    {isBuildingBible ? (
                                                        <>
                                                            <div className="w-3 h-3 border-2 border-purple-550 dark:border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                                                            Extracting Identities...
                                                        </>
                                                    ) : 'Build High-Consistency Visual Bible'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Submit */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={isGeneratingPrompts || !formData.script_id || getAvailableScenes().length === 0}
                                        className="w-full py-3 sm:py-3.5 bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {isGeneratingPrompts ? (
                                            <>
                                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                Generating...
                                            </>
                                        ) : (
                                            'Extract Prompts for this Scene'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}