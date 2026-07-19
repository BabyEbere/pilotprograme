"use client";

import { useState, useEffect, useRef } from 'react';
import { MdMovie, MdDescription, MdLink, MdFileUpload, MdContentCopy, MdDelete, MdVpnKey, MdPlayArrow, MdAutorenew, MdArrowForward, MdBook, MdSettings, MdPeople, MdAdd, MdPsychology, MdInfoOutline, MdChevronLeft, MdChevronRight, MdAutoAwesome } from 'react-icons/md';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminStoryLab() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('treatment');
    const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('story_lab_api_key') || '');
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [savedItems, setSavedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    // Interactive Demo / Tutorial Section Carousel
    const [showDemo, setShowDemo] = useState(true);
    const [demoSlide, setDemoSlide] = useState(0);
    const demoSlides = [
        {
            title: "⚡ Step 1: Auto-Brainstorm Concept & Cast",
            desc: "Select your genre & style, type a 1-sentence basic idea (e.g. 'A fisherman discovers a gold chest'), and click 'Auto-Brainstorm Cast'. The AI will immediately map out the theme, plot, and character flaw cards!"
        },
        {
            title: "✍️ Step 2: Manual Customization",
            desc: "Review the brainstormed character cards. You can edit names, change flaws/motivations, add new actors, or remove supporting cast dynamically. Perfect for setting up custom character relationships."
        },
        {
            title: "📖 Step 3: Progressive Chapter Extension",
            desc: "Generate Chapter 1. Then, use the progressive builder input at the bottom to tell the AI what should happen next (e.g. 'Chidi loses the map'). This keeps context crisp and writes infinite stories without limits."
        },
        {
            title: "🎬 Step 4: Convert to Dialogue Movie Script",
            desc: "Switch to the Story to Script tab, select your story source, and click 'Auto-Generate Dialogue Guidelines' to have the AI analyze dialects/tones. Tweak guidelines manually before converting!"
        }
    ];

    // Tab 1: Story Treatment State
    const [niche, setNiche] = useState('Drama');
    const [customNiche, setCustomNiche] = useState('');
    const [style, setStyle] = useState('Nollywood / African Drama');
    const [customStyle, setCustomStyle] = useState('');
    const [actorsLimit, setActorsLimit] = useState('Unlimited');
    const [theme, setTheme] = useState('');
    const [description, setDescription] = useState('');
    
    // Dynamic List of Characters
    const [characters, setCharacters] = useState([]);

    // Advanced Production controls
    const [duration, setDuration] = useState(20);
    const [isSeasonal, setIsSeasonal] = useState(false);
    const [hasNarrator, setHasNarrator] = useState(true);

    // Active Generation context for progressive writing
    const [activeStoryUuid, setActiveStoryUuid] = useState('');
    const [activeStoryTitle, setActiveStoryTitle] = useState('');
    const [activeStoryBlueprint, setActiveStoryBlueprint] = useState('');
    const [activeChapters, setActiveChapters] = useState([]);
    const [nextInstructions, setNextInstructions] = useState('');

    // Tab 2: Story to Script State
    const [inputSource, setInputSource] = useState('paste'); // 'paste' or 'saved_story'
    const [selectedSavedStoryId, setSelectedSavedStoryId] = useState('');
    const [pastedStoryText, setPastedStoryText] = useState('');
    const [scriptTitle, setScriptTitle] = useState('Feature Script');
    const [activeScriptUuid, setActiveScriptUuid] = useState('');
    const [customScriptInstructions, setCustomScriptInstructions] = useState('');
    const [scriptResult, setScriptResult] = useState(null);
    const [scriptHasMore, setScriptHasMore] = useState(false);
    const fileInputRef = useRef(null);

    // Tab 3: Blog to Script State
    const [blogUrl, setBlogUrl] = useState('');
    const [blogDuration, setBlogDuration] = useState(3);
    const [blogResult, setBlogResult] = useState(null);

    const [nichesList, setNichesList] = useState(['Drama', 'Action', 'Thriller', 'Comedy', 'Romance', 'Mystery']);
    const [stylesList, setStylesList] = useState(['Nollywood / African Drama', 'Hollywood Cinematic', 'Telenovela Drama', 'Short Film / TikTok Style', 'Documentary style']);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    useEffect(() => {
        fetchSavedItems();
        fetchPresets();
    }, []);

    const fetchPresets = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/story/presets`);
            const data = await res.json();
            if (data.success) {
                if (data.niches && data.niches.length > 0) setNichesList(data.niches);
                if (data.styles && data.styles.length > 0) setStylesList(data.styles);
            }
        } catch (err) {
            console.error('Error fetching presets:', err);
        }
    };

    const handleAddNichePreset = async () => {
        const val = prompt('Enter new Niche / Genre name:');
        if (!val || !val.trim()) return;
        try {
            const res = await fetch(`${API_URL}/admin/story/presets/niche`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: val.trim() })
            });
            const data = await res.json();
            if (data.success) {
                fetchPresets();
                setNiche(val.trim());
            } else {
                alert(data.message || 'Failed to add niche');
            }
        } catch {
            alert('Error adding niche preset');
        }
    };

    const handleDeleteNichePreset = async () => {
        if (!niche || niche === 'custom') return;
        if (!confirm(`Are you sure you want to delete preset: "${niche}"?`)) return;
        try {
            const res = await fetch(`${API_URL}/admin/story/presets/niche/${encodeURIComponent(niche)}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                fetchPresets();
                setNiche('Drama');
            } else {
                alert(data.message || 'Failed to delete niche');
            }
        } catch {
            alert('Error deleting niche preset');
        }
    };

    const handleAddStylePreset = async () => {
        const val = prompt('Enter new Writing Style name:');
        if (!val || !val.trim()) return;
        try {
            const res = await fetch(`${API_URL}/admin/story/presets/style`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: val.trim() })
            });
            const data = await res.json();
            if (data.success) {
                fetchPresets();
                setStyle(val.trim());
            } else {
                alert(data.message || 'Failed to add style');
            }
        } catch {
            alert('Error adding style preset');
        }
    };

    const handleDeleteStylePreset = async () => {
        if (!style || style === 'custom') return;
        if (!confirm(`Are you sure you want to delete preset: "${style}"?`)) return;
        try {
            const res = await fetch(`${API_URL}/admin/story/presets/style/${encodeURIComponent(style)}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                fetchPresets();
                setStyle('Nollywood / African Drama');
            } else {
                alert(data.message || 'Failed to delete style');
            }
        } catch {
            alert('Error deleting style preset');
        }
    };

    const saveApiKeyLocal = (val) => {
        setCustomApiKey(val);
        localStorage.setItem('story_lab_api_key', val);
    };

    const fetchSavedItems = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/story/list`);
            const data = await res.json();
            if (data.success) {
                setSavedItems(data.items);
            }
        } catch (err) {
            console.error('Error listing stories:', err);
        }
    };

    const deleteItem = async (uuid, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this asset?')) return;
        try {
            const res = await fetch(`${API_URL}/admin/story/${uuid}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchSavedItems();
                if (selectedItem && selectedItem.uuid === uuid) {
                    setSelectedItem(null);
                }
                if (activeStoryUuid === uuid) {
                    resetStoryContext();
                }
            }
        } catch (err) {
            alert('Deletion failed');
        }
    };

    const resetStoryContext = () => {
        setActiveStoryUuid('');
        setActiveStoryTitle('');
        setActiveStoryBlueprint('');
        setActiveChapters([]);
        setNextInstructions('');
    };

    const loadItemDetails = async (uuid) => {
        try {
            setLoading(true);
            setLoadingText('Loading record...');
            const res = await fetch(`${API_URL}/admin/story/${uuid}`);
            const data = await res.json();
            if (data.success) {
                const item = data.item;
                setSelectedItem(item);
                
                // If it's a story, populate the active editor so they can continue writing next chapters!
                if (item.type === 'story') {
                    setActiveStoryUuid(item.uuid);
                    setActiveStoryTitle(item.title);
                    setActiveStoryBlueprint(item.blueprint);
                    
                    let contentJson = item.content;
                    if (typeof contentJson === 'string') {
                        try { contentJson = JSON.parse(contentJson); } catch {}
                    }
                    
                    if (contentJson && contentJson.chapters) {
                        setActiveChapters(contentJson.chapters);
                        if (contentJson.metadata) {
                            const meta = contentJson.metadata;
                            if (meta.niche) setNiche(meta.niche);
                            if (meta.style) setStyle(meta.style);
                            if (meta.theme) setTheme(meta.theme);
                            if (meta.duration) setDuration(meta.duration);
                            if (meta.is_seasonal !== undefined) setIsSeasonal(meta.is_seasonal);
                            if (meta.has_narrator !== undefined) setHasNarrator(meta.has_narrator);
                            if (meta.characters) setCharacters(meta.characters);
                        }
                    } else {
                        // Fallback
                        setActiveChapters([{ chapter_number: 1, title: 'Chapter 1', content: item.content }]);
                    }
                    setActiveTab('treatment');
                } else if (item.type === 'script') {
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
                    setActiveTab('screenplay');
                }
            }
        } catch (err) {
            alert('Failed to load item detail');
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

    // ── AUTO BRAINSTORM CONCEPT & CAST ────────────────────────────────────────
    const handleAutoBrainstorm = async () => {
        if (!description.trim()) {
            alert('Please type a basic plot concept or seed idea in the text area first!');
            return;
        }

        setLoading(true);
        setLoadingText('AI is brainstorming characters, roles, and themes...');

        const payload = {
            user_id: userId,
            seed_idea: description,
            niche: niche === 'custom' ? customNiche : niche,
            style: style === 'custom' ? customStyle : style,
            duration: duration,
            is_seasonal: isSeasonal,
            api_key: customApiKey
        };

        try {
            const res = await fetch(`${API_URL}/admin/story/brainstorm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setTheme(data.theme);
                setDescription(data.plot_summary);
                setCharacters(data.characters || []);
                alert('Brainstorm complete! Review and adjust the generated cast list and theme below.');
            } else {
                alert(data.message || 'Brainstorming failed.');
            }
        } catch (err) {
            alert('Server error during brainstorm');
        } finally {
            setLoading(false);
        }
    };

    // Handle source story selection to sync characters and settings
    const handleSourceStorySelect = async (storyId) => {
        setSelectedSavedStoryId(storyId);
        if (!storyId) return;
        const matched = savedItems.find(item => item.id.toString() === storyId);
        if (matched) {
            setLoading(true);
            setLoadingText('Ingesting story metadata & cast cards...');
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

    const addCharacterCard = () => {
        setCharacters([
            ...characters,
            { name: '', role: 'Supporting', defect: '', motivation: '' }
        ]);
    };

    const updateCharacterCard = (idx, field, value) => {
        const updated = [...characters];
        updated[idx][field] = value;
        setCharacters(updated);
    };

    const removeCharacterCard = (idx) => {
        setCharacters(characters.filter((_, i) => i !== idx));
    };

    // ── AUTO GENERATE DIALOGUE GUIDELINES FROM SOURCE ─────────────────────────
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
            api_key: customApiKey
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

    // ── STORY GENERATOR (Chapter 1 & Extender) ────────────────────────────────
    const handleGenerateStory = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoadingText('Creating initial Story Treatment outline (Chapter 1)...');
        resetStoryContext();

        const payload = {
            user_id: userId,
            niche: niche === 'custom' ? customNiche : niche,
            style: style === 'custom' ? customStyle : style,
            actors_limit: actorsLimit,
            theme,
            description,
            is_seasonal: isSeasonal,
            has_narrator: hasNarrator,
            characters: characters,
            api_key: customApiKey
        };

        try {
            const res = await fetch(`${API_URL}/admin/story/generate-story`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setActiveStoryUuid(data.uuid);
                setActiveStoryBlueprint(data.blueprint);
                setActiveChapters(data.chapters);
                fetchSavedItems();
            } else {
                alert(data.message || 'Generation failed.');
            }
        } catch (err) {
            alert('Server error generating story treatment');
        } finally {
            setLoading(false);
        }
    };

    const handleExtendStory = async () => {
        if (!activeStoryUuid) return;
        setLoading(true);
        setLoadingText(`Brainstorming Chapter ${activeChapters.length + 1}...`);

        const payload = {
            user_id: userId,
            story_uuid: activeStoryUuid,
            next_instructions: nextInstructions,
            api_key: customApiKey
        };

        try {
            const res = await fetch(`${API_URL}/admin/story/generate-story`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setActiveChapters(data.chapters);
                setNextInstructions('');
                fetchSavedItems();
            } else {
                alert(data.message || 'Extension failed.');
            }
        } catch (err) {
            alert('Server error extending story treatment');
        } finally {
            setLoading(false);
        }
    };

    // ── TRANSLATE TO SCREENPLAY SCRIPT ────────────────────────────────────────
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
                    alert('Error loading target saved story treatment');
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

        // Pass full dynamic cast cards sheet and production controls state so the dialogue matches settings perfectly!
        const payload = {
            user_id: userId,
            title: scriptTitle,
            story_treatment: treatmentText,
            script_uuid: shouldContinue ? activeScriptUuid : undefined,
            story_uuid: storyUuidParam,
            custom_instructions: customScriptInstructions,
            niche: niche === 'custom' ? customNiche : niche,
            style: style === 'custom' ? customStyle : style,
            theme: theme,
            duration: duration,
            is_seasonal: isSeasonal,
            has_narrator: hasNarrator,
            characters: characters,
            api_key: customApiKey
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

    // ── BLOG TO CONTENT INGESTION ─────────────────────────────────────────────
    const handleBlogToScript = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoadingText('Crawling URL & Synthesizing script presentation...');
        setBlogResult(null);

        const payload = {
            user_id: userId,
            url: blogUrl,
            duration: blogDuration,
            api_key: customApiKey
        };

        try {
            const res = await fetch(`${API_URL}/admin/story/blog-to-script`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setBlogResult(data);
                fetchSavedItems();
            } else {
                alert(data.message || 'Blog parsing failed.');
            }
        } catch (err) {
            alert('Server error crawling webpage');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const triggerDownload = async (uuid, format) => {
        if (!uuid) {
            alert('No active document loaded to download.');
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
            let filename = `document.${format}`;
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

    return (
        <div className="flex h-screen bg-[#0d0d12] text-gray-900 dark:text-white overflow-hidden font-sans">
            <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                
                {/* Header section with API override */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                            <MdMovie className="text-red-500 w-7 h-7 animate-pulse" /> Admin Story Lab & Movie Script Builder
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Generate progressive treatments, brainstorm cast lists, and write dynamic dialogue scripts.</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowDemo(!showDemo)}
                            className="bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                        >
                            <MdInfoOutline className="text-red-400 w-4 h-4" /> {showDemo ? "Hide Demo Guide" : "Interactive Guide"}
                        </button>

                        <div className="bg-[#141419] border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3 max-w-xs w-full">
                            <MdVpnKey className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <input
                                type="password"
                                placeholder="Developer API Key Override..."
                                value={customApiKey}
                                onChange={(e) => saveApiKeyLocal(e.target.value)}
                                className="bg-transparent border-none text-xs w-full focus:outline-none placeholder-gray-600 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Interactive Demo Presentation Guide */}
                {showDemo && (
                    <div className="bg-gradient-to-r from-red-950/20 to-purple-950/10 border border-red-500/25 rounded-2xl p-6 mb-8 relative overflow-hidden transition-all duration-300">
                        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                            <MdPsychology className="w-48 h-48 text-red-500" />
                        </div>
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-red-500 text-gray-900 dark:text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Demo / Guide Mode</span>
                                <h4 className="text-sm font-black text-gray-900 dark:text-white">{demoSlides[demoSlide].title}</h4>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{demoSlides[demoSlide].desc}</p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={prevDemoSlide}
                                    className="p-1 bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 rounded-full text-gray-900 dark:text-white"
                                >
                                    <MdChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono font-bold">{demoSlide + 1} / {demoSlides.length}</span>
                                <button
                                    onClick={nextDemoSlide}
                                    className="p-1 bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 rounded-full text-gray-900 dark:text-white"
                                >
                                    <MdChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="flex border-b border-white/5 mb-8">
                    <button
                        onClick={() => setActiveTab('treatment')}
                        className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
                            activeTab === 'treatment'
                                ? 'border-red-500 text-gray-900 dark:text-white bg-white/[0.02]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        1. Story Treatment
                    </button>
                    <button
                        onClick={() => setActiveTab('screenplay')}
                        className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
                            activeTab === 'screenplay'
                                ? 'border-red-500 text-gray-900 dark:text-white bg-white/[0.02]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        2. Story to Script
                    </button>
                    <button
                        onClick={() => setActiveTab('blog')}
                        className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
                            activeTab === 'blog'
                                ? 'border-red-500 text-gray-900 dark:text-white bg-white/[0.02]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        3. Blog to Content
                    </button>
                </div>

                {/* Tab Body */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                    
                    {/* Inputs panel area */}
                    <div className="lg:col-span-5 bg-gray-50 dark:bg-[#111115] border border-white/5 rounded-2xl p-6 shadow-xl h-fit max-h-[85vh] overflow-y-auto custom-scrollbar">
                        
                        {activeTab === 'treatment' && (
                            <div className="space-y-6">
                                <div className="border-b border-white/5 pb-3">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                        <MdSettings className="text-red-500" /> Production Controls
                                    </h3>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Niche</label>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={handleAddNichePreset}
                                                    title="Add Niche Preset"
                                                    className="text-gray-500 dark:text-gray-400 hover:text-red-400 text-[8px] font-bold transition-colors"
                                                >
                                                    + Add
                                                </button>
                                                {niche && niche !== 'custom' && (
                                                    <button
                                                        type="button"
                                                        onClick={handleDeleteNichePreset}
                                                        title="Delete Niche Preset"
                                                        className="text-gray-500 dark:text-gray-400 hover:text-red-400 text-[8px] font-bold pl-1 border-l border-gray-300 dark:border-white/15 transition-colors"
                                                    >
                                                        ✕ Del
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <select
                                            value={niche}
                                            onChange={(e) => setNiche(e.target.value)}
                                            className="w-full bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none"
                                        >
                                            {nichesList.map((n) => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                            <option value="custom">-- Custom Niche --</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Length (Minutes)</label>
                                        <input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="w-full bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none"
                                        />
                                    </div>
                                </div>

                                {niche === 'custom' && (
                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Custom Niche Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Action Adventure"
                                            value={customNiche}
                                            onChange={(e) => setCustomNiche(e.target.value)}
                                            className="w-full bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white outline-none"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Style / Tone Preset</label>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={handleAddStylePreset}
                                                    title="Add Style Preset"
                                                    className="text-gray-500 dark:text-gray-400 hover:text-red-400 text-[8px] font-bold transition-colors"
                                                >
                                                    + Add
                                                </button>
                                                {style && style !== 'custom' && (
                                                    <button
                                                        type="button"
                                                        onClick={handleDeleteStylePreset}
                                                        title="Delete Style Preset"
                                                        className="text-gray-500 dark:text-gray-400 hover:text-red-400 text-[8px] font-bold pl-1 border-l border-gray-300 dark:border-white/15 transition-colors"
                                                    >
                                                        ✕ Del
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <select
                                            value={style}
                                            onChange={(e) => setStyle(e.target.value)}
                                            className="w-full bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none"
                                        >
                                            {stylesList.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                            <option value="custom">-- Custom Style --</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Actors Limit</label>
                                        <select
                                            value={actorsLimit}
                                            onChange={(e) => setActorsLimit(e.target.value)}
                                            className="w-full bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none"
                                        >
                                            <option value="Limit to 2 characters">Limit to 2 actors</option>
                                            <option value="Limit to 3 characters">Limit to 3 actors</option>
                                            <option value="Limit to 4 characters">Limit to 4 actors</option>
                                            <option value="Unlimited">Unlimited</option>
                                        </select>
                                    </div>
                                </div>

                                {style === 'custom' && (
                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Custom Style Description</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. High School Movie - Nigerian Standard"
                                            value={customStyle}
                                            onChange={(e) => setCustomStyle(e.target.value)}
                                            className="w-full bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white outline-none"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 bg-gray-100/50 dark:bg-white/[0.01] p-3 border border-white/5 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isSeasonal"
                                            checked={isSeasonal}
                                            onChange={(e) => setIsSeasonal(e.target.checked)}
                                            className="accent-red-500"
                                        />
                                        <label htmlFor="isSeasonal" className="text-[10px] text-gray-600 dark:text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider cursor-pointer">Series/Episode</label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="hasNarrator"
                                            checked={hasNarrator}
                                            onChange={(e) => setHasNarrator(e.target.checked)}
                                            className="accent-red-500"
                                        />
                                        <label htmlFor="hasNarrator" className="text-[10px] text-gray-600 dark:text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider cursor-pointer">Voiceover Narrator</label>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Plot Seed / Concept Description</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Type a basic plot concept here (e.g. 'A corrupt lawyer receives a text from his past self warning him about a trial')..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs outline-none resize-none font-sans text-gray-900 dark:text-white focus:border-red-500/50"
                                    />
                                </div>

                                {/* Auto Brainstorm trigger */}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleAutoBrainstorm}
                                        className="flex-1 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-950 hover:to-indigo-950 text-gray-900 dark:text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-1.5 border border-white/5"
                                    >
                                        <MdPsychology className="w-4.5 h-4.5" /> Auto-Brainstorm Cast
                                    </button>
                                </div>

                                {/* Character Mapping Section (Optional / Post-brainstorm) */}
                                <div className="border-b border-white/5 pb-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                            <MdPeople className="text-red-500" /> Dynamic Cast Cards
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addCharacterCard}
                                            className="bg-gray-200 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 text-gray-900 dark:text-white p-1 rounded-lg flex items-center gap-1 text-[10px] border border-gray-200 dark:border-white/10 font-bold"
                                        >
                                            <MdAdd /> Add Actor
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {characters.length > 0 ? (
                                        characters.map((char, idx) => (
                                            <div key={idx} className="bg-white/[0.015] border border-white/5 rounded-xl p-4 space-y-3 relative">
                                                <button
                                                    type="button"
                                                    onClick={() => removeCharacterCard(idx)}
                                                    className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-red-500"
                                                >
                                                    <MdDelete className="w-4 h-4" />
                                                </button>
                                                
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[8px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Actor Name</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Chidi"
                                                            value={char.name}
                                                            onChange={(e) => updateCharacterCard(idx, 'name', e.target.value)}
                                                            className="w-full bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[8px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Role</label>
                                                        <select
                                                            value={char.role}
                                                            onChange={(e) => updateCharacterCard(idx, 'role', e.target.value)}
                                                            className="w-full bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-gray-900 dark:text-white"
                                                        >
                                                            <option value="Protagonist">Protagonist</option>
                                                            <option value="Antagonist">Antagonist</option>
                                                            <option value="Supporting">Supporting</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[8px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Blindspot / Flaw</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Distrust of family"
                                                        value={char.defect}
                                                        onChange={(e) => updateCharacterCard(idx, 'defect', e.target.value)}
                                                        className="w-full bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs text-gray-900 dark:text-white"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-[8px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Motivation</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Securing scholarship"
                                                        value={char.motivation}
                                                        onChange={(e) => updateCharacterCard(idx, 'motivation', e.target.value)}
                                                        className="w-full bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[10px] text-gray-600 dark:text-gray-500 text-center py-4 bg-white/[0.005] border border-dashed border-white/5 rounded-xl">
                                            No character presets loaded. Click 'Auto-Brainstorm' above or 'Add Actor' to manually map the cast.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Core Theme / Message</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Trust is earned, not inherited"
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        className="w-full bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs outline-none"
                                    />
                                </div>

                                <form onSubmit={handleGenerateStory}>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-red-650 hover:bg-red-700 text-gray-900 dark:text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-red-950/20 flex items-center justify-center gap-2"
                                    >
                                        <MdPlayArrow className="w-4 h-4" /> Generate Story Outline
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'screenplay' && (
                            <div className="space-y-6">
                                <div className="border-b border-white/5 pb-3">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-500 dark:text-gray-400">Movie Script Generator Options</h3>
                                </div>

                                <div>
                                    <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Script Title</label>
                                    <input
                                        type="text"
                                        value={scriptTitle}
                                        onChange={(e) => setScriptTitle(e.target.value)}
                                        className="w-full bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Dialogue Guidelines</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Auto-generate or type custom dialogue guidelines..."
                                            value={customScriptInstructions}
                                            onChange={(e) => setCustomScriptInstructions(e.target.value)}
                                            className="flex-1 bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGenerateDialogueGuidelines}
                                            className="bg-purple-900 hover:bg-purple-950 border border-purple-800 text-purple-200 rounded-xl px-3 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                                            title="Analyze the story concept/pasted text and automatically suggest dialogue guidelines"
                                        >
                                            <MdAutoAwesome /> Smart Suggest
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Prose Outline Source</label>
                                    <div className="flex gap-2 mb-3">
                                        <button
                                            type="button"
                                            onClick={() => setInputSource('paste')}
                                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                                                inputSource === 'paste'
                                                    ? 'bg-red-500/10 border-red-500 text-red-400'
                                                    : 'bg-transparent border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-500 dark:text-gray-400'
                                            }`}
                                        >
                                            Paste or Upload Document
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setInputSource('saved_story')}
                                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                                                inputSource === 'saved_story'
                                                    ? 'bg-red-500/10 border-red-500 text-red-400'
                                                    : 'bg-transparent border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-500 dark:text-gray-400'
                                            }`}
                                        >
                                            Select Saved Outline
                                        </button>
                                    </div>

                                    {inputSource === 'saved_story' ? (
                                        <select
                                            value={selectedSavedStoryId}
                                            onChange={(e) => handleSourceStorySelect(e.target.value)}
                                            className="w-full bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white outline-none"
                                        >
                                            <option value="">Choose a saved treatment...</option>
                                            {savedItems
                                                .filter(item => item.type === 'story')
                                                .map(item => (
                                                    <option key={item.id} value={item.id}>{item.title} ({item.niche})</option>
                                                ))
                                            }
                                        </select>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* File upload trigger */}
                                            <div className="flex items-center justify-between bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10 rounded-xl p-4">
                                                <div className="flex items-center gap-3">
                                                    <MdFileUpload className="text-gray-500 dark:text-gray-400 w-6 h-6" />
                                                    <div>
                                                        <p className="text-[10px] font-bold">Ingest Script Document</p>
                                                        <p className="text-[8px] text-gray-500 dark:text-gray-400">Supports .txt, .pdf, .docx</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider hover:bg-gray-200/50 dark:bg-white/10"
                                                >
                                                    Upload
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    accept=".txt,.pdf,.docx"
                                                    className="hidden"
                                                />
                                            </div>

                                            <textarea
                                                rows="8"
                                                placeholder="Paste your story chapters or treatments here..."
                                                value={pastedStoryText}
                                                onChange={(e) => setPastedStoryText(e.target.value)}
                                                className="w-full bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white outline-none resize-none font-mono"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Shared Cast Cards Preview in Tab 2 */}
                                <div className="border-t border-white/5 pt-4 mt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-500 dark:text-gray-400">Target Cast List Profile</h4>
                                        <span className="text-[8px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-mono font-bold">Active Cast</span>
                                    </div>
                                    {characters.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            {characters.map((char, idx) => (
                                                <div key={idx} className="p-2.5 bg-gray-100/50 dark:bg-white/[0.01] border border-white/5 rounded-lg">
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center justify-between">
                                                        <span>{char.name || 'Unnamed'}</span>
                                                        <span className="text-[8px] uppercase tracking-wider text-gray-500 dark:text-gray-400">{char.role}</span>
                                                    </p>
                                                    <p className="text-[9px] text-gray-500 dark:text-gray-400 truncate mt-0.5">Flaw: {char.defect || 'None'}</p>
                                                    <p className="text-[9px] text-gray-500 dark:text-gray-400 truncate">Want: {char.motivation || 'Survival'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[9px] text-gray-600 dark:text-gray-500 bg-white/[0.005] p-3 rounded-lg border border-dashed border-white/5 text-center">
                                            No character sheet cards linked. Type or upload source to brainstorm them.
                                        </p>
                                    )}
                                </div>

                                <form onSubmit={handleGenerateScript}>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-red-650 hover:bg-red-700 text-gray-900 dark:text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-red-950/20"
                                    >
                                        Convert to Dialogue Movie Script
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'blog' && (
                            <form onSubmit={handleBlogToScript} className="space-y-6">
                                <div className="border-b border-white/5 pb-3">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-500 dark:text-gray-400">Blog Ingestion settings</h3>
                                </div>

                                <div>
                                    <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Article URL</label>
                                    <div className="relative">
                                        <MdLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gray-500 dark:text-gray-400" />
                                        <input
                                            type="url"
                                            placeholder="https://example.com/blog-post"
                                            value={blogUrl}
                                            onChange={(e) => setBlogUrl(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-600 text-xs focus:ring-1 focus:ring-red-500/35 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Target Video Duration</label>
                                    <select
                                        value={blogDuration}
                                        onChange={(e) => setBlogDuration(parseInt(e.target.value))}
                                        className="w-full bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-red-500/50"
                                    >
                                        <option value={1}>1 Minute (YouTube Short)</option>
                                        <option value={3}>3 Minutes (Medium Monologue)</option>
                                        <option value={5}>5 Minutes (Detailed Presentation)</option>
                                        <option value={10}>10 Minutes (Full Deep Dive)</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-650 hover:bg-red-700 text-gray-900 dark:text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-red-950/20"
                                >
                                    Crawl & Generate Monologue Script
                                </button>
                            </form>
                        )}

                    </div>

                    {/* Output results dashboard area */}
                    <div className="lg:col-span-7 bg-gray-50 dark:bg-[#111115] border border-white/5 rounded-2xl p-6 shadow-xl min-h-[500px] flex flex-col justify-between relative max-h-[85vh] overflow-y-auto custom-scrollbar">
                        
                        {/* Loading Overlay */}
                        {loading && (
                            <div className="absolute inset-0 bg-[#0d0d12]/75 backdrop-blur-sm z-30 rounded-2xl flex flex-col items-center justify-center gap-4">
                                <MdAutorenew className="w-10 h-10 animate-spin text-red-500" />
                                <p className="text-xs uppercase font-bold tracking-widest text-gray-600 dark:text-gray-500 dark:text-gray-400">{loadingText}</p>
                            </div>
                        )}

                        <div className="flex-1">
                            
                            {/* Tab 1: Progressive story generator workspace */}
                            {activeTab === 'treatment' && activeChapters.length > 0 && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-wider text-red-400">Story Treatment Panel</h4>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Progressive chapters generated for: {activeStoryTitle || 'Untitled Story'}</p>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <select
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        triggerDownload(activeStoryUuid, e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                                className="bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:bg-gray-200/50 dark:bg-white/10"
                                            >
                                                <option value="">Download Outline...</option>
                                                <option value="txt">TXT Document</option>
                                                <option value="docx">Word Document (.docx)</option>
                                                <option value="pdf">PDF Document (.pdf)</option>
                                            </select>

                                            <button
                                                onClick={() => copyToClipboard(activeChapters.map(c => c.content).join("\n\n"))}
                                                className="bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold hover:bg-gray-200/50 dark:bg-white/10"
                                            >
                                                Copy All Chapters
                                            </button>
                                            <button
                                                onClick={resetStoryContext}
                                                className="bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold hover:bg-gray-200/50 dark:bg-white/10 text-red-400"
                                            >
                                                Start New
                                            </button>
                                        </div>
                                    </div>

                                    {/* Sidebar blueprint + Story book side-by-side */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[400px]">
                                        <div className="md:col-span-4 border border-white/5 rounded-xl p-4 bg-white/[0.005] overflow-y-auto custom-scrollbar">
                                            <h5 className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1"><MdSettings /> Blueprint Setup</h5>
                                            <pre className="text-[10px] font-mono whitespace-pre-wrap text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">{activeStoryBlueprint}</pre>
                                        </div>

                                        <div className="md:col-span-8 border border-white/5 rounded-xl p-6 bg-white/[0.015] overflow-y-auto custom-scrollbar space-y-6">
                                            <h5 className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MdBook /> Fleshed Chapters</h5>
                                            
                                            {activeChapters.map((chapter) => (
                                                <div key={chapter.chapter_number} className="prose-layout border-b border-white/5 last:border-0 pb-6 last:pb-0">
                                                    <div className="text-xs text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap font-serif bg-black/10 p-4 rounded-xl border border-white/[0.02]">
                                                        {chapter.content}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Progressive chapter builder prompt */}
                                    <div className="bg-gray-100/50 dark:bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold uppercase text-gray-600 dark:text-gray-500 dark:text-gray-400">Continue Story: What happens in Chapter {activeChapters.length + 1}?</label>
                                            <span className="text-[9px] text-gray-500 dark:text-gray-400 font-mono">Sequence outline context active</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                placeholder="e.g. The antagonist discovers the document and threatens the protagonist..."
                                                value={nextInstructions}
                                                onChange={(e) => setNextInstructions(e.target.value)}
                                                className="flex-1 bg-white dark:bg-[#16161a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleExtendStory}
                                                className="bg-red-650 hover:bg-red-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                                            >
                                                Write Next Chapter <MdArrowForward />
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* Tab 2: Movie Dialogue Script results */}
                            {activeTab === 'screenplay' && scriptResult && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-wider text-red-400">Dialogue Movie Script</h4>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Formatted dialogue scenes. Copy to feed into TTS or Video Creator.</p>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <select
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        triggerDownload(activeScriptUuid, e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                                className="bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:bg-gray-200/50 dark:bg-white/10"
                                            >
                                                <option value="">Download Script...</option>
                                                <option value="txt">TXT Document</option>
                                                <option value="docx">Word Document (.docx)</option>
                                                <option value="pdf">PDF Document (.pdf)</option>
                                            </select>

                                            <button
                                                onClick={() => copyToClipboard(JSON.stringify(scriptResult, null, 2))}
                                                className="bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1 flex items-center gap-1.5 text-[10px] font-bold hover:bg-gray-200/50 dark:bg-white/10"
                                            >
                                                <MdContentCopy /> Copy JSON Script
                                            </button>
                                        </div>
                                    </div>

                                    <div className="h-[420px] border border-white/5 rounded-xl bg-gray-100/50 dark:bg-white/[0.01] p-4 overflow-y-auto custom-scrollbar space-y-6">
                                        {scriptResult.scenes.map((scene, idx) => (
                                            <div key={idx} className="border-b border-gray-200 dark:border-white/10 last:border-0 pb-6 last:pb-0 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-mono bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider">
                                                        SCENE {scene.scene_number}: {scene.scene_title}
                                                    </span>
                                                </div>
                                                
                                                <div className="bg-black/35 border border-white/5 p-3 rounded-lg text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">
                                                    <span className="font-extrabold text-[8px] uppercase tracking-widest text-gray-600 dark:text-gray-500 block mb-1">Visuals / Stage Directions</span>
                                                    {scene.visual_description}
                                                </div>

                                                <div className="space-y-4 pl-3 border-l border-white/5">
                                                    {scene.dialogues && scene.dialogues.map((dlg, dIdx) => (
                                                        <div key={dIdx} className="text-xs space-y-1">
                                                            <span className="font-extrabold text-red-400 uppercase tracking-widest block text-[10px]">
                                                                {dlg.speaker} {dlg.action && <span className="text-gray-500 dark:text-gray-400 text-[9px] lowercase italic font-normal">({dlg.action})</span>}
                                                            </span>
                                                            <p className="text-gray-900 dark:text-white font-serif leading-relaxed pl-2 text-xs">
                                                                "{dlg.line}"
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        {scriptHasMore && (
                                            <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex justify-center pb-2">
                                                <button
                                                    onClick={(e) => handleGenerateScript(e, true)}
                                                    className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-gray-900 dark:text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg animate-pulse flex items-center gap-1.5"
                                                >
                                                    <MdPlayArrow className="w-4 h-4" /> Continue Generating Next Scenes ({scriptResult.current_segment_index + 2} / {scriptResult.story_segments ? scriptResult.story_segments.length : '?'})
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Blog Ingest Result Monologue */}
                            {activeTab === 'blog' && blogResult && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                        <h4 className="text-xs font-black uppercase tracking-wider text-red-400">Ingested Script Presentation</h4>
                                        <div className="flex gap-2 items-center">
                                            <select
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        triggerDownload(blogResult.uuid, e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                                className="bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:bg-gray-200/50 dark:bg-white/10"
                                            >
                                                <option value="">Download Presentation...</option>
                                                <option value="txt">TXT Document</option>
                                                <option value="docx">Word Document (.docx)</option>
                                                <option value="pdf">PDF Document (.pdf)</option>
                                            </select>

                                            <button
                                                onClick={() => copyToClipboard(JSON.stringify(blogResult.script, null, 2))}
                                                className="bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1 flex items-center gap-1.5 text-[10px] font-bold hover:bg-gray-200/50 dark:bg-white/10"
                                            >
                                                <MdContentCopy /> Copy JSON Presentation
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                                        <div className="border border-white/5 rounded-xl p-4 bg-gray-100/50 dark:bg-white/[0.01] overflow-y-auto custom-scrollbar">
                                            <h5 className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Stage 1: Blog Concept Blueprint</h5>
                                            <pre className="text-[10px] font-mono whitespace-pre-wrap text-gray-600 dark:text-gray-500 dark:text-gray-400 leading-relaxed">{blogResult.blueprint}</pre>
                                        </div>
                                        <div className="border border-white/5 rounded-xl p-4 bg-white/[0.02] overflow-y-auto custom-scrollbar space-y-5">
                                            <h5 className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Stage 2: Script Presenter Monologue</h5>
                                            {blogResult.script.scenes.map((scene, idx) => (
                                                <div key={idx} className="border-b border-gray-200 dark:border-white/10 last:border-0 pb-4 last:pb-0 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider">SCENE {scene.scene_number}: {scene.scene_title}</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 italic bg-black/20 p-2 rounded">
                                                        Visual: {scene.visual_description}
                                                    </div>
                                                    <div className="space-y-3 pl-2">
                                                        {scene.dialogues && scene.dialogues.map((dlg, dIdx) => (
                                                            <div key={dIdx} className="text-xs">
                                                                <span className="font-bold text-gray-700 dark:text-gray-300 block text-[9px] uppercase">{dlg.speaker} ({dlg.action})</span>
                                                                <p className="text-gray-900 dark:text-white mt-1 leading-relaxed font-sans">"{dlg.line}"</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Fallback Landing page */}
                            {((activeTab === 'treatment' && activeChapters.length === 0) ||
                              (activeTab === 'screenplay' && !scriptResult) ||
                              (activeTab === 'blog' && !blogResult)) && (
                                <div className="h-[400px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/5 rounded-xl bg-white/[0.005]">
                                    <MdMovie className="w-12 h-12 text-gray-700 mb-3 animate-pulse" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-500 dark:text-gray-400">Awaiting inputs</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-500 max-w-sm mt-1.5">Configure details and click generate to populate the workspace.</p>
                                </div>
                            )}

                        </div>

                        {/* Bottom loaded past detail section */}
                        {selectedItem && (
                            <div className="mt-6 border-t border-white/5 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-[10px] font-bold uppercase text-red-400">Inspect Record: {selectedItem.title}</h5>
                                    <button onClick={() => setSelectedItem(null)} className="text-[9px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white">Clear X</button>
                                </div>
                                <div className="max-h-48 overflow-y-auto border border-white/5 rounded-lg p-3 bg-black/50 text-[11px] font-mono whitespace-pre-wrap leading-relaxed custom-scrollbar">
                                    {typeof selectedItem.content === 'object' ? JSON.stringify(selectedItem.content, null, 2) : selectedItem.content}
                                </div>
                            </div>
                        )}

                    </div>

                </div>

                {/* Bottom Saved Items Section */}
                <div className="bg-gray-50 dark:bg-[#111115] border border-white/5 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-500 dark:text-gray-400 mb-4 border-b border-white/5 pb-2">Saved Lab Assets</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-gray-500 dark:text-gray-400 uppercase text-[9px] font-bold tracking-wider">
                                    <th className="pb-3">Title</th>
                                    <th className="pb-3">Type</th>
                                    <th className="pb-3">Genre / Style</th>
                                    <th className="pb-3">Created</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                {savedItems.length > 0 ? (
                                    savedItems.map((item) => (
                                        <tr 
                                            key={item.id} 
                                            onClick={() => loadItemDetails(item.uuid)}
                                            className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                                        >
                                            <td className="py-3 font-semibold text-gray-900 dark:text-white truncate max-w-xs">{item.title}</td>
                                            <td className="py-3 font-mono text-[9px] text-gray-600 dark:text-gray-500 dark:text-gray-400 uppercase tracking-widest">{item.type}</td>
                                            <td className="py-3 text-gray-600 dark:text-gray-500 dark:text-gray-400">{item.niche} / {item.style}</td>
                                            <td className="py-3 text-gray-500 dark:text-gray-400 font-mono text-[9px]">{new Date(item.created_at).toLocaleString()}</td>
                                            <td className="py-3 text-right">
                                                <button
                                                    onClick={(e) => deleteItem(item.uuid, e)}
                                                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Delete Asset"
                                                >
                                                    <MdDelete className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-gray-600 dark:text-gray-500">No saved outlines or script projects yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
