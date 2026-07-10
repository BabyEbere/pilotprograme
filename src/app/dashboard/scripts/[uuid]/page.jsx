"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import Sidebar from '@/components/Sidebar';
import { MdArrowBack, MdSave, MdPlaylistAdd, MdDownload, MdImage, MdAudiotrack } from 'react-icons/md';
import { Key } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

export default function ScriptEditor() {
    const { uuid: routeUuid } = useParams();
    const router = useRouter();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);

    // Core Data
    const [scriptData, setScriptData] = useState(null);
    const [title, setTitle] = useState('');
    const [scenes, setScenes] = useState([]);
    const [duration, setDuration] = useState(0);

    // Action states
    const [isSaving, setIsSaving] = useState(false);
    const [isExtending, setIsExtending] = useState(false);

    // Modal states for extension
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [extendMode, setExtendMode] = useState('ai');
    const [extendInstructions, setExtendInstructions] = useState('');
    const [extendTone, setExtendTone] = useState('');
    const [extendSceneCount, setExtendSceneCount] = useState(4);
    
    const { showToast, showQuotaModal } = useNotification();
    

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (routeUuid) {
            fetchScript();
        }
    }, [routeUuid]);

    const fetchScript = async () => {
        try {
            const response = await fetch(`${API_URL}/scripts/${routeUuid}`);
            const data = await response.json();

            if (data.success && data.script) {
                setScriptData(data.script);
                setTitle(data.script.title || '');
                setScenes(data.script.content?.scenes || []);
                setDuration(data.script.duration || 0);
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
                ...scriptData.content,
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
                // update local raw data
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

    const handleExtendScript = () => {
        setShowExtendModal(true);
    };

    const handleExtendScriptAI = async () => {
        if (isExtending) return;
        setIsExtending(true);

        try {
            // Must save current edits first so the AI has the latest context
            await handleSave();
            
            showToast('Extending script... (This takes a few seconds)', 'info');
            
            // Calculate next part number
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
                const newScenes = data.new_scenes || [];
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
                    message.toLowerCase().includes('429') ||
                    message.toLowerCase().includes('rate_limit') ||
                    message.toLowerCase().includes('rate limit');

                if (isQuotaError) {
                    showQuotaModal(message || "You've exceeded your Gemini API Key free tier quota. Please change or update your API Key in Settings to continue.");
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
            part: nextPart
        };
        
        const updatedScenes = [...scenes, newScene];
        setScenes(updatedScenes);
        setShowExtendModal(false);
        showToast(`Added Part ${nextPart} blank canvas!`, 'success');
        
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
            part: partNum
        };
        
        if (partNum === 1) {
            newScene.visual_suggestions = "";
        }
        
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

    const handleDeletePart = async (partNum) => {
        const confirm = await showConfirm(
            `Delete Part ${partNum}?`,
            `Are you sure you want to delete Part ${partNum} and all its scenes?`
        );
        if (!confirm) return;
        
        const updatedScenes = scenes.filter(s => (s.part || 1) !== partNum);
        updatedScenes.forEach((s, idx) => {
            s.scene_number = idx + 1;
        });
        setScenes(updatedScenes);
        showToast(`Part ${partNum} deleted`, 'success');
    };

    const handleDeleteScene = async (index) => {
        const confirm = await showConfirm(
            "Delete Scene?",
            "Are you sure you want to delete this scene?"
        );
        if (!confirm) return;

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

    const handleGenerateImages = async () => {
        // Save first to ensure the Images db pulls latest JSON
        await handleSave();
        router.push('/dashboard/images', { state: { presetScriptId: routeUuid } });
    };

    const handleGenerateAudio = async () => {
        // Save first so the Audio page can pre-load the script
        await handleSave();
        router.push('/dashboard/audio', { state: { presetScriptId: routeUuid } });
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a]">
                <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header Navbar */}
                <div className="bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-white/10 flex-shrink-0 z-10 transition-colors">
                    <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/dashboard/scripts')}
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-100 dark:bg-[#1a1a1a] transition-all"
                            >
                                <MdArrowBack className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-xl font-semibold text-gray-905 dark:text-white bg-transparent border-none outline-none focus:ring-0 p-0 hover:bg-gray-100 dark:hover:bg-gray-200 dark:bg-white/5 px-2 rounded -ml-2 transition-colors w-full max-w-xl"
                                placeholder="Enter Script Title..."
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
                            >
                                <MdSave className="w-4 h-4" />
                                {isSaving ? 'Saving...' : 'Save Script'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Workspace area (split pane) */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
                    
                    {/* Left Pane: Editor */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                        <div className="max-w-4xl mx-auto space-y-6 pb-20">
                            {scenes.length > 0 ? escenasMapper() : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-12">No scenes found in this script.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Pane: Actions Sidebar */}
                    <div className="w-full lg:w-80 bg-white dark:bg-[#111111] border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-white/10 flex-shrink-0 flex flex-col h-auto lg:h-full overflow-y-auto z-10 transition-colors">
                        <div className="p-5 space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-4">Export</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={handleDownload}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-gray-900 dark:text-white rounded-xl text-sm font-medium transition-all flex items-center gap-3 group shadow-sm"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-[#222] transition-colors">
                                            <MdDownload className="w-4 h-4" />
                                        </div>
                                        Download TXT
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-4">Production</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={handleGenerateAudio}
                                        className="w-full px-4 py-3 bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 text-blue-700 dark:text-blue-405 hover:text-blue-800 dark:hover:text-blue-300 rounded-xl text-sm font-medium transition-all flex items-center gap-3 group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                                            <MdAudiotrack className="w-4 h-4" />
                                        </div>
                                        <div className="text-left leading-tight">
                                            <div className="font-semibold block">Generate Audio</div>
                                            <div className="text-[10px] text-blue-600 dark:text-blue-500/60 block mt-0.5 uppercase tracking-wide">AI Voiceover</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleGenerateImages}
                                        className="w-full px-4 py-3 bg-fuchsia-500/10 border border-fuchsia-500/20 hover:border-fuchsia-500/40 text-fuchsia-700 dark:text-fuchsia-405 hover:text-fuchsia-800 dark:hover:text-fuchsia-300 rounded-xl text-sm font-medium transition-all flex items-center gap-3 group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 flex items-center justify-center group-hover:bg-fuchsia-500/30 transition-colors">
                                            <MdImage className="w-4 h-4" />
                                        </div>
                                        <div className="text-left leading-tight">
                                            <div className="font-semibold block">Generate Images</div>
                                            <div className="text-[10px] text-fuchsia-600 dark:text-fuchsia-500/60 block mt-0.5 uppercase tracking-wide">Scene Visuals</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-4">Modifications</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setShowExtendModal(true)}
                                        disabled={isExtending}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-gray-900 dark:text-white rounded-xl text-sm font-medium transition-all flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-[#222] transition-colors">
                                            <MdPlaylistAdd className="w-4 h-4" />
                                        </div>
                                        {isExtending ? 'Extending...' : 'Extend Script'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>



            {showExtendModal && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0f0f0f] border border-gray-250 dark:border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 transition-colors">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Extend Script Options</h3>
                            <button
                                onClick={() => setShowExtendModal(false)}
                                className="text-gray-550 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-900 dark:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Modal Tabs */}
                        <div className="flex border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                            <button
                                type="button"
                                onClick={() => setExtendMode('ai')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${extendMode === 'ai' ? 'text-purple-650 dark:text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                AI Continuation
                            </button>
                            <button
                                type="button"
                                onClick={() => setExtendMode('manual')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${extendMode === 'manual' ? 'text-purple-650 dark:text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                Write Manually
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {extendMode === 'ai' ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-550 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            What to add / Custom Instructions
                                        </label>
                                        <textarea
                                            value={extendInstructions}
                                            onChange={e => setExtendInstructions(e.target.value)}
                                            placeholder="Describe what should happen in this next part (e.g. 'Add a comparison with iPhone 16 spec list and explain why the battery is better')..."
                                            className="w-full bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-200 text-sm rounded-lg p-3 outline-none focus:border-purple-500 min-h-[100px] resize-y custom-scrollbar"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-550 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            Desired Tone
                                        </label>
                                        <select
                                            value={extendTone}
                                            onChange={e => setExtendTone(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-200 text-sm rounded-lg p-3 outline-none focus:border-purple-500"
                                        >
                                            <option value="">Match Existing Script Tone (Default)</option>
                                            <option value="Sarcastic">Sarcastic & Funny</option>
                                            <option value="Excited">Excited & Hype</option>
                                            <option value="Mysterious">Mysterious & Suspenseful</option>
                                            <option value="Casual">Casual & Friendly</option>
                                            <option value="Professional">Professional & Informative</option>
                                            <option value="Dramatic">Dramatic & Serious</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-555 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            Scenes to Add
                                        </label>
                                        <select
                                            value={extendSceneCount}
                                            onChange={e => setExtendSceneCount(Number(e.target.value))}
                                            className="w-full bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-200 text-sm rounded-lg p-3 outline-none focus:border-purple-500"
                                        >
                                            <option value={3}>3 Scenes (Short)</option>
                                            <option value={4}>4 Scenes (Standard)</option>
                                            <option value={5}>5 Scenes (Medium)</option>
                                            <option value={8}>8 Scenes (Long)</option>
                                            <option value={10}>10 Scenes (Extended)</option>
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <div className="py-4 text-center">
                                    <p className="text-gray-600 dark:text-gray-500 dark:text-gray-400 text-sm mb-4">
                                        This will add a new part (e.g. Part 2) with a blank scene to the bottom of the script. You will be able to write the narration and visuals yourself.
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-white/5 flex justify-end gap-3 bg-gray-50 dark:bg-white/[0.01]">
                            <button
                                onClick={() => setShowExtendModal(false)}
                                className="px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-205 dark:hover:bg-gray-200/50 dark:bg-white/10 text-gray-600 dark:text-gray-500 dark:text-gray-300 rounded-lg text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            {extendMode === 'ai' ? (
                                <button
                                    onClick={handleExtendScriptAI}
                                    disabled={isExtending}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    {isExtending ? 'Extending...' : 'Extend with AI'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleExtendScriptManual}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
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

    function escenasMapper() {
        // Group scenes by part
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
                <div key={partNum} className="space-y-6 border-l-2 border-purple-500/20 pl-4 sm:pl-6 py-2 my-8 relative">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 text-xs font-semibold">
                                Part {partNum}
                            </span>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400">
                                {partNum === 1 ? "(Original Script)" : "(Continuation)"}
                            </span>
                        </h2>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAddSceneToPart(partNum)}
                                className="px-3 py-1 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-gray-200/50 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-gray-900 dark:text-white rounded-lg text-xs font-medium transition-colors border border-gray-200 dark:border-transparent"
                            >
                                + Add Scene
                            </button>
                            {partNum > 1 && (
                                <button
                                    onClick={() => handleDeletePart(partNum)}
                                    className="px-3 py-1 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-650 dark:text-red-400 hover:text-red-750 dark:hover:text-red-300 rounded-lg text-xs font-medium transition-colors border border-red-200 dark:border-transparent"
                                >
                                    Delete Part {partNum}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        {partScenes.map(scene => {
                            const index = scene.originalIndex;
                            return (
                                <div key={index} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm group hover:border-gray-350 dark:hover:border-white/20 transition-colors focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50">
                                    
                                    {/* Scene Header */}
                                    <div className="px-5 py-3 border-b border-gray-150 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-black/50 text-gray-500 dark:text-gray-400 dark:text-gray-400 font-mono text-sm flex items-center justify-center border border-gray-200 dark:border-white/5">
                                                {scene.scene_number}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={scene.timestamp || ''}
                                                    onChange={(e) => handleSceneChange(index, 'timestamp', e.target.value)}
                                                    className="w-20 bg-white dark:bg-black/30 border border-gray-200 dark:border-white/5 rounded px-2 py-0.5 text-xs text-gray-800 dark:text-gray-300 font-mono focus:border-purple-500 focus:outline-none"
                                                    placeholder="0:00"
                                                />
                                                <select
                                                    value={scene.type || 'body'}
                                                    onChange={(e) => handleSceneChange(index, 'type', e.target.value)}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-white dark:bg-[#1a1a1a] border border-gray-250 dark:border-white/10 outline-none text-gray-700 dark:text-gray-300 cursor-pointer ${
                                                        scene.type === 'intro' ? 'text-blue-600 dark:text-blue-400 border-blue-500/20' :
                                                        scene.type === 'interlude' ? 'text-purple-600 dark:text-purple-400 border-purple-500/20' :
                                                        scene.type === 'outro' ? 'text-green-600 dark:text-green-400 border-green-500/20' :
                                                        'text-gray-500 dark:text-gray-400 dark:text-gray-400'
                                                    }`}
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
                                            className="text-xs text-red-650 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Delete Scene
                                        </button>
                                    </div>

                                    {/* Scene Content */}
                                    <div className="p-5 space-y-4">
                                        {/* Narration Block */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-650 dark:text-gray-500 uppercase tracking-widest mb-2">Narration</label>
                                            <textarea
                                                value={scene.narration}
                                                onChange={(e) => handleSceneChange(index, 'narration', e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 text-gray-800 dark:text-gray-300 text-sm rounded-lg p-3 outline-none focus:border-purple-500/50 min-h-[100px] leading-relaxed resize-y custom-scrollbar"
                                                placeholder="Type the narration for this scene..."
                                            />
                                        </div>

                                        {/* Visuals Block */}
                                        {scene.visual_suggestions !== undefined && (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-650 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                                                    Visual Prompts
                                                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 capitalize font-medium">Used for Image Gen</span>
                                                </label>
                                                <textarea
                                                    value={scene.visual_suggestions}
                                                    onChange={(e) => handleSceneChange(index, 'visual_suggestions', e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-500 dark:text-gray-400 text-sm rounded-lg p-3 outline-none focus:border-emerald-500/50 min-h-[60px] leading-relaxed resize-y custom-scrollbar"
                                                    placeholder="Describe exactly what should be shown on screen..."
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
