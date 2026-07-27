"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { 
    MdMovie, 
    MdDescription,
    MdDelete, 
    MdAutorenew, 
    MdInfoOutline, 
    MdChevronLeft, 
    MdChevronRight, 
    MdAutoAwesome,
    MdFolder,
    MdCreate,
    MdBook,
    MdVisibility
} from 'react-icons/md';
import Sidebar from '@/components/Sidebar';

export default function StoryToScript() {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [savedItems, setSavedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    // Active Section Tab: 'compiler', 'viewer', or 'library'
    const [activeTab, setActiveTab] = useState('compiler');

    // Tutorial Carousel
    const [showDemo, setShowDemo] = useState(true);
    const [demoSlide, setDemoSlide] = useState(0);
    const demoSlides = [
        {
            title: "⚡ Step 1: Select Story Outline from Library",
            desc: "Choose a saved story generated from your Story Writer. The Niche, Writing Style, and plot outline are auto-imported!"
        },
        {
            title: "✍️ Step 2: Dialogue Guidelines & Tone",
            desc: "Review or edit custom dialogue guidelines to ensure character dialects and speech tone match your vision."
        },
        {
            title: "📖 Step 3: View & Export Formal Screenplay",
            desc: "Click 'Convert Treatment to Script'. The AI opens the dedicated Screenplay Viewer with extended scenes!"
        }
    ];

    // Screenplay Compiler State
    const [selectedSavedStoryId, setSelectedSavedStoryId] = useState('');
    const [pastedStoryText, setPastedStoryText] = useState('');
    const [scriptTitle, setScriptTitle] = useState('My Screenplay');
    const [activeScriptUuid, setActiveScriptUuid] = useState('');
    const [customScriptInstructions, setCustomScriptInstructions] = useState('');
    const [scriptResult, setScriptResult] = useState(null);
    const [scriptHasMore, setScriptHasMore] = useState(false);

    // Dynamic Metadata Auto-Imported from Saved Story
    const [characters, setCharacters] = useState([]);
    const [niche, setNiche] = useState('Drama');
    const [style, setStyle] = useState('Nollywood / African Drama');
    const [theme, setTheme] = useState('');
    const [duration, setDuration] = useState(20);
    const [isSeasonal, setIsSeasonal] = useState(false);
    const [hasNarrator, setHasNarrator] = useState(true);
    const [storyFormat, setStoryFormat] = useState('roleplay'); // 'documentary' | 'roleplay'

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
    const userId = user.id || 1;

    const [subscription, setSubscription] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(true);

    useEffect(() => {
        document.title = 'Story to Script | AI Studio';
        fetchSavedItems();
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            const res = await fetch(`${API_URL}/plans/my-subscription?user_id=${userId}`);
            const data = await res.json();
            if (data.success && data.subscription) {
                setSubscription(data.subscription);
            }
        } catch (err) {
            console.error('Error fetching subscription:', err);
        } finally {
            setLoadingPlan(false);
        }
    };

    const fetchSavedItems = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/story/list?user_id=${userId}`);
            const data = await res.json();
            if (data.success) {
                setSavedItems(data.items);
            }
        } catch (err) {
            console.error('Error listing user stories:', err);
        }
    };

    const deleteItem = async (uuid, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this script?')) return;
        try {
            const res = await fetch(`${API_URL}/admin/story/${uuid}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchSavedItems();
                if (selectedItem && selectedItem.uuid === uuid) {
                    setSelectedItem(null);
                }
                if (activeScriptUuid === uuid) {
                    setScriptResult(null);
                    setActiveScriptUuid('');
                    setActiveTab('compiler');
                }
            }
        } catch (err) {
            alert('Deletion failed');
        }
    };

    const loadItemDetails = async (uuid) => {
        try {
            setLoading(true);
            setLoadingText('Loading screenplay...');
            const res = await fetch(`${API_URL}/admin/story/${uuid}`);
            const data = await res.json();
            if (data.success) {
                const item = data.item;
                setSelectedItem(item);
                
                setActiveScriptUuid(item.uuid);
                setScriptTitle(item.title);
                let contentJson = item.content;
                if (typeof contentJson === 'string') {
                    try { contentJson = JSON.parse(contentJson); } catch {}
                }
                setScriptResult(contentJson);
                if (contentJson && contentJson.story_segments && contentJson.current_segment_index !== undefined) {
                    const hasMore = contentJson.current_segment_index < (contentJson.story_segments.length - 1);
                    setScriptHasMore(hasMore);
                } else {
                    setScriptHasMore(false);
                }
                // Switch to dedicated Screenplay Viewer tab!
                setActiveTab('viewer');
            }
        } catch (err) {
            alert('Failed to load screenplay detail');
        } finally {
            setLoading(false);
        }
    };

    // Auto-import Niche, Writing Style, Title, Outline, Cast, and Dialogue Guidelines from selected saved story!
    const handleSourceStorySelect = async (storyId) => {
        setSelectedSavedStoryId(storyId);
        if (!storyId) return;
        const matched = savedItems.find(item => item.id.toString() === storyId);
        if (matched) {
            if (matched.niche) setNiche(matched.niche);
            if (matched.style) setStyle(matched.style);

            if (matched.title) {
                setScriptTitle(matched.title.replace(/^Story:\s*/i, ''));
            }

            setLoading(true);
            setLoadingText('Auto-importing story niche, writing style, & outline...');
            try {
                const res = await fetch(`${API_URL}/admin/story/${matched.uuid}`);
                const data = await res.json();
                if (data.success && data.item) {
                    const item = data.item;
                    if (item.niche) setNiche(item.niche);
                    if (item.style) setStyle(item.style);

                    const content = item.content;
                    let parsed = content;
                    if (typeof content === 'string') {
                        try { parsed = JSON.parse(content); } catch {}
                    }
                    
                    let treatmentProse = '';
                    if (parsed && parsed.chapters) {
                        treatmentProse = parsed.chapters.map(c => c.content).join("\n\n");
                    } else if (typeof content === 'string') {
                        treatmentProse = content;
                    }

                    if (treatmentProse) {
                        setPastedStoryText(treatmentProse);
                    }

                    if (parsed.metadata) {
                        const meta = parsed.metadata;
                        if (meta.niche) setNiche(meta.niche);
                        if (meta.style) setStyle(meta.style);
                        if (meta.theme) setTheme(meta.theme);
                        if (meta.duration) setDuration(meta.duration);
                        if (meta.is_seasonal !== undefined) setIsSeasonal(meta.is_seasonal);
                        if (meta.has_narrator !== undefined) setHasNarrator(meta.has_narrator);
                        if (meta.characters) setCharacters(meta.characters);
                    }

                    // Auto-generate dialogue guidelines for this saved story
                    if (treatmentProse || item.blueprint) {
                        await handleGenerateDialogueGuidelinesFromText(treatmentProse || item.blueprint);
                    }
                }
            } catch (err) {
                console.error("Error loading selected story metadata:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    // Helper to generate dialogue guidelines from text
    const handleGenerateDialogueGuidelinesFromText = async (storyText) => {
        if (!storyText.trim()) return;
        try {
            const res = await fetch(`${API_URL}/admin/story/analyze-dialogue-guidelines`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    story_text: storyText,
                    api_key: ''
                })
            });
            const data = await res.json();
            if (data.success && data.guidelines) {
                setCustomScriptInstructions(data.guidelines);
            }
        } catch (err) {
            console.error("Error auto-analyzing dialogue guidelines:", err);
        }
    };

    const handleGenerateScript = async (e, shouldContinue = false) => {
        if (e) e.preventDefault();
        
        if (!selectedSavedStoryId && !activeScriptUuid) {
            alert('Please select a saved story outline from the dropdown to generate its screenplay script!');
            return;
        }

        let storyUuidParam = undefined;
        let treatmentText = pastedStoryText;

        if (selectedSavedStoryId) {
            const matched = savedItems.find(item => item.id.toString() === selectedSavedStoryId);
            if (matched) {
                storyUuidParam = matched.uuid;
                if (!treatmentText.trim()) {
                    try {
                        const detailRes = await fetch(`${API_URL}/admin/story/${matched.uuid}`);
                        const detailData = await detailRes.json();
                        if (detailData.success) {
                            const content = detailData.item.content;
                            if (typeof content === 'object') {
                                treatmentText = content.chapters ? content.chapters.map(c => c.content).join("\n\n") : JSON.stringify(content);
                            } else {
                                treatmentText = content;
                            }
                        }
                    } catch {
                        alert('Error loading target saved story outline');
                        setLoading(false);
                        return;
                    }
                }
            }
        }

        setLoading(true);
        setLoadingText(shouldContinue ? 'Generating next extended scenes of movie script...' : 'Compiling high-retention movie script (Scene 1)...');

        const payload = {
            user_id: userId,
            title: scriptTitle,
            story_treatment: treatmentText,
            script_uuid: shouldContinue ? activeScriptUuid : undefined,
            story_uuid: storyUuidParam,
            custom_instructions: customScriptInstructions,
            niche: niche,
            style: style,
            theme: theme,
            duration: duration,
            is_seasonal: isSeasonal,
            has_narrator: hasNarrator,
            story_format: storyFormat,
            characters: characters,
            api_key: ''
        };

        try {
            const res = await fetch(`${API_URL}/admin/story/generate-script`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setScriptResult(data.script);
                setActiveScriptUuid(data.uuid);
                setScriptHasMore(data.has_more);
                fetchSavedItems();
                // Automatically switch to dedicated Screenplay Viewer tab!
                setActiveTab('viewer');
            } else {
                alert(data.message || 'Script generation failed.');
            }
        } catch (err) {
            alert('Error generating script screenplay');
        } finally {
            setLoading(false);
        }
    };

    const handleSyncToDashboard = async (targetDashboard) => {
        const uuidVal = activeScriptUuid;
        if (!uuidVal) {
            alert('Please select or generate a script first.');
            return;
        }
        setLoading(true);
        setLoadingText('Syncing script data for media generation...');
        try {
            const res = await fetch(`${API_URL}/admin/story/push-to-scripts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uuid: uuidVal,
                    user_id: userId
                })
            });
            const data = await res.json();
            if (data.success) {
                if (targetDashboard === 'audio') {
                    router.push('/dashboard/audio');
                } else if (targetDashboard === 'images') {
                    router.push('/dashboard/images');
                }
            } else {
                alert(data.message || 'Failed to sync script.');
            }
        } catch (err) {
            alert('Error syncing script to dashboard.');
        } finally {
            setLoading(false);
        }
    };

    const triggerDownload = async (uuid, format) => {
        if (!uuid) {
            alert('No active screenplay loaded to download.');
            return;
        }
        try {
            setLoading(true);
            setLoadingText(`Preparing ${format.toUpperCase()} download...`);
            const res = await fetch(`${API_URL}/admin/story/export?uuid=${uuid}&format=${format}`);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(err.message || 'Download failed.');
                return;
            }
            const blob = await res.blob();
            const disposition = res.headers.get('Content-Disposition') || '';
            let filename = `screenplay.${format}`;
            const match = disposition.match(/filename="?([^"]+)"?/);
            if (match) filename = match[1];
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            alert('Download failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const nextDemoSlide = () => {
        setDemoSlide((prev) => (prev + 1) % demoSlides.length);
    };

    const prevDemoSlide = () => {
        setDemoSlide((prev) => (prev - 1 + demoSlides.length) % demoSlides.length);
    };

    const maxStoryToScript = parseInt(subscription?.max_story_to_script || 0);
    const usedStoryToScript = parseInt(subscription?.used_story_to_script || 0);

    const savedDialogueScripts = savedItems.filter(i => i.type === 'script');
    const availableStories = savedItems.filter(i => i.type === 'story');

    return (
        <div className="flex h-screen bg-gray-55 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/5 pb-5 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <MdMovie className="w-3 h-3 text-yellow-500" /> Movie Screenplays & Dialogues
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                                <MdMovie className="text-red-500 w-6 h-6" /> Story to Script
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                            Select a story outline from your Story Writer library to compile it into a formal movie screenplay with actor dialogues.
                        </p>
                    </div>
                    
                    <button
                        onClick={() => setShowDemo(!showDemo)}
                        className="self-start md:self-auto bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all text-gray-700 dark:text-white"
                    >
                        <MdInfoOutline className="text-red-400 w-4 h-4" /> {showDemo ? "Hide Guide" : "View Guide"}
                    </button>
                </div>

                {/* Section Tabs Switcher: 3 Distinct Tabs! */}
                <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-white/10 pb-3 flex-wrap">
                    <button
                        onClick={() => setActiveTab('compiler')}
                        className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'compiler'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                    >
                        <MdCreate className="w-4 h-4" />
                        <span>1. Script Compiler</span>
                    </button>

                    <button
                        onClick={() => {
                            if (!scriptResult) {
                                alert('No active screenplay loaded yet. Select a story and click Convert Treatment to Script first!');
                                return;
                            }
                            setActiveTab('viewer');
                        }}
                        className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'viewer'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                : scriptResult 
                                    ? 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                                    : 'bg-gray-100/50 dark:bg-white/5 opacity-50 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <MdVisibility className="w-4 h-4 text-yellow-500" />
                        <span>2. View Screenplay {scriptResult ? `(${scriptTitle})` : ''}</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('library')}
                        className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'library'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                    >
                        <MdFolder className="w-4 h-4" />
                        <span>3. Saved Screenplays ({savedDialogueScripts.length})</span>
                    </button>
                </div>

                {showDemo && (
                    <div className="bg-gradient-to-r from-red-50 to-purple-50 dark:from-red-950/20 dark:to-purple-950/10 border border-red-200 dark:border-red-500/25 rounded-2xl p-4 sm:p-5 mb-6 relative overflow-hidden transition-all duration-300">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-red-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Guide Mode</span>
                                <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{demoSlides[demoSlide].title}</h4>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{demoSlides[demoSlide].desc}</p>
                            <div className="flex items-center gap-2">
                                <button onClick={prevDemoSlide} className="p-1 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 rounded-full">
                                    <MdChevronLeft className="w-4 h-4 text-gray-700 dark:text-white" />
                                </button>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono font-bold">{demoSlide + 1} / {demoSlides.length}</span>
                                <button onClick={nextDemoSlide} className="p-1 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 rounded-full">
                                    <MdChevronRight className="w-4 h-4 text-gray-700 dark:text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 1: SCRIPT COMPILER FORM ONLY */}
                {activeTab === 'compiler' && (
                    <div className="space-y-6">
                        {(!loadingPlan && (maxStoryToScript === 0 || usedStoryToScript >= maxStoryToScript)) ? (
                            <div className="min-h-[350px] flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-[#111111] rounded-3xl border border-gray-200 dark:border-white/10 relative overflow-hidden shadow-sm">
                                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-500/5">
                                    <MdMovie className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-gray-900 dark:text-white">Story to Script Locked</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-6">
                                    {maxStoryToScript === 0
                                        ? `Your current plan (${subscription?.plan_name || 'Free'}) does not support Story to Script conversion.`
                                        : `You have reached your limit of ${maxStoryToScript} Story to Script conversions on your current plan.`}
                                    {" "}Upgrade to a premium plan to convert outline summaries or treatments into full dialogues screenplays.
                                </p>
                                <button
                                    onClick={() => router.push('/dashboard/plans')}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
                                >
                                    Upgrade Plan
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={(e) => handleGenerateScript(e, false)} className="space-y-6">
                                
                                {/* SELECT SAVED STORY OUTLINE */}
                                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
                                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                            <MdBook className="text-red-500" /> Select Target Story Outline
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => router.push('/dashboard/story-writer')}
                                            className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 rounded-lg font-bold uppercase hover:bg-red-500/20 transition-all"
                                        >
                                            + Create Story in Story Writer
                                        </button>
                                    </div>

                                    {availableStories.length === 0 ? (
                                        <div className="p-4 bg-gray-50 dark:bg-[#16161c] border border-dashed border-gray-200 dark:border-white/10 rounded-xl text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">No story outlines found in your library.</p>
                                            <button
                                                type="button"
                                                onClick={() => router.push('/dashboard/story-writer')}
                                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl uppercase shadow"
                                            >
                                                Go to Story Writer to Create Story →
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
                                                    Choose Generated Story to Script:
                                                </label>
                                                <select
                                                    value={selectedSavedStoryId}
                                                    onChange={(e) => handleSourceStorySelect(e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3.5 py-3 text-xs text-gray-700 dark:text-white focus:outline-none font-bold"
                                                >
                                                    <option value="">-- Choose saved story outline from Story Writer --</option>
                                                    {availableStories.map(item => (
                                                        <option key={item.id} value={item.id}>{item.title} ({item.niche || 'Story'})</option>
                                                    ))}
                                                </select>
                                                {selectedSavedStoryId && (
                                                    <div className="mt-3">
                                                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs space-y-1">
                                                            <div className="font-bold text-white text-xs">✓ Target Story Ingested:</div>
                                                            <div>Genre/Niche: <strong className="text-white">{niche}</strong> | Writing Style: <strong className="text-white">{style}</strong></div>
                                                            {characters.length > 0 && (
                                                                <div>Cast Cards: <strong className="text-white">{characters.length} characters imported</strong> ({characters.map(c => c.name).filter(Boolean).join(', ')})</div>
                                                            )}
                                                        </div>

                                                        {/* STORY PRODUCTION FORMAT SELECTOR (DOCUMENTARY VS ROLE PLAY) */}
                                                        <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-2 mt-4">
                                                            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                Production Format / Screenplay Type
                                                            </label>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setStoryFormat('roleplay')}
                                                                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                                                                        storyFormat === 'roleplay'
                                                                            ? 'bg-red-600/10 border-red-500 text-gray-900 dark:text-white ring-1 ring-red-500/50'
                                                                            : 'bg-gray-50 dark:bg-[#1a1a1f] border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                                                    }`}
                                                                >
                                                                    <span className="text-xl">🎭</span>
                                                                    <div>
                                                                        <div className="font-bold text-xs flex items-center gap-1.5">
                                                                            <span>Role Play / Screenplay</span>
                                                                            {storyFormat === 'roleplay' && <span className="text-[9px] font-mono text-red-500 font-bold uppercase">✓ Active</span>}
                                                                        </div>
                                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                                                                            Generates dynamic character actor dialogues, speaker exchanges & roleplay interactions.
                                                                        </p>
                                                                    </div>
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => setStoryFormat('documentary')}
                                                                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                                                                        storyFormat === 'documentary'
                                                                            ? 'bg-red-600/10 border-red-500 text-gray-900 dark:text-white ring-1 ring-red-500/50'
                                                                            : 'bg-gray-50 dark:bg-[#1a1a1f] border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                                                    }`}
                                                                >
                                                                    <span className="text-xl">🎙️</span>
                                                                    <div>
                                                                        <div className="font-bold text-xs flex items-center gap-1.5">
                                                                            <span>Documentary / Narration</span>
                                                                            {storyFormat === 'documentary' && <span className="text-[9px] font-mono text-red-500 font-bold uppercase">✓ Active</span>}
                                                                        </div>
                                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                                                                            Pure voiceover narration only. No actor dialogues or speaker labels will be generated.
                                                                        </p>
                                                                    </div>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Screenplay Script Title</label>
                                                <input
                                                    type="text"
                                                    value={scriptTitle}
                                                    onChange={(e) => setScriptTitle(e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2.5 text-xs text-gray-700 dark:text-white focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* DIALOGUE GUIDELINES */}
                                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-gray-100 dark:border-white/5 pb-2">
                                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                            Dialogue Guidelines & Speaker Cues
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => handleGenerateDialogueGuidelinesFromText(pastedStoryText)}
                                            disabled={!selectedSavedStoryId}
                                            className="self-start sm:self-auto text-[10px] bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider transition-all shadow disabled:opacity-50"
                                        >
                                            ⚡ Refresh Dialogue Guidelines
                                        </button>
                                    </div>
                                    <textarea
                                        placeholder="Guidelines for character speech (e.g. 'Everyday conversational language, natural vocabulary, sharp comedic delivery...')"
                                        value={customScriptInstructions}
                                        onChange={(e) => setCustomScriptInstructions(e.target.value)}
                                        rows="3"
                                        className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl p-3 text-xs text-gray-700 dark:text-white focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !selectedSavedStoryId}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase py-3.5 rounded-2xl text-xs tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                                >
                                    <MdAutoAwesome className="w-4 h-4" /> Convert Treatment to Script
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* TAB 2: DEDICATED SCREENPLAY VIEWER & READER */}
                {activeTab === 'viewer' && (
                    <div>
                        {!scriptResult ? (
                            <div className="text-center py-12 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                                <MdVisibility className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">No active screenplay loaded yet.</p>
                                <button
                                    onClick={() => setActiveTab('compiler')}
                                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase"
                                >
                                    Go to Script Compiler
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-white/5 pb-3">
                                    <div>
                                        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider bg-yellow-500/10 px-2.5 py-0.5 rounded-full">Screenplay Reader</span>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-1">{scriptTitle}</h3>
                                        {scriptResult.total_duration && (
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Duration: {Math.round(scriptResult.total_duration)}s</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => triggerDownload(activeScriptUuid, 'txt')}
                                            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white"
                                        >
                                            TXT
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => triggerDownload(activeScriptUuid, 'docx')}
                                            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white"
                                        >
                                            DOCX
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => triggerDownload(activeScriptUuid, 'pdf')}
                                            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white"
                                        >
                                            PDF
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSyncToDashboard('audio')}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg px-3 py-1.5 text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 shadow"
                                        >
                                            🎙️ Voice Over
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSyncToDashboard('images')}
                                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg px-3 py-1.5 text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 shadow"
                                        >
                                            🎨 Generate Images
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar border border-gray-100 dark:border-white/5 rounded-xl p-4 sm:p-6 bg-gray-50 dark:bg-black/30">
                                    {scriptResult.scenes && scriptResult.scenes.map((scene, index) => (
                                        <div key={index} className="space-y-3 pb-6 border-b border-gray-200 dark:border-white/5 last:border-none last:pb-0">
                                            <div className="text-xs font-bold text-gray-800 dark:text-gray-300 font-mono tracking-wide uppercase bg-gray-200/50 dark:bg-white/5 px-3 py-1.5 rounded-lg inline-block">
                                                Scene {scene.scene_number || (index + 1)}: {scene.scene_title || scene.type || 'SCENE'}
                                            </div>
                                            
                                            {scene.visual_description && (
                                                <p className="text-xs italic text-gray-500 dark:text-gray-400 leading-relaxed font-sans bg-amber-500/5 p-2.5 rounded-lg border-l-2 border-amber-500/40">
                                                    Action: {scene.visual_description}
                                                </p>
                                            )}

                                            <div className="space-y-3 pl-3 sm:pl-4 border-l-2 border-red-500/30">
                                                {scene.dialogues && scene.dialogues.map((dlg, dIdx) => (
                                                    <div key={dIdx} className="space-y-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[11px] font-black text-red-500 uppercase tracking-wider">{dlg.speaker}</span>
                                                            {dlg.action && (
                                                                <span className="text-[9px] text-gray-500 dark:text-gray-400 italic">({dlg.action.toLowerCase()})</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-700 dark:text-gray-300 font-serif leading-relaxed">"{dlg.line}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {scriptHasMore && (
                                    <div className="pt-4 flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => handleGenerateScript(null, true)}
                                            disabled={loading}
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold uppercase px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow"
                                        >
                                            <MdAutorenew className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Continue Next Scene Generation
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: SAVED SCREENPLAYS LIBRARY */}
                {activeTab === 'library' && (
                    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/5 pb-3 mb-4">
                            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <MdFolder className="text-red-500 w-4 h-4" /> Saved Screenplays
                            </h3>
                            <span className="text-[10px] bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded-full">
                                {savedDialogueScripts.length} Saved
                            </span>
                        </div>

                        {savedDialogueScripts.length === 0 ? (
                            <div className="text-center py-12">
                                <MdFolder className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">No screenplays compiled yet.</p>
                                <button
                                    onClick={() => setActiveTab('compiler')}
                                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase"
                                >
                                    Compile New Screenplay
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {savedDialogueScripts.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => loadItemDetails(item.uuid)}
                                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between group ${
                                            selectedItem && selectedItem.uuid === item.uuid
                                                ? 'bg-red-500/5 border-red-500/30 ring-1 ring-red-500/20'
                                                : 'bg-gray-50 dark:bg-[#17171d]/60 border-gray-200 dark:border-white/5 hover:border-red-500/30'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full uppercase">
                                                    {item.niche || 'Screenplay'}
                                                </span>
                                                <button
                                                    onClick={(e) => deleteItem(item.uuid, e)}
                                                    className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                                    title="Delete"
                                                >
                                                    <MdDelete className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-red-500 transition-colors">
                                                {item.title}
                                            </h4>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                {item.style}
                                            </p>
                                        </div>

                                        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[10px] text-gray-400">
                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                            <span className="font-bold text-red-500 group-hover:translate-x-1 transition-transform">Read Screenplay →</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
