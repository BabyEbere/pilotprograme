"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import Sidebar from '@/components/Sidebar';
import { 
    MdArrowBack, 
    MdSave, 
    MdPlaylistAdd, 
    MdDownload, 
    MdImage, 
    MdAudiotrack, 
    MdContentCopy,
    MdMovie,
    MdTimer,
    MdLayers,
    MdFormatListNumbered,
    MdCheckCircle,
    MdAdd,
    MdDelete,
    MdPlayArrow
} from 'react-icons/md';
import { useNotification } from '@/context/NotificationContext';

export default function ScriptEditor() {
    const { uuid: routeUuid } = useParams();
    const router = useRouter();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);

    // Active Section Tab
    const [activeSection, setActiveSection] = useState('scenes'); // 'scenes', 'raw', 'production'

    // Core Data
    const [scriptData, setScriptData] = useState(null);
    const [title, setTitle] = useState('');
    const [scenes, setScenes] = useState([]);
    const [audios, setAudios] = useState([]);
    const [images, setImages] = useState([]);

    // Action states
    const [isSaving, setIsSaving] = useState(false);
    const [isExtending, setIsExtending] = useState(false);
    const [copiedRaw, setCopiedRaw] = useState(false);

    // Modal states for extension
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [extendMode, setExtendMode] = useState('ai');
    const [extendInstructions, setExtendInstructions] = useState('');
    const [extendTone, setExtendTone] = useState('');
    const [extendSceneCount, setExtendSceneCount] = useState(4);
    
    const { showToast, showQuotaModal } = useNotification();

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (routeUuid) {
            fetchScript();
        }
    }, [routeUuid]);

    const normalizeScene = (scene, index) => {
        let narrationText = scene.narration || '';
        
        // Handle Blog to Script / Story to Script dialogues format
        if (!narrationText && Array.isArray(scene.dialogues)) {
            narrationText = scene.dialogues
                .map(d => {
                    const speaker = d.speaker ? `${d.speaker}: ` : '';
                    return `${speaker}${d.line || ''}`;
                })
                .filter(Boolean)
                .join('\n');
        }

        const visualSuggestions = scene.visual_suggestions || scene.visual_description || '';

        return {
            ...scene,
            scene_number: scene.scene_number || index + 1,
            title: scene.title || scene.scene_title || `Scene ${index + 1}`,
            narration: narrationText,
            visual_suggestions: visualSuggestions,
            timestamp: scene.timestamp || '0:00',
            type: scene.type || 'body',
            part: scene.part || 1
        };
    };

    const fetchScript = async () => {
        try {
            const response = await fetch(`${API_URL}/scripts/${routeUuid}`);
            const data = await response.json();

            if (data.success && data.script) {
                setScriptData(data.script);
                setTitle(data.script.title || '');
                setAudios(data.script.audios || []);
                setImages(data.script.images || []);

                const rawContent = data.script.content || {};
                let rawScenes = [];

                if (Array.isArray(rawContent.scenes)) {
                    rawScenes = rawContent.scenes;
                } else if (rawContent.script && Array.isArray(rawContent.script.scenes)) {
                    rawScenes = rawContent.script.scenes;
                } else if (rawContent.blog && Array.isArray(rawContent.blog.scenes)) {
                    rawScenes = rawContent.blog.scenes;
                } else if (Array.isArray(rawContent)) {
                    rawScenes = rawContent;
                }

                const normalized = rawScenes.map((s, idx) => normalizeScene(s, idx));
                setScenes(normalized);
            } else {
                showToast(data.message || 'Script not found', 'error');
                setTimeout(() => router.push('/dashboard/scripts'), 2000);
            }
        } catch (error) {
            console.error('Error fetching script:', error);
            showToast('Failed to load script', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSceneChange = (index, field, value) => {
        const updatedScenes = [...scenes];
        updatedScenes[index] = { ...updatedScenes[index], [field]: value };
        setScenes(updatedScenes);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedContent = {
                ...(scriptData?.content || {}),
                scenes: scenes
            };

            const response = await fetch(`${API_URL}/scripts/${routeUuid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    title: title || 'Untitled Script',
                    content: updatedContent
                })
            });

            const data = await response.json();
            if (data.success) {
                showToast('Script saved successfully!', 'success');
                setScriptData(prev => ({
                    ...prev,
                    title: title,
                    content: updatedContent
                }));
            } else {
                showToast(data.message || 'Error saving script', 'error');
            }
        } catch (error) {
            console.error('Error saving script:', error);
            showToast('Failed to save script', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExtendScriptAI = async () => {
        if (isExtending) return;
        setIsExtending(true);

        try {
            await handleSave();
            showToast('Extending script with AI...', 'info');
            
            const maxPart = Math.max(...scenes.map(s => s.part || 1), 1);
            const nextPart = maxPart + 1;
            
            const response = await fetch(`${API_URL}/scripts/${routeUuid}/extend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    instructions: extendInstructions,
                    tone: extendTone,
                    part_number: nextPart,
                    scene_count: parseInt(extendSceneCount || 4)
                })
            });

            const data = await response.json();

            if (data.success) {
                showToast(`Script extended with Part ${nextPart}!`, 'success');
                const newScenes = (data.new_scenes || []).map((s, idx) => normalizeScene(s, scenes.length + idx));
                setScenes(prev => [...prev, ...newScenes]);
                setShowExtendModal(false);
                setExtendInstructions('');
                setExtendTone('');
                setExtendSceneCount(4);
            } else {
                const message = data.message || '';
                const isQuotaError = response.status === 429 || 
                    message.toLowerCase().includes('quota') || 
                    message.toLowerCase().includes('resource_exhausted') || 
                    message.toLowerCase().includes('429');

                if (isQuotaError) {
                    showQuotaModal(message || "Gemini API Key quota exceeded. Update key in Settings to continue.");
                } else {
                    showToast(message || 'Error extending script', 'error');
                }
            }
        } catch (error) {
            console.error('Error extending script:', error);
            showToast('Failed to extend script', 'error');
        } finally {
            setIsExtending(false);
        }
    };

    const handleExtendScriptManual = async () => {
        const maxPart = Math.max(...scenes.map(s => s.part || 1), 1);
        const nextPart = maxPart + 1;
        
        const newScene = {
            scene_number: scenes.length + 1,
            timestamp: "",
            type: "body",
            narration: "",
            part: nextPart,
            visual_suggestions: ""
        };
        
        const updatedScenes = [...scenes, newScene];
        setScenes(updatedScenes);
        setShowExtendModal(false);
        showToast(`Added Part ${nextPart} blank scene!`, 'success');
        
        setTimeout(() => {
            handleSave();
        }, 100);
    };

    const handleAddSceneToPart = (partNum) => {
        const updatedScenes = [...scenes];
        let lastIndexInPart = -1;
        for (let i = 0; i < updatedScenes.length; i++) {
            if ((updatedScenes[i].part || 1) === partNum) {
                lastIndexInPart = i;
            }
        }
        
        const newScene = {
            scene_number: updatedScenes.length + 1,
            timestamp: "",
            type: "body",
            narration: "",
            part: partNum,
            visual_suggestions: ""
        };
        
        if (lastIndexInPart !== -1) {
            updatedScenes.splice(lastIndexInPart + 1, 0, newScene);
        } else {
            updatedScenes.push(newScene);
        }
        
        updatedScenes.forEach((s, idx) => {
            s.scene_number = idx + 1;
        });
        
        setScenes(updatedScenes);
        showToast(`Scene added to Part ${partNum}`, 'success');
    };

    const handleDeletePart = (partNum) => {
        if (!confirm(`Are you sure you want to delete Part ${partNum} and all its scenes?`)) return;
        const updatedScenes = scenes.filter(s => (s.part || 1) !== partNum);
        updatedScenes.forEach((s, idx) => {
            s.scene_number = idx + 1;
        });
        setScenes(updatedScenes);
        showToast(`Part ${partNum} deleted`, 'success');
    };

    const handleDeleteScene = (index) => {
        if (!confirm("Are you sure you want to delete this scene?")) return;
        const updatedScenes = scenes.filter((_, idx) => idx !== index);
        updatedScenes.forEach((s, idx) => {
            s.scene_number = idx + 1;
        });
        setScenes(updatedScenes);
        showToast("Scene deleted", "success");
    };

    const handleDownload = () => {
        let content = `${title}\n\n`;
        scenes.forEach((scene, index) => {
            content += `--- Scene ${index + 1} (${scene.timestamp || ''}) ---\n`;
            if (scene.type) content += `Type: ${scene.type.toUpperCase()}\n`;
            content += `Narration:\n${scene.narration}\n\n`;
            if (scene.visual_suggestions) {
                content += `Visuals:\n${scene.visual_suggestions}\n\n`;
            }
            content += '\n';
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'script'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopyFullScript = () => {
        let fullText = `${title.toUpperCase()}\n\n`;
        scenes.forEach((scene, idx) => {
            fullText += `[SCENE ${idx + 1} - ${scene.timestamp || '0:00'}]\n${scene.narration}\n\n`;
        });
        navigator.clipboard.writeText(fullText);
        setCopiedRaw(true);
        showToast("Full script copied to clipboard!", "success");
        setTimeout(() => setCopiedRaw(false), 2000);
    };

    const totalWords = scenes.reduce((acc, s) => acc + (s.narration ? s.narration.split(/\s+/).filter(Boolean).length : 0), 0);
    const estMinutes = Math.ceil(totalWords / 150) || 1;
    const maxPartCount = Math.max(...scenes.map(s => s.part || 1), 1);

    if (loading) {
        return (
            <div className="flex h-screen bg-[#0a0a0f] text-white">
                <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0a0a0f] text-gray-100 font-sans">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                
                {/* Executive Top Navbar */}
                <div className="bg-[#111116] border-b border-white/10 px-4 sm:px-6 py-4 flex-shrink-0 z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push('/dashboard/scripts')}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                title="Back to Scripts"
                            >
                                <MdArrowBack className="w-5 h-5" />
                            </button>

                            <div className="flex-1 min-w-0">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="text-base sm:text-lg font-bold text-white bg-transparent border-none outline-none focus:ring-0 p-0 hover:bg-white/5 px-2 py-0.5 rounded transition-colors w-full"
                                    placeholder="Enter Script Title..."
                                />
                                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                                    <span className="flex items-center gap-1">
                                        <MdFormatListNumbered className="text-red-400" /> {scenes.length} Scenes
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <MdTimer className="text-amber-400" /> ~{estMinutes} min read ({totalWords} words)
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <MdLayers className="text-blue-400" /> {maxPartCount} Part{maxPartCount > 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
                            <button
                                onClick={handleDownload}
                                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 text-gray-300"
                            >
                                <MdDownload className="w-4 h-4 text-gray-400" /> Download TXT
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-red-900/20 disabled:opacity-50"
                            >
                                <MdSave className="w-4 h-4" />
                                {isSaving ? 'Saving...' : 'Save Script'}
                            </button>
                        </div>
                    </div>

                    {/* Section Switcher Tabs */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 overflow-x-auto">
                        <button
                            onClick={() => setActiveSection('scenes')}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                                activeSection === 'scenes'
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            <MdMovie className="w-4 h-4" /> Scene Breakdown
                        </button>
                        <button
                            onClick={() => setActiveSection('raw')}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                                activeSection === 'raw'
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            <MdContentCopy className="w-4 h-4" /> Full Teleprompter Text
                        </button>
                        <button
                            onClick={() => setActiveSection('production')}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                                activeSection === 'production'
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            <MdAudiotrack className="w-4 h-4" /> Audio & Image Studio
                        </button>
                    </div>
                </div>

                {/* Workspace Main Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
                    
                    {/* SECTION 1: SCENE BREAKDOWN */}
                    {activeSection === 'scenes' && (
                        <div className="max-w-5xl mx-auto space-y-6 pb-20">
                            {/* Top Action Bar */}
                            <div className="flex items-center justify-between gap-4 bg-[#111116] border border-white/10 rounded-2xl p-4">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">Scene-by-Scene Studio</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Edit narration, visual prompts, scene types, and timestamps.</p>
                                </div>
                                <button
                                    onClick={() => setShowExtendModal(true)}
                                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                                >
                                    <MdPlaylistAdd className="w-4 h-4 text-red-500" /> Extend Script +
                                </button>
                            </div>

                            {scenes.length > 0 ? renderSceneMapper() : (
                                <div className="text-center py-16 bg-[#111116] border border-white/10 rounded-2xl">
                                    <p className="text-gray-400 text-sm">No scenes found in this script.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 2: RAW TELEPROMPTER TEXT */}
                    {activeSection === 'raw' && (
                        <div className="max-w-4xl mx-auto space-y-4 pb-20">
                            <div className="flex items-center justify-between bg-[#111116] border border-white/10 rounded-2xl p-4">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">Full Raw Teleprompter Script</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Continuous text format for voice recording and teleprompter reading.</p>
                                </div>
                                <button
                                    onClick={handleCopyFullScript}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-red-900/20"
                                >
                                    {copiedRaw ? <MdCheckCircle className="w-4 h-4" /> : <MdContentCopy className="w-4 h-4" />}
                                    {copiedRaw ? "Copied!" : "Copy Full Text"}
                                </button>
                            </div>

                            <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 space-y-6">
                                {scenes.map((scene, idx) => (
                                    <div key={idx} className="border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1 flex items-center gap-1.5">
                                            <MdMovie className="w-3.5 h-3.5" /> Scene {idx + 1} ({scene.timestamp || '0:00'}) — {scene.type || 'body'}
                                        </div>
                                        <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-sans whitespace-pre-wrap">
                                            {scene.narration}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECTION 3: PRODUCTION AUDIO & IMAGE STUDIO */}
                    {activeSection === 'production' && (
                        <div className="max-w-5xl mx-auto space-y-6 pb-20">
                            <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 text-center space-y-2">
                                <h3 className="text-base font-bold uppercase tracking-wider text-white">Media Production Studio</h3>
                                <p className="text-xs text-gray-400">Generate or inspect voiceovers and visual assets generated for this script.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-red-500/30 transition-all">
                                    <div>
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                                            <MdAudiotrack className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                                            <MdAudiotrack className="text-blue-400" /> AI Voiceover Studio
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                            Convert scene narrations into realistic AI voice tracks.
                                        </p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            await handleSave();
                                            router.push('/dashboard/audio');
                                        }}
                                        className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                                    >
                                        <MdAudiotrack className="w-4 h-4" /> Open Audio Generator →
                                    </button>
                                </div>

                                <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-red-500/30 transition-all">
                                    <div>
                                        <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center mb-4 text-fuchsia-400">
                                            <MdImage className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                                            <MdImage className="text-fuchsia-400" /> AI Image Studio
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                            Auto-generate high-quality scene visuals or YouTube thumbnails.
                                        </p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            await handleSave();
                                            router.push('/dashboard/images');
                                        }}
                                        className="mt-6 w-full py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                                    >
                                        <MdImage className="w-4 h-4" /> Open Image Generator →
                                    </button>
                                </div>
                            </div>

                            {/* GENERATED AUDIO TRACKS LIST */}
                            <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                        <MdAudiotrack className="text-blue-400 w-4 h-4" /> Generated Voiceovers ({audios.length})
                                    </h4>
                                </div>

                                {audios.length === 0 ? (
                                    <p className="text-xs text-gray-500 py-4 text-center">No audio voiceovers generated for this script yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {audios.map(audio => (
                                            <div
                                                key={audio.id}
                                                onClick={() => router.push(`/dashboard/audio?script_id=${scriptData?.id || routeUuid}&audio_id=${audio.id}`)}
                                                className="bg-[#1c1c22] hover:bg-[#25252e] border border-white/5 hover:border-blue-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                                        <MdAudiotrack className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-white block group-hover:text-blue-400 transition-colors">{audio.voice_name || 'AI Voice Track'}</span>
                                                        <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">
                                                            Generated {new Date(audio.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/dashboard/audio?script_id=${scriptData?.id || routeUuid}&audio_id=${audio.id}`);
                                                    }}
                                                    className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-400 transition-all flex items-center gap-1"
                                                >
                                                    Listen & Manage in Audio Studio →
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* GENERATED IMAGES GALLERY */}
                            <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                        <MdImage className="text-fuchsia-400 w-4 h-4" /> Generated Scene Visuals ({images.length})
                                    </h4>
                                </div>

                                {images.length === 0 ? (
                                    <p className="text-xs text-gray-500 py-4 text-center">No visual images generated for this script yet.</p>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {images.map(img => (
                                            <div key={img.id} className="bg-[#1c1c22] border border-white/5 rounded-xl overflow-hidden group">
                                                <img src={img.url} alt="Scene Visual" className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                                                <div className="p-2">
                                                    <p className="text-[10px] text-gray-400 line-clamp-2 leading-tight">{img.prompt}</p>
                                                    <a
                                                        href={img.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-2 text-[10px] font-bold text-fuchsia-400 hover:underline block text-right"
                                                    >
                                                        View Full Image →
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Extend Script Modal */}
            {showExtendModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#111116] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Extend Script Pipeline</h3>
                            <button
                                onClick={() => setShowExtendModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="flex border-b border-white/10 bg-white/5">
                            <button
                                type="button"
                                onClick={() => setExtendMode('ai')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                                    extendMode === 'ai' ? 'text-red-400 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                AI Continuation
                            </button>
                            <button
                                type="button"
                                onClick={() => setExtendMode('manual')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                                    extendMode === 'manual' ? 'text-red-400 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Manual Blank Part
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {extendMode === 'ai' ? (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                            Custom Prompt / Extension Focus
                                        </label>
                                        <textarea
                                            value={extendInstructions}
                                            onChange={e => setExtendInstructions(e.target.value)}
                                            placeholder="Describe what should happen next in the script..."
                                            className="w-full bg-[#1c1c22] border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-red-500 min-h-[90px] resize-y custom-scrollbar"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                            Tone Preset
                                        </label>
                                        <select
                                            value={extendTone}
                                            onChange={e => setExtendTone(e.target.value)}
                                            className="w-full bg-[#1c1c22] border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-red-500"
                                        >
                                            <option value="">Match Original Tone</option>
                                            <option value="Sarcastic">Sarcastic & Funny</option>
                                            <option value="Excited">Excited & Hype</option>
                                            <option value="Mysterious">Mysterious & Suspenseful</option>
                                            <option value="Casual">Casual & Friendly</option>
                                            <option value="Professional">Professional & Informative</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                            Scene Count
                                        </label>
                                        <select
                                            value={extendSceneCount}
                                            onChange={e => setExtendSceneCount(Number(e.target.value))}
                                            className="w-full bg-[#1c1c22] border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-red-500"
                                        >
                                            <option value={3}>3 Scenes</option>
                                            <option value={4}>4 Scenes (Default)</option>
                                            <option value={5}>5 Scenes</option>
                                            <option value={8}>8 Scenes</option>
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <div className="py-4 text-center">
                                    <p className="text-gray-400 text-xs leading-relaxed">
                                        Adds a new Part section with a blank scene template for manual writing.
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                            <button
                                onClick={() => setShowExtendModal(false)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                            >
                                Cancel
                            </button>
                            {extendMode === 'ai' ? (
                                <button
                                    onClick={handleExtendScriptAI}
                                    disabled={isExtending}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                                >
                                    {isExtending ? 'Extending...' : 'Extend with AI'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleExtendScriptManual}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                                >
                                    Add Blank Part
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    function renderSceneMapper() {
        const scenesByPart = {};
        scenes.forEach((scene, index) => {
            const partNum = scene.part || 1;
            if (!scenesByPart[partNum]) {
                scenesByPart[partNum] = [];
            }
            scenesByPart[partNum].push({ ...scene, originalIndex: index });
        });

        return Object.keys(scenesByPart).sort((a, b) => Number(a) - Number(b)).map(partKey => {
            const partNum = Number(partKey);
            const partScenes = scenesByPart[partKey];
            return (
                <div key={partNum} className="space-y-4 border-l-2 border-red-500/30 pl-4 sm:pl-6 my-6 relative">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase tracking-wider">
                                Part {partNum}
                            </span>
                            <span className="text-xs text-gray-400">
                                {partNum === 1 ? "(Original Script)" : "(Continuation)"}
                            </span>
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAddSceneToPart(partNum)}
                                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-white/10"
                            >
                                + Add Scene
                            </button>
                            {partNum > 1 && (
                                <button
                                    onClick={() => handleDeletePart(partNum)}
                                    className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-red-500/20"
                                >
                                    Delete Part {partNum}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {partScenes.map(scene => {
                            const index = scene.originalIndex;
                            return (
                                <div key={index} className="bg-[#111116] border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-all">
                                    <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-lg bg-white/5 text-gray-300 font-mono text-xs flex items-center justify-center border border-white/10 font-bold">
                                                {scene.scene_number}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={scene.timestamp || ''}
                                                    onChange={(e) => handleSceneChange(index, 'timestamp', e.target.value)}
                                                    className="w-20 bg-[#1c1c22] border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-300 font-mono outline-none focus:border-red-500"
                                                    placeholder="0:00"
                                                />
                                                <select
                                                    value={scene.type || 'body'}
                                                    onChange={(e) => handleSceneChange(index, 'type', e.target.value)}
                                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#1c1c22] border border-white/10 text-gray-300 outline-none"
                                                >
                                                    <option value="intro">Intro</option>
                                                    <option value="body">Body</option>
                                                    <option value="interlude">Interlude</option>
                                                    <option value="outro">Outro</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteScene(index)}
                                            className="text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Delete Scene
                                        </button>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Narration Text</label>
                                            <textarea
                                                value={scene.narration}
                                                onChange={(e) => handleSceneChange(index, 'narration', e.target.value)}
                                                className="w-full bg-[#1c1c22] border border-white/10 text-gray-200 text-xs rounded-xl p-3 outline-none focus:border-red-500 min-h-[90px] leading-relaxed resize-y custom-scrollbar"
                                                placeholder="Type the narration text..."
                                            />
                                        </div>

                                        {scene.visual_suggestions !== undefined && (
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                                                    Visual Suggestions
                                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider font-bold">Image Gen Prompt</span>
                                                </label>
                                                <textarea
                                                    value={scene.visual_suggestions}
                                                    onChange={(e) => handleSceneChange(index, 'visual_suggestions', e.target.value)}
                                                    className="w-full bg-[#1c1c22] border border-white/10 text-gray-400 text-xs rounded-xl p-3 outline-none focus:border-emerald-500 min-h-[60px] leading-relaxed resize-y custom-scrollbar"
                                                    placeholder="Visual prompt for image generation..."
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        });
    }
}
