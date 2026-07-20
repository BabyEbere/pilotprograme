"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { 
    MdMovie, 
    MdDescription,
    MdFileUpload,
    MdDelete, 
    MdAutorenew, 
    MdInfoOutline, 
    MdChevronLeft, 
    MdChevronRight, 
    MdAutoAwesome
} from 'react-icons/md';
import Sidebar from '@/components/Sidebar';

export default function StoryToScript() {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [savedItems, setSavedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    // Tutorial Carousel
    const [showDemo, setShowDemo] = useState(true);
    const [demoSlide, setDemoSlide] = useState(0);
    const demoSlides = [
        {
            title: "⚡ Step 1: Select Story Source",
            desc: "Select a story you saved from the Story Writer, or upload/paste custom treatments."
        },
        {
            title: "✍️ Step 2: Auto-Generate Voiceover Dialogue Guidelines",
            desc: "Generate custom dialogue guidelines. This prompts the AI to keep language dialects and speaker tone consistent."
        },
        {
            title: "📖 Step 3: Sequential Scene Dialects compilation",
            desc: "Start screenplay script compilation. The AI will output scene-by-scene script files sequentially."
        }
    ];

    // Tab 2: Story to Script State
    const [inputSource, setInputSource] = useState('paste');
    const [selectedSavedStoryId, setSelectedSavedStoryId] = useState('');
    const [pastedStoryText, setPastedStoryText] = useState('');
    const [scriptTitle, setScriptTitle] = useState('My Screenplay');
    const [activeScriptUuid, setActiveScriptUuid] = useState('');
    const [customScriptInstructions, setCustomScriptInstructions] = useState('');
    const [scriptResult, setScriptResult] = useState(null);
    const [scriptHasMore, setScriptHasMore] = useState(false);
    const fileInputRef = useRef(null);

    // Dynamic List of Characters for script configuration
    const [characters, setCharacters] = useState([]);
    const [niche, setNiche] = useState('Drama');
    const [style, setStyle] = useState('Nollywood / African Drama');
    const [theme, setTheme] = useState('');
    const [duration, setDuration] = useState(20);
    const [isSeasonal, setIsSeasonal] = useState(false);
    const [hasNarrator, setHasNarrator] = useState(true);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
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
            }
        } catch (err) {
            alert('Failed to load screenplay detail');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setLoadingText('Parsing document text...');
        try {
            const res = await fetch(`${API_URL}/admin/story/extract-text`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setPastedStoryText(data.text);
                setInputSource('paste');
                alert(`Text extracted successfully from: ${data.filename}`);
            } else {
                alert(data.message || 'Text extraction failed.');
            }
        } catch (err) {
            alert('Network error parsing document');
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSourceStorySelect = async (storyId) => {
        setSelectedSavedStoryId(storyId);
        if (!storyId) return;
        const matched = savedItems.find(item => item.id.toString() === storyId);
        if (matched) {
            setLoading(true);
            setLoadingText('Ingesting story metadata...');
            try {
                const res = await fetch(`${API_URL}/admin/story/${matched.uuid}`);
                const data = await res.json();
                if (data.success && data.item) {
                    const content = data.item.content;
                    let parsed = content;
                    if (typeof content === 'string') {
                        try { parsed = JSON.parse(content); } catch {}
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
                }
            } catch (err) {
                console.error("Error loading selected story metadata:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleGenerateDialogueGuidelines = async () => {
        let treatmentText = pastedStoryText;

        if (inputSource === 'saved_story') {
            if (!selectedSavedStoryId) {
                alert('Please select a saved outline first.');
                return;
            }
            const matched = savedItems.find(item => item.id.toString() === selectedSavedStoryId);
            if (matched) {
                setLoading(true);
                setLoadingText('Loading saved story treatment...');
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
                    alert('Error loading saved story treatment.');
                    setLoading(false);
                    return;
                } finally {
                    setLoading(false);
                }
            }
        }

        if (!treatmentText.trim()) {
            alert('Source story treatment or pasted document is empty. Please enter/upload/select a story first!');
            return;
        }

        setLoading(true);
        setLoadingText('AI is analyzing the story plot to suggest dialogue guidelines...');

        const payload = {
            user_id: userId,
            story_text: treatmentText,
            api_key: ''
        };

        try {
            const res = await fetch(`${API_URL}/admin/story/analyze-dialogue-guidelines`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setCustomScriptInstructions(data.guidelines);
                alert('Dialogue guidelines generated! You can still edit them in the text box.');
            } else {
                alert(data.message || 'Analysis failed.');
            }
        } catch (err) {
            alert('Server error generating dialogue guidelines');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateScript = async (e, shouldContinue = false) => {
        if (e) e.preventDefault();
        setLoading(true);
        setLoadingText(shouldContinue ? 'Generating next segment of movie script...' : 'Initializing movie script compiler (Scene 1)...');
        
        let treatmentText = pastedStoryText;
        let storyUuidParam = undefined;

        if (inputSource === 'saved_story') {
            const matched = savedItems.find(item => item.id.toString() === selectedSavedStoryId);
            if (matched) {
                storyUuidParam = matched.uuid;
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

        if (!shouldContinue && !treatmentText.trim()) {
            alert('Please provide a story outline/treatment first.');
            setLoading(false);
            return;
        }

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

    return (
        <div className="flex h-screen bg-gray-55 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/5 pb-6 mb-6">
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                            <MdMovie className="text-red-500 w-6 h-6" /> Story to Script
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Convert your story outline or custom treatments into dialogue-driven screenplays.</p>
                    </div>
                    
                    <button
                        onClick={() => setShowDemo(!showDemo)}
                        className="self-start md:self-auto bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-gray-200/50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all text-gray-700 dark:text-white"
                    >
                        <MdInfoOutline className="text-red-400 w-4 h-4" /> {showDemo ? "Hide Guide" : "View Guide"}
                    </button>
                </div>

                {showDemo && (
                    <div className="bg-gradient-to-r from-red-50 to-purple-50 dark:from-red-950/20 dark:to-purple-950/10 border border-red-200 dark:border-red-500/25 rounded-2xl p-5 mb-6 relative overflow-hidden transition-all duration-300">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-red-500 text-gray-900 dark:text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Guide Mode</span>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{demoSlides[demoSlide].title}</h4>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{demoSlides[demoSlide].desc}</p>
                            <div className="flex items-center gap-2">
                                <button onClick={prevDemoSlide} className="p-1 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-gray-200/50 dark:bg-white/10 rounded-full">
                                    <MdChevronLeft className="w-4 h-4 text-gray-700 dark:text-white" />
                                </button>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono font-bold">{demoSlide + 1} / {demoSlides.length}</span>
                                <button onClick={nextDemoSlide} className="p-1 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-gray-200/50 dark:bg-white/10 rounded-full">
                                    <MdChevronRight className="w-4 h-4 text-gray-700 dark:text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-6">
                        {(!loadingPlan && (maxStoryToScript === 0 || usedStoryToScript >= maxStoryToScript)) ? (
                            <div className="min-h-[380px] flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-[#111111] rounded-3xl border border-gray-250 dark:border-white/10 relative overflow-hidden">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] bg-red-600/5 rounded-full blur-[70px] pointer-events-none"></div>
                                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/5 z-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-gray-900 dark:text-white z-10">Story to Script Locked</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-6 z-10">
                                    {maxStoryToScript === 0
                                        ? `Your current plan (${subscription?.plan_name || 'Free'}) does not support Story to Script conversion.`
                                        : `You have reached your limit of ${maxStoryToScript} Story to Script conversions on your current plan.`}
                                    {" "}Upgrade to a premium plan to convert outline summaries or treatments into full dialogues screenplays.
                                </p>
                                <button
                                    onClick={() => router.push('/dashboard/plans')}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md z-10 animate-pulse"
                                >
                                    Upgrade Plan
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={(e) => handleGenerateScript(e, false)} className="space-y-6">
                                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Convert Outline to Script Dialogue</h3>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Script Title</label>
                                    <input
                                        type="text"
                                        value={scriptTitle}
                                        onChange={(e) => setScriptTitle(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-white focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Source Treatment Outline</label>
                                    <div className="flex gap-4 mb-3">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                                            <input
                                                type="radio"
                                                name="inputSource"
                                                value="paste"
                                                checked={inputSource === 'paste'}
                                                onChange={(e) => setInputSource(e.target.value)}
                                                className="text-red-500 focus:ring-red-500"
                                            />
                                            Paste / Upload Document
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                                            <input
                                                type="radio"
                                                name="inputSource"
                                                value="saved_story"
                                                checked={inputSource === 'saved_story'}
                                                onChange={(e) => setInputSource(e.target.value)}
                                                className="text-red-500 focus:ring-red-500"
                                            />
                                            Select Saved Story Outlines
                                        </label>
                                    </div>

                                    {inputSource === 'paste' ? (
                                        <div className="space-y-3">
                                            <textarea
                                                placeholder="Paste story treatment chapters here, or upload a docx/pdf..."
                                                value={pastedStoryText}
                                                onChange={(e) => setPastedStoryText(e.target.value)}
                                                rows="6"
                                                className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl p-3 text-xs text-gray-700 dark:text-white focus:outline-none"
                                            />
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="file"
                                                    accept=".docx,.pdf,.txt"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-gray-200/50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all text-gray-700 dark:text-white"
                                                >
                                                    <MdFileUpload className="w-4 h-4 text-red-500" /> Ingest Treatment PDF / DOCX
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <select
                                            value={selectedSavedStoryId}
                                            onChange={(e) => handleSourceStorySelect(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-white focus:outline-none"
                                        >
                                            <option value="">-- Choose saved story outline --</option>
                                            {savedItems.filter(i => i.type === 'story').map(item => (
                                                <option key={item.id} value={item.id}>{item.title} ({item.niche})</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Dialogue Guidelines (Tones, Dialects, Dialect Guidelines)</label>
                                        <button
                                            type="button"
                                            onClick={handleGenerateDialogueGuidelines}
                                            className="text-[10px] bg-red-500 hover:bg-red-600 text-gray-900 dark:text-white px-2 py-0.5 rounded font-bold uppercase"
                                        >
                                            Auto-Generate Dialogue Guidelines
                                        </button>
                                    </div>
                                    <textarea
                                        placeholder="Specify guidelines for characters (e.g. 'Amara speaks with sharp, articulate British accent, never using slang. Tunde speaks colloquial street language...')"
                                        value={customScriptInstructions}
                                        onChange={(e) => setCustomScriptInstructions(e.target.value)}
                                        rows="3"
                                        className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl p-3 text-xs text-gray-700 dark:text-white focus:outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white font-bold uppercase py-3 rounded-2xl text-xs tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                <MdAutoAwesome className="w-4 h-4" /> Convert Treatment to Script
                            </button>
                        </form>
                        )}

                        {scriptResult && (
                            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-white/5 pb-3">
                                    <div>
                                        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider bg-yellow-500/10 px-2 py-0.5 rounded-full">Dialogue script</span>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-1">{scriptTitle}</h3>
                                        {scriptResult.total_duration && (
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Duration: {Math.round(scriptResult.total_duration)}s</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => triggerDownload(activeScriptUuid, 'txt')}
                                            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-gray-200/50 dark:bg-white/10 text-gray-700 dark:text-white"
                                        >
                                            TXT
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => triggerDownload(activeScriptUuid, 'docx')}
                                            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-gray-200/50 dark:bg-white/10 text-gray-700 dark:text-white"
                                        >
                                            DOCX
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => triggerDownload(activeScriptUuid, 'pdf')}
                                            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-gray-200/50 dark:bg-white/10 text-gray-700 dark:text-white"
                                        >
                                            PDF (Watermarked)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSyncToDashboard('audio')}
                                            className="bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white font-bold rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-wider transition-all flex items-center gap-1"
                                        >
                                            🎙️ Voice Over
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSyncToDashboard('images')}
                                            className="bg-amber-550 hover:bg-amber-600 text-gray-900 dark:text-white font-bold rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-wider transition-all flex items-center gap-1"
                                        >
                                            🎨 Generate Images
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar border border-gray-100 dark:border-white/5 rounded-xl p-4 bg-gray-50 dark:bg-black/25">
                                    {scriptResult.scenes && scriptResult.scenes.map((scene, index) => (
                                        <div key={index} className="space-y-3 pb-6 border-b border-gray-200 dark:border-white/5 last:border-none last:pb-0">
                                            <div className="text-xs font-bold text-gray-800 dark:text-gray-300 font-mono tracking-wide uppercase">
                                                Scene {scene.scene_number || (index + 1)}: {scene.scene_title || scene.type || 'SCENE'}
                                            </div>
                                            
                                            {scene.visual_description && (
                                                <p className="text-xs italic text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
                                                    Action: {scene.visual_description}
                                                </p>
                                            )}

                                            <div className="space-y-3 pl-4 border-l border-red-500/20">
                                                {scene.dialogues && scene.dialogues.map((dlg, dIdx) => (
                                                    <div key={dIdx} className="space-y-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">{dlg.speaker}</span>
                                                            {dlg.action && (
                                                                <span className="text-[9px] text-gray-500 dark:text-gray-400 italic">({dlg.action.toLowerCase()})</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-700 dark:text-gray-400 font-serif">"{dlg.line}"</p>
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
                                            className="bg-yellow-600 hover:bg-yellow-700 text-gray-900 dark:text-white font-bold uppercase px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow"
                                        >
                                            <MdAutorenew className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Continue Next Scene Generation
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-4">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Saved Dialogue Scripts</h3>
                            
                            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                                {savedItems.length === 0 ? (
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 py-4 text-center">No screenplays compiled yet.</p>
                                ) : (
                                    savedItems.filter(i => i.type === 'script').map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => loadItemDetails(item.uuid)}
                                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                                                selectedItem && selectedItem.uuid === item.uuid
                                                    ? 'bg-red-500/5 border-red-500/30'
                                                    : 'bg-gray-50 dark:bg-[#17171d]/60 border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-[#1b1b22]'
                                            }`}
                                        >
                                            <div className="mt-0.5 flex-shrink-0">
                                                <MdDescription className="text-amber-400 w-4 h-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.title}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => deleteItem(item.uuid, e)}
                                                className="text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors self-center flex-shrink-0"
                                            >
                                                <MdDelete className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {loading && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-[#111115] border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center max-w-xs w-full shadow-2xl space-y-4">
                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-300">{loadingText || "Synthesizing content..."}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
