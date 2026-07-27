"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import {
    MdAdd,
    MdDownload,
    MdDelete,
    MdZoomIn,
    MdClose,
    MdImage,
    MdAutoAwesome,
    MdArrowBack,
    MdFolder,
    MdLock,
    MdRefresh,
    MdTune,
    MdSpeed,
    MdSecurity,
    MdAspectRatio,
    MdCheckCircle,
    MdPlusOne,
    MdNavigateNext
} from 'react-icons/md';
import Sidebar from '@/components/Sidebar';
import { Key } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

const ASPECT_RATIOS = [
    { id: '1:1', label: '1:1 Square', desc: 'Social Feeds & Avatars', ratioClass: 'w-6 h-6' },
    { id: '16:9', label: '16:9 Widescreen', desc: 'YouTube & Desktop', ratioClass: 'w-8 h-4.5' },
    { id: '9:16', label: '9:16 Vertical', desc: 'TikTok, Shorts, Reels', ratioClass: 'w-4.5 h-8' },
    { id: '4:3', label: '4:3 Monitor', desc: 'Standard TV & Presentations', ratioClass: 'w-7 h-5.25' },
    { id: '3:4', label: '3:4 Portrait', desc: 'Magazine & Posters', ratioClass: 'w-5.25 h-7' },
    { id: '3:2', label: '3:2 Photo', desc: 'DSLR Photography', ratioClass: 'w-7.5 h-5' },
    { id: '2:3', label: '2:3 Vertical', desc: 'Portrait Photography', ratioClass: 'w-5 h-7.5' },
    { id: '21:9', label: '21:9 Ultrawide', desc: 'Cinematic Movie Scope', ratioClass: 'w-9 h-3.8' },
    { id: '4:5', label: '4:5 Feed', desc: 'Instagram Feed Posts', ratioClass: 'w-5.5 h-7' },
    { id: '5:4', label: '5:4 Frame', desc: 'Landscape Art Prints', ratioClass: 'w-7 h-5.5' },
    { id: '1:2', label: '1:2 Tall Banner', desc: 'Mobile Web Banners', ratioClass: 'w-3.5 h-7' },
    { id: '2:1', label: '2:1 Panoramic', desc: 'Header Banners', ratioClass: 'w-8 h-4' },
    { id: '16:10', label: '16:10 Display', desc: 'Mac & PC Displays', ratioClass: 'w-8 h-5' },
];

const ART_STYLES = [
    {
        id: 'photorealistic',
        name: 'Photorealistic Photography',
        badge: 'Real-world Photos',
        icon: '📷',
        desc: 'Ultra-realistic Hasselblad / 35mm commercial camera photography & macro B-roll style.',
        bullets: [
            'Ultra-realistic Hasselblad / 35mm commercial camera photography & macro lighting',
            'Real-world human presenters, skin textures, natural studio lighting & metallic/matte hardware prototypes',
            'Realistic studio sets, depth of field bokeh, volumetric studio light & professional tech B-roll',
            'Excludes 3D animation, cartoons, Pixar renders, or drawings'
        ]
    },
    {
        id: 'pixar_3d',
        name: '3D Pixar Feature Film Style',
        badge: '3D Pixar Animation',
        icon: '✨',
        desc: 'High-budget 3D animated feature film aesthetic (Disney-Pixar / Dreamworks style).',
        bullets: [
            'High-budget 3D animated feature film aesthetic with heroic adult proportions',
            'Rich subsurface scattering, Octane 4K 3D rendering, and vibrant expressive lighting',
            'Stylized character faces, fixed hair texture, and epic animated background sets',
            'Excludes realistic human skin photo textures, over-simplified 2D cartoons, or chibi proportions'
        ]
    },
    {
        id: 'illustration',
        name: 'Illustrational Graphic Art',
        badge: 'Graphic Digital Art',
        icon: '🎨',
        desc: 'Premium digital illustration, vector graphic artwork & editorial storybook style.',
        bullets: [
            'Premium digital illustration, vector graphic artwork & editorial storybook aesthetic',
            'Clean graphic linework, rich color palettes, and artistic atmospheric shading',
            'Expressive visual metaphors, creative poster compositions & custom graphic storytelling',
            'Excludes realistic photo textures and raw 3D models'
        ]
    }
];

const MODELS = [
    {
        id: 'gemini-3.1-flash-lite-image',
        name: 'Gemini 3.1 Flash Lite Image',
        badge: 'DEFAULT • 1K SUB-2S',
        desc: 'Sub-2s latency, native 1K resolution, 14 aspect ratios, SynthID watermarking.',
        provider: 'gemini'
    },
    {
        id: 'siliconflow',
        name: 'FLUX.1 Schnell (SiliconFlow)',
        badge: 'FAST FLUX',
        desc: 'High speed Flux turbo model.',
        provider: 'siliconflow'
    },
    {
        id: 'pollinations',
        name: 'Pollinations AI',
        badge: 'COMMUNITY FREE',
        desc: 'Free open source generative model.',
        provider: 'pollinations'
    }
];

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

    // Engine, Model, Aspect Ratio & Art Style State
    const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-lite-image');
    const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
    const [selectedArtStyle, setSelectedArtStyle] = useState('photorealistic'); // photorealistic | pixar_3d | illustration

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);

    // Sequential & Extra Generation States
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);
    const [generatingId, setGeneratingId] = useState(null);
    const [isGeneratingExtraScene, setIsGeneratingExtraScene] = useState(null);

    // Visual Bible State
    const [isBuildingBible, setIsBuildingBible] = useState(false);
    const [visualBible, setVisualBible] = useState(null);
    const [zoomImage, setZoomImage] = useState(null);

    const { showToast, showConfirm, showQuotaModal } = useNotification();

    const [formData, setFormData] = useState({
        script_id: '',
        scene_number: 1
    });

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const getSecureUrl = (url) => {
        if (!url) return '';
        if (window.location.protocol === 'https:' && url.startsWith('http://')) {
            if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
                return url.replace('http://', 'https://');
            }
        }
        return url;
    };

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

    const [subscription, setSubscription] = useState(null);

    const fetchSubscription = async () => {
        try {
            const res = await fetch(`${API_URL}/plans/my-subscription?user_id=${user.id}`);
            const data = await res.json();
            if (data.success && data.subscription) {
                setSubscription(data.subscription);
            }
        } catch (err) {
            console.error('Error fetching subscription:', err);
        }
    };

    useEffect(() => {
        fetchScripts();
        fetchPrompts();
        fetchSubscription();
    }, []);

    const getAvailableScenes = (scriptIdParam = null) => {
        const targetId = scriptIdParam || formData.script_id || selectedAlbumId;
        if (!targetId) return [];
        const selectedScript = scripts.find(s =>
            s.id.toString() === targetId.toString() ||
            (s.uuid && s.uuid === targetId.toString())
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

            const selectedScript = scripts.find(s => s.id.toString() === formData.script_id.toString());
            if (selectedScript?.visual_bible) {
                try {
                    setVisualBible(typeof selectedScript.visual_bible === 'string' ? JSON.parse(selectedScript.visual_bible) : selectedScript.visual_bible);
                } catch (e) { setVisualBible(null); }
            } else {
                setVisualBible(null);
            }
        }
    }, [formData.script_id, scripts]);

    useEffect(() => {
        if (selectedAlbumId && selectedAlbumId !== 'standalone') {
            const selectedScript = scripts.find(s => String(s.id) === String(selectedAlbumId));
            if (selectedScript?.visual_bible) {
                try {
                    setVisualBible(typeof selectedScript.visual_bible === 'string' ? JSON.parse(selectedScript.visual_bible) : selectedScript.visual_bible);
                } catch (e) { setVisualBible(null); }
            } else {
                setVisualBible(null);
            }
        }
    }, [selectedAlbumId, scripts]);

    const handleBuildBibleForActiveScript = async () => {
        const targetScriptId = selectedAlbumId || formData.script_id;
        if (!targetScriptId || targetScriptId === 'standalone') return;

        setIsBuildingBible(true);
        try {
            const response = await fetch(`${API_URL}/images/build-bible`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script_id: targetScriptId, user_id: user.id, image_style: selectedArtStyle })
            });
            const data = await response.json();
            if (data.success && data.bible) {
                setVisualBible(data.bible);
                setScripts(prev => prev.map(s => String(s.id) === String(targetScriptId) ? { ...s, visual_bible: data.bible } : s));
                showToast('Visual Identity & Character Consistency Bible created!', 'success');
            } else {
                const message = data.message || '';
                if (response.status === 429 || message.toLowerCase().includes('quota')) {
                    showQuotaModal(message || "Quota limit reached. Please update key in Settings.");
                } else {
                    showToast('Error creating visual identity: ' + message, 'error');
                }
            }
        } catch (error) {
            console.error('Error building bible:', error);
            showToast('Failed to build visual identity.', 'error');
        } finally {
            setIsBuildingBible(false);
        }
    };

    const handleBuildBible = async () => {
        if (!formData.script_id) return;
        setIsBuildingBible(true);
        try {
            const response = await fetch(`${API_URL}/images/build-bible`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script_id: formData.script_id, user_id: user.id, image_style: selectedArtStyle })
            });
            const data = await response.json();
            if (data.success) {
                setVisualBible(data.bible);
                setScripts(prev => prev.map(s => s.id.toString() === formData.script_id.toString() ? { ...s, visual_bible: data.bible } : s));
                showToast('Visual Identity (Visual Bible) created!', 'success');
            } else {
                const message = data.message || '';
                if (response.status === 429 || message.toLowerCase().includes('quota')) {
                    showQuotaModal(message || "Quota limit reached. Please update key in Settings.");
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
        if (e) e.preventDefault();

        const currentScript = scripts.find(s =>
            s.id.toString() === formData.script_id.toString() ||
            (s.uuid && s.uuid === formData.script_id.toString())
        );

        if (!visualBible && !currentScript?.visual_bible) {
            const confirmed = await showConfirm(
                "Create Visual Identity",
                "This script doesn't have a Visual Identity (Faces & Environments) yet. Create it now for scene consistency?"
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
                    scene_number: formData.scene_number,
                    image_style: selectedArtStyle
                })
            });

            const data = await response.json();

            if (data.success && data.prompts) {
                await fetchPrompts();
                setShowModal(false);
                if (viewMode === 'albums') {
                    setSelectedAlbumId(parseInt(formData.script_id));
                    setViewMode('album-details');
                }
                showToast(`Generated ${data.prompts.length} scene prompts for Scene ${formData.scene_number}!`, 'success');
            } else {
                showToast(data.message || 'Error generating prompts', 'error');
            }
        } catch (error) {
            console.error('Error generating prompts:', error);
            showToast('Error generating prompts', 'error');
        } finally {
            setIsGeneratingPrompts(false);
        }
    };

    // Extract Specific Scene Directly (Sequential Flow Card)
    const handleExtractSpecificScene = async (scriptId, sceneNum) => {
        setFormData(prev => ({ ...prev, script_id: scriptId, scene_number: sceneNum }));
        setIsGeneratingPrompts(true);

        try {
            const response = await fetch(`${API_URL}/images/generate-prompts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script_id: scriptId,
                    user_id: user.id,
                    scene_number: sceneNum,
                    image_style: selectedArtStyle
                })
            });

            const data = await response.json();

            if (data.success && data.prompts) {
                await fetchPrompts();
                showToast(`Extracted ${data.prompts.length} prompts for Scene ${sceneNum}!`, 'success');
            } else {
                showToast(data.message || 'Error extracting scene prompts', 'error');
            }
        } catch (error) {
            console.error('Error generating prompts:', error);
            showToast('Error extracting scene prompts', 'error');
        } finally {
            setIsGeneratingPrompts(false);
        }
    };

    // Generate Extra Image Angle for Scene (Max 3 per Scene, counts 1 usage)
    const handleGenerateExtraSceneImage = async (scriptId, sceneNum) => {
        if (isGeneratingExtraScene) return;
        setIsGeneratingExtraScene(sceneNum);
        try {
            const response = await fetch(`${API_URL}/images/generate-extra-prompts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    script_id: scriptId,
                    scene_number: sceneNum,
                    count: 1
                })
            });

            const data = await response.json();
            if (data.success && data.prompts && data.prompts.length > 0) {
                const newPrompt = data.prompts[0];
                await fetchPrompts();
                showToast(`Generated alternate angle for Scene ${sceneNum}! Rendering visual...`, 'info');
                await generateSingleImage(newPrompt.id);
            } else {
                showToast(data.message || 'Failed to generate extra scene prompt', 'error');
            }
        } catch (err) {
            showToast('Error generating extra scene angle', 'error');
        } finally {
            setIsGeneratingExtraScene(null);
        }
    };

    const generateSingleImage = async (promptId) => {
        if (isGeneratingImages) return;
        setGeneratingId(promptId);

        try {
            const currentModelObj = MODELS.find(m => m.id === selectedModel) || MODELS[0];
            const targetProvider = currentModelObj.provider || 'gemini';

            const response = await fetch(`${API_URL}/images/generate/${promptId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    provider: targetProvider,
                    model: selectedModel,
                    aspect_ratio: selectedAspectRatio
                })
            });
            const data = await response.json();

            if (data.success) {
                setImages(prev => prev.map(img =>
                    img.id === promptId
                        ? { ...img, status: 'completed', image_url: data.image_url }
                        : img
                ));
                fetchSubscription();
                return true;
            } else {
                setImages(prev => prev.map(img =>
                    img.id === promptId ? { ...img, status: 'failed' } : img
                ));
                showToast(data.message || 'Generation failed', 'error');
                return false;
            }
        } catch (err) {
            console.error("Error image generation", err);
            setImages(prev => prev.map(img =>
                img.id === promptId ? { ...img, status: 'failed' } : img
            ));
            return false;
        } finally {
            setGeneratingId(null);
        }
    };

    const handleGenerateAllRemaining = async (specificScriptId = null, sceneNum = null) => {
        if (isGeneratingImages) return;
        setIsGeneratingImages(true);

        const pendingPrompts = images.filter(img =>
            img.status === 'pending' &&
            (specificScriptId ? String(img.script_id) === String(specificScriptId) : true) &&
            (sceneNum !== null ? Number(img.scene_number) === Number(sceneNum) : true)
        );

        if (pendingPrompts.length === 0) {
            showToast('No pending image generations found in this selection!', 'warning');
            setIsGeneratingImages(false);
            return;
        }

        let successCount = 0;
        for (const prompt of pendingPrompts) {
            const result = await generateSingleImage(prompt.id);
            if (result) successCount++;
            else break;
        }

        setIsGeneratingImages(false);
        if (successCount > 0) {
            showToast(`Rendered ${successCount} images successfully!`, 'success');
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
            showToast('Prompt deleted', 'success');
        } catch (e) {
            showToast('Failed to delete prompt', 'error');
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
            window.open(url, '_blank');
        }
    };

    const downloadGroup = async (groupImages, groupName) => {
        const completed = groupImages.filter(img => img.status === 'completed' && img.image_url);
        if (completed.length === 0) return showToast('No generated images in this group to download!', 'warning');

        showToast(`Downloading ${completed.length} images...`, 'info');
        for (let i = 0; i < completed.length; i++) {
            const img = completed[i];
            const secureUrl = getSecureUrl(img.image_url);
            const filename = `${groupName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_scene_${img.scene_number}_${i + 1}.jpg`;
            await handleDownloadImage(secureUrl, filename);
            await new Promise(r => setTimeout(r, 600));
        }
    };

    // Computed Folder Data
    const scriptsWithImages = scripts.map(script => {
        const scriptPrompts = images.filter(img => String(img.script_id) === String(script.id));
        return { ...script, prompts: scriptPrompts };
    }).filter(script => script.prompts.length > 0);

    const activeAlbum = selectedAlbumId ? scripts.find(s => String(s.id) === String(selectedAlbumId)) : null;
    const activeAlbumImages = activeAlbum
        ? images.filter(img => String(img.script_id) === String(activeAlbum.id))
        : (selectedAlbumId === 'standalone' ? images.filter(img => !img.script_id) : []);

    const scenesInAlbum = [...new Set(activeAlbumImages.map(img => img.scene_number))].sort((a, b) => a - b);
    const activeModelObj = MODELS.find(m => m.id === selectedModel) || MODELS[0];

    // Calculate sequential scene extraction status
    const availableScriptScenes = activeAlbum ? getAvailableScenes(activeAlbum.id) : [];
    const totalScriptScenesCount = availableScriptScenes.length;
    const highestExtractedSceneNum = scenesInAlbum.length > 0 ? Math.max(...scenesInAlbum) : 0;
    const nextSceneToExtractNum = highestExtractedSceneNum + 1;

    return (
        <div className="flex h-screen bg-[#0a0a0f] text-gray-100 font-sans">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">

                {/* Executive Banner */}
                <div className="bg-[#111116] border-b border-white/10 p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                {viewMode === 'album-details' && (
                                    <button
                                        onClick={() => setViewMode('albums')}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <MdArrowBack className="w-5 h-5" />
                                    </button>
                                )}
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
                                        <MdImage className="text-red-500 w-6 h-6" /> Image Studio & Visual Identity
                                    </h1>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {viewMode === 'albums'
                                            ? 'Organized image production folders grouped by script content and scene prompts.'
                                            : `${activeAlbumImages.length} scene prompts inside ${activeAlbum?.title || 'Standalone Folder'}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                                {viewMode === 'album-details' && activeAlbumImages.some(i => i.status === 'pending') && (
                                    <button
                                        onClick={() => handleGenerateAllRemaining(activeAlbum?.id)}
                                        disabled={isGeneratingImages}
                                        className="px-3.5 py-2 bg-red-600/10 border border-red-500/30 hover:bg-red-600/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                                    >
                                        <MdAutoAwesome className={`w-4 h-4 ${isGeneratingImages ? 'animate-spin' : ''}`} />
                                        {isGeneratingImages ? 'Generating...' : 'Render Pending Images'}
                                    </button>
                                )}

                                {viewMode === 'album-details' && (
                                    <button
                                        onClick={() => downloadGroup(activeAlbumImages, activeAlbum?.title || 'Album')}
                                        className="px-3.5 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                                    >
                                        <MdDownload className="w-4 h-4" /> Download Folder Assets
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* GLOBAL SCRIPT SELECTOR, MODEL & ASPECT RATIO CONTROL BAR */}
                        <div className="bg-[#1c1c24] border border-white/10 rounded-2xl p-4 space-y-4 shadow-xl">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                {/* 1. SCRIPT SELECTOR DROPDOWN */}
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                        <MdFolder className="text-red-500" /> Select Script to Generate Images
                                    </label>
                                    <select
                                        value={selectedAlbumId || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (!val) {
                                                setSelectedAlbumId(null);
                                                setViewMode('albums');
                                            } else {
                                                setSelectedAlbumId(val);
                                                setFormData(prev => ({ ...prev, script_id: val }));
                                                setViewMode('album-details');
                                            }
                                        }}
                                        className="w-full bg-[#111116] border border-white/10 text-white text-xs font-bold rounded-xl p-3 outline-none focus:border-red-500"
                                    >
                                        <option value="">-- Choose a Script ({scripts.length} Available) --</option>
                                        {scripts.map(s => (
                                            <option key={s.id} value={s.id}>
                                                🎬 {s.title} ({s.niche_name || 'Script'})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                                        {selectedAlbumId ? 'Currently viewing scene visuals for selected script.' : 'Pick a saved script to generate & manage scene visuals.'}
                                    </p>
                                </div>

                                {/* 2. MODEL ENGINE SELECTOR */}
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                        <MdTune className="text-red-500" /> Select AI Model Engine
                                    </label>
                                    <select
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        className="w-full bg-[#111116] border border-white/10 text-white text-xs font-bold rounded-xl p-3 outline-none focus:border-red-500"
                                    >
                                        {MODELS.map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.name} [{m.badge}]
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-1 leading-tight">{activeModelObj.desc}</p>
                                </div>

                                {/* 3. ASPECT RATIO SELECTOR */}
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                                        <span>Aspect Ratio Format</span>
                                        <span className="text-red-400 font-mono font-bold">{selectedAspectRatio}</span>
                                    </label>
                                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                                        {ASPECT_RATIOS.map(ar => {
                                            const isSelected = selectedAspectRatio === ar.id;
                                            return (
                                                <button
                                                    key={ar.id}
                                                    type="button"
                                                    onClick={() => setSelectedAspectRatio(ar.id)}
                                                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 min-w-[65px] transition-all ${isSelected
                                                            ? 'bg-red-600/10 border-red-500 text-red-400'
                                                            : 'bg-[#111116] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                                                        }`}
                                                    title={`${ar.label} (${ar.desc})`}
                                                >
                                                    <div className="w-7 h-7 flex items-center justify-center bg-black/40 rounded-lg p-1">
                                                        <div className={`border-2 border-current rounded-sm ${ar.ratioClass}`} />
                                                    </div>
                                                    <span className="text-[9px] font-bold font-mono">{ar.id}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* 4. ART STYLE & GENERATION METHOD SELECTOR WITH INTERACTIVE BULLET POINTS */}
                            <div className="pt-3 border-t border-white/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <MdAutoAwesome className="text-red-500" /> Select Generation Method & Art Style
                                    </label>
                                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold">
                                        {ART_STYLES.find(s => s.id === selectedArtStyle)?.badge}
                                    </span>
                                </div>

                                {/* Style Selector Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {ART_STYLES.map(style => {
                                        const isSelected = selectedArtStyle === style.id;
                                        return (
                                            <button
                                                key={style.id}
                                                type="button"
                                                onClick={() => setSelectedArtStyle(style.id)}
                                                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                                                    isSelected
                                                        ? 'bg-purple-600/15 border-purple-500 text-white shadow-lg shadow-purple-900/20 ring-1 ring-purple-500/50'
                                                        : 'bg-[#111116] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                            >
                                                <span className="text-xl leading-none">{style.icon}</span>
                                                <div>
                                                    <div className="font-bold text-xs flex items-center gap-1.5">
                                                        <span>{style.name}</span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{style.desc}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Interactive Bullet Breakdown Box */}
                                {(() => {
                                    const activeStyleObj = ART_STYLES.find(s => s.id === selectedArtStyle) || ART_STYLES[0];
                                    return (
                                        <div className="bg-[#111116] border border-white/10 p-3.5 rounded-xl space-y-2 text-xs">
                                            <div className="flex items-center gap-2 font-bold text-purple-400 text-[11px] uppercase tracking-wider">
                                                <span>{activeStyleObj.icon}</span>
                                                <span>Style Rules & Enforced AI Prompts ({activeStyleObj.name})</span>
                                            </div>
                                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-300">
                                                {activeStyleObj.bullets.map((bullet, idx) => (
                                                    <li key={idx} className="flex items-start gap-1.5 leading-snug">
                                                        <span className="text-purple-400 font-bold">•</span>
                                                        <span>{bullet}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT CONTAINER */}
                <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 flex-1 w-full">

                    {/* VIEW 1: SCRIPT FOLDERS / ALBUMS GRID */}
                    {viewMode === 'albums' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                    <MdFolder className="text-red-500 w-4 h-4" /> Script Content Library ({scripts.length} Saved Scripts)
                                </h2>
                            </div>

                            {loading || loadingScripts ? (
                                <div className="text-center py-16">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                                    <p className="text-xs text-gray-500 mt-3 font-semibold uppercase tracking-wider">Loading image & script library...</p>
                                </div>
                            ) : scripts.length === 0 && images.length === 0 ? (
                                <div className="text-center py-16 bg-[#111116] border border-white/10 rounded-2xl p-8 space-y-4">
                                    <MdFolder className="w-12 h-12 text-gray-600 mx-auto" />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Saved Scripts Found</h3>
                                    <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                                        Create or compile a script in Story Studio or Script Compiler first, then return here to extract and generate scene visuals!
                                    </p>
                                    <button
                                        onClick={() => router.push('/dashboard/story-writer')}
                                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-900/20"
                                    >
                                        Go to Story Writer →
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">

                                    {/* STANDALONE PROMPTS FOLDER (If any exist) */}
                                    {images.some(img => !img.script_id) && (
                                        <div
                                            onClick={() => {
                                                setSelectedAlbumId('standalone');
                                                setViewMode('album-details');
                                            }}
                                            className="bg-[#111116] hover:bg-[#1a1a22] border border-white/10 hover:border-red-500/30 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                                        >
                                            <div className="space-y-3">
                                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-105 transition-transform">
                                                    <MdFolder className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                                                        Standalone Direct Prompts
                                                    </h3>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                        {images.filter(img => !img.script_id).length} Custom Prompts
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-red-400 uppercase tracking-wider">
                                                <span>Open Folder</span>
                                                <span>→</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* ALL SAVED SCRIPTS GRID */}
                                    {scripts.map(script => {
                                        const scriptPrompts = images.filter(img => String(img.script_id) === String(script.id));
                                        const completedCount = scriptPrompts.filter(p => p.status === 'completed').length;

                                        return (
                                            <div
                                                key={script.id}
                                                onClick={() => {
                                                    setSelectedAlbumId(script.id);
                                                    setFormData(prev => ({ ...prev, script_id: script.id }));
                                                    setViewMode('album-details');
                                                }}
                                                className="bg-[#111116] hover:bg-[#1a1a22] border border-white/10 hover:border-red-500/30 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                                            >
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-105 transition-transform">
                                                            <MdFolder className="w-6 h-6" />
                                                        </div>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                                            completedCount > 0
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                : 'bg-white/5 text-gray-400 border-white/10'
                                                        }`}>
                                                            {completedCount > 0 ? `${completedCount} Rendered` : '0 Images'}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                                                            {script.title}
                                                        </h3>
                                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                                            {script.niche_name || 'General Content'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-red-400 uppercase tracking-wider">
                                                    <span>{scriptPrompts.length > 0 ? 'Manage Scene Visuals' : 'Generate Scene Images'}</span>
                                                    <span>→</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* VIEW 2: SCENE-BY-SCENE FOLDER DETAIL GRID */}
                    {viewMode === 'album-details' && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                                        <MdFolder className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                                            {selectedAlbumId === 'standalone' ? 'Standalone Direct Prompts' : (activeAlbum?.title || 'Script Folder')}
                                        </h2>
                                        <p className="text-[10px] text-gray-400">
                                            {activeAlbumImages.length} scene prompts inside this folder
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={fetchPrompts}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
                                    title="Refresh Folder"
                                >
                                    <MdRefresh className="w-4 h-4" />
                                </button>
                            </div>

                            {/* ── VISUAL IDENTITY & CHARACTER CONSISTENCY BIBLE PANEL ── */}
                            {activeAlbum && (
                                <div className="bg-[#1c1c26] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                                <MdAutoAwesome className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                    <span>Visual Identity & Character Consistency Bible</span>
                                                    {visualBible ? (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                                                            ✓ Active & Locked
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20">
                                                            ⚠️ Not Created Yet
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    AI character seed & face consistency anchor for {activeAlbum.title}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleBuildBibleForActiveScript}
                                            disabled={isBuildingBible}
                                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 disabled:opacity-50"
                                        >
                                            {isBuildingBible ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    <span>Analyzing Script & Characters...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <MdAutoAwesome className="w-4 h-4" />
                                                    <span>{visualBible ? 'Re-build Visual Identity' : '✨ Build Visual Identity Bible'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {visualBible ? (
                                        <div className="space-y-4">
                                            {/* Character Roster */}
                                            {visualBible.characters && visualBible.characters.length > 0 && (
                                                <div>
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                                                        Character Roster & Visual Features ({visualBible.characters.length})
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {visualBible.characters.map((c, idx) => (
                                                            <div key={idx} className="bg-[#111116] border border-white/5 p-3.5 rounded-xl space-y-1.5 text-xs">
                                                                <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                                                                    <span className="font-bold text-white text-xs">{c.name}</span>
                                                                    <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                                                                        {c.gender !== 'N/A' ? c.gender : 'Subject'}
                                                                    </span>
                                                                </div>
                                                                {c.hair !== 'N/A' && <p className="text-[11px] text-gray-300"><strong className="text-gray-400">Hair:</strong> {c.hair}</p>}
                                                                {c.face !== 'N/A' && <p className="text-[11px] text-gray-300"><strong className="text-gray-400">Face:</strong> {c.face}</p>}
                                                                {c.default_outfit !== 'N/A' && <p className="text-[11px] text-gray-300"><strong className="text-gray-400">Outfit:</strong> {c.default_outfit}</p>}
                                                                {c.build !== 'N/A' && <p className="text-[11px] text-gray-300"><strong className="text-gray-400">Build:</strong> {c.build}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Environment Roster */}
                                            {visualBible.environments && visualBible.environments.length > 0 && (
                                                <div className="pt-2 border-t border-white/5">
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                                                        Environment & Lighting Style ({visualBible.environments.length})
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {visualBible.environments.map((env, idx) => (
                                                            <div key={idx} className="bg-[#111116] border border-white/5 p-3 rounded-xl space-y-1 text-xs">
                                                                <span className="font-bold text-white text-xs">{env.name}</span>
                                                                <p className="text-[11px] text-gray-300 leading-relaxed">{env.description}</p>
                                                                {env.atmosphere && <p className="text-[10px] text-purple-400 font-mono">Atmosphere: {env.atmosphere}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-[#111116] border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                                            <p className="text-gray-400 leading-relaxed">
                                                Click "Build Visual Identity Bible" above so the AI extracts character face features, hair texture, clothing, and environment anchors to keep character appearance 100% consistent across all scene images.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {scenesInAlbum.map(sceneNumber => {
                                const sceneImages = activeAlbumImages.filter(img => img.scene_number === sceneNumber);
                                const completedSceneImages = sceneImages.filter(img => img.status === 'completed' && img.image_url);
                                const canGenerateMoreInScene = sceneImages.length < 3;

                                return (
                                    <div key={sceneNumber} className="bg-[#111116] border border-white/10 p-5 sm:p-6 rounded-2xl space-y-4">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-3 flex-wrap gap-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                                    <MdImage className="text-red-500 w-4 h-4" /> Scene {sceneNumber} ({sceneImages.length}/3 Visual Angles)
                                                </h3>
                                                {completedSceneImages.length > 0 && (
                                                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                                        {completedSceneImages.length} Active
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* GENERATE ADDITIONAL SCENE IMAGE (MAX 3 PER SCENE, COUNTS 1 USAGE) */}
                                                {canGenerateMoreInScene && activeAlbum && (
                                                    <button
                                                        onClick={() => handleGenerateExtraSceneImage(activeAlbum.id, sceneNumber)}
                                                        disabled={isGeneratingExtraScene === sceneNumber || isGeneratingImages}
                                                        className="px-3 py-1 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                                                    >
                                                        <MdPlusOne className={`w-3.5 h-3.5 ${isGeneratingExtraScene === sceneNumber ? 'animate-spin' : ''}`} />
                                                        <span>{isGeneratingExtraScene === sceneNumber ? 'Generating Angle...' : `+ Generate Angle ${sceneImages.length + 1}`}</span>
                                                    </button>
                                                )}

                                                {sceneImages.some(i => i.status === 'pending') && (
                                                    <button
                                                        onClick={() => handleGenerateAllRemaining(activeAlbum?.id, sceneNumber)}
                                                        disabled={isGeneratingImages}
                                                        className="px-3 py-1 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                                                    >
                                                        <MdAutoAwesome className={`w-3.5 h-3.5 ${isGeneratingImages ? 'animate-spin' : ''}`} /> Render Scene Images
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => downloadGroup(sceneImages, `${activeAlbum?.title || 'Album'}_Scene_${sceneNumber}`)}
                                                    className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-gray-300 transition-all flex items-center gap-1"
                                                >
                                                    <MdDownload className="w-3.5 h-3.5" /> Download Scene
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {sceneImages.map(img => (
                                                <div
                                                    key={img.id}
                                                    className="bg-[#1c1c24] border border-white/5 hover:border-red-500/30 rounded-2xl overflow-hidden group transition-all flex flex-col justify-between"
                                                >
                                                    {img.image_url ? (
                                                        <div className="relative aspect-square overflow-hidden bg-black/50">
                                                            <img
                                                                src={getSecureUrl(img.image_url)}
                                                                alt={img.title || 'Generated Visual'}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                            <button
                                                                onClick={() => setZoomImage(getSecureUrl(img.image_url))}
                                                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                            >
                                                                <MdZoomIn className="w-8 h-8" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="aspect-square bg-black/30 flex flex-col items-center justify-center p-4 text-center">
                                                            <p className="text-xs text-gray-400 mb-3 line-clamp-3 font-mono leading-relaxed">{img.prompt}</p>
                                                            <button
                                                                onClick={() => generateSingleImage(img.id)}
                                                                disabled={generatingId === img.id}
                                                                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-red-900/20 disabled:opacity-50"
                                                            >
                                                                {generatingId === img.id ? (
                                                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <MdAutoAwesome className="w-3.5 h-3.5" />
                                                                )}
                                                                {generatingId === img.id ? 'Rendering...' : 'Render Image'}
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className="p-4 space-y-2">
                                                        <h4 className="text-xs font-bold text-white line-clamp-1">{img.title || 'Untitled Image'}</h4>
                                                        <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed font-sans">{img.prompt}</p>

                                                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                            <span className="text-[9px] text-gray-500 font-mono">{img.createdAt}</span>
                                                            <div className="flex items-center gap-2">
                                                                {img.image_url && (
                                                                    <a
                                                                        href={getSecureUrl(img.image_url)}
                                                                        download
                                                                        className="text-xs text-gray-400 hover:text-white p-1"
                                                                        title="Download Image"
                                                                    >
                                                                        <MdDownload className="w-4 h-4" />
                                                                    </a>
                                                                )}
                                                                <button
                                                                    onClick={() => deletePrompt(img.id)}
                                                                    className="text-xs text-red-400 hover:text-red-300 p-1"
                                                                    title="Delete Prompt"
                                                                >
                                                                    <MdDelete className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* ── GUIDED SEQUENTIAL SCENE GENERATION CARD (Right at the position of the next scene!) ── */}
                            {activeAlbum && nextSceneToExtractNum <= totalScriptScenesCount && (
                                <div
                                    onClick={() => handleExtractSpecificScene(activeAlbum.id, nextSceneToExtractNum)}
                                    className="bg-[#14141c] hover:bg-[#1a1a24] border-2 border-dashed border-red-500/30 hover:border-red-500/60 rounded-2xl p-6 text-center space-y-3 transition-all cursor-pointer group shadow-lg"
                                >
                                    <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform border border-red-500/20">
                                        <MdAutoAwesome className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                                            Ready to Extract Prompts for Scene {nextSceneToExtractNum}?
                                        </h4>
                                        <p className="text-xs text-gray-400 max-w-md mx-auto mt-1 leading-relaxed">
                                            Extract 3 cinematic visual prompts & camera angles for Scene {nextSceneToExtractNum} from your script narration.
                                        </p>
                                    </div>
                                    <button
                                        disabled={isGeneratingPrompts}
                                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-900/30 inline-flex items-center gap-2"
                                    >
                                        {isGeneratingPrompts ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Extracting Scene {nextSceneToExtractNum}...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Extract Scene {nextSceneToExtractNum} Prompts & Visuals</span>
                                                <MdNavigateNext className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* COMPLETED ALL SCENES BANNER */}
                            {activeAlbum && totalScriptScenesCount > 0 && nextSceneToExtractNum > totalScriptScenesCount && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl text-center space-y-1">
                                    <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                        <MdCheckCircle className="w-4 h-4" />
                                        <span>All {totalScriptScenesCount} Script Scenes Successfully Extracted & Rendered</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* FULL IMAGE ZOOM MODAL */}
            {zoomImage && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10">
                        <button
                            onClick={() => setZoomImage(null)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
                        >
                            <MdClose className="w-6 h-6" />
                        </button>
                        <img src={zoomImage} alt="Zoom Preview" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
                    </div>
                </div>
            )}
        </div>
    );
}