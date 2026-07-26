"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    MdMovie, 
    MdDelete, 
    MdAutorenew, 
    MdInfoOutline, 
    MdChevronLeft, 
    MdChevronRight, 
    MdAutoAwesome,
    MdAdd,
    MdFolder,
    MdCreate,
    MdDownload,
    MdBook,
    MdLocationOn,
    MdLanguage,
    MdPeople,
    MdHomeWork
} from 'react-icons/md';
import Sidebar from '@/components/Sidebar';

export default function StoryWriter() {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [savedItems, setSavedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    // Active Section Tab: 'generator' or 'library'
    const [activeTab, setActiveTab] = useState('generator');

    // Tutorial Carousel
    const [showDemo, setShowDemo] = useState(true);
    const [demoSlide, setDemoSlide] = useState(0);
    const demoSlides = [
        {
            title: "⚡ Step 1: Fill Story Questionnaire & Niche",
            desc: "Specify location, environment, dialect, demographics, and parent context to shape the story world."
        },
        {
            title: "✍️ Step 2: Auto-Brainstorm Cast & Concept",
            desc: "Click 'Auto-Brainstorm Concept & Cast'. The AI maps out character cards, flaws, motivations, and plot outline!"
        },
        {
            title: "📖 Step 3: Progressive Story Chapters & Script Conversion",
            desc: "Generate Chapter 1 treatment prose. Extend story chapters, then click 'Convert to Script Screenplay'!"
        }
    ];

    // Form State
    const [niche, setNiche] = useState('Drama');
    const [customNiche, setCustomNiche] = useState('');
    const [style, setStyle] = useState('Nollywood / African Drama');
    const [customStyle, setCustomStyle] = useState('');
    const [actorsLimit, setActorsLimit] = useState('Unlimited');
    const [theme, setTheme] = useState('');
    const [description, setDescription] = useState('');
    const [characters, setCharacters] = useState([]);

    // Questionnaire Parameters for Story Creation
    const [location, setLocation] = useState('');
    const [environment, setEnvironment] = useState('');
    const [language, setLanguage] = useState('English');
    const [nameType, setNameType] = useState('Mixed');
    const [teensOption, setTeensOption] = useState('General / All Ages');
    const [parentsOption, setParentsOption] = useState('Standard Family Context');

    // Advanced Production
    const [duration, setDuration] = useState(20);
    const [isSeasonal, setIsSeasonal] = useState(false);
    const [hasNarrator, setHasNarrator] = useState(true);

    // Progressive writing state
    const [activeStoryUuid, setActiveStoryUuid] = useState('');
    const [activeStoryTitle, setActiveStoryTitle] = useState('');
    const [activeStoryBlueprint, setActiveStoryBlueprint] = useState('');
    const [activeChapters, setActiveChapters] = useState([]);
    const [nextInstructions, setNextInstructions] = useState('');

    const [nichesList, setNichesList] = useState(['Drama', 'Action', 'Thriller', 'Comedy', 'Romance', 'Mystery', 'Sci-Fi', 'Horror', 'Documentary']);
    const [stylesList, setStylesList] = useState(['Nollywood / African Drama', 'Hollywood Cinematic', 'Telenovela Drama', 'Short Film / TikTok Style', 'Documentary style', 'African Epic / Cultural Myth']);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    useEffect(() => {
        document.title = 'Story Writer | AI Studio';
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

    const fetchSavedItems = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/story/list?user_id=${userId}`);
            const data = await res.json();
            if (data.success) {
                setSavedItems(data.items.filter(item => item.type === 'story'));
            }
        } catch (err) {
            console.error('Error listing user stories:', err);
        }
    };

    const deleteItem = async (uuid, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this story?')) return;
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
            setLoadingText('Loading story...');
            const res = await fetch(`${API_URL}/admin/story/${uuid}`);
            const data = await res.json();
            if (data.success) {
                const item = data.item;
                setSelectedItem(item);
                
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
                    setActiveChapters([{ chapter_number: 1, title: 'Chapter 1', content: item.content }]);
                }
                setActiveTab('generator');
            }
        } catch (err) {
            alert('Failed to load story detail');
        } finally {
            setLoading(false);
        }
    };

    const handleAutoBrainstorm = async () => {
        setLoading(true);
        setLoadingText('AI is brainstorming concept, plot outline, and character cast...');

        const payload = {
            user_id: userId,
            seed_idea: description,
            niche: niche === 'custom' ? customNiche : niche,
            style: style === 'custom' ? customStyle : style,
            location: location,
            environment: environment,
            language: language,
            name_type: nameType,
            teens_option: teensOption,
            parents_option: parentsOption,
            duration: duration,
            is_seasonal: isSeasonal,
            api_key: ''
        };

        try {
            const res = await fetch(`${API_URL}/admin/story/brainstorm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                if (data.theme) setTheme(data.theme);
                if (data.plot_summary) setDescription(data.plot_summary);
                if (data.characters && data.characters.length > 0) setCharacters(data.characters);
                alert('✨ Brainstorm complete! Review and adjust the generated cast list and plot summary below.');
            } else {
                alert(data.message || 'Brainstorming failed.');
            }
        } catch (err) {
            alert('Server error during brainstorm');
        } finally {
            setLoading(false);
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

    const handleGenerateStory = async (e) => {
        e.preventDefault();
        if (!description.trim()) {
            alert('Please fill out the story concept or click Auto-Brainstorm first!');
            return;
        }

        setLoading(true);
        setLoadingText('Creating Story Treatment outline & Chapter 1...');
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
            api_key: ''
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
            api_key: ''
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

    const triggerDownload = async (uuid, format) => {
        if (!uuid) {
            alert('No active story loaded to download.');
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
            let filename = `story.${format}`;
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
        <div className="flex h-screen bg-gray-55 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/5 pb-5 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <MdBook className="w-3 h-3" /> Movie Story & Treatment Generator
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                                <MdMovie className="text-red-500 w-6 h-6" /> Story Writer
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                            Build long-form movie story treatments, answer questionnaire prompts, and brainstorm dynamic character cast cards.
                        </p>
                    </div>
                    
                    <button
                        onClick={() => setShowDemo(!showDemo)}
                        className="self-start md:self-auto bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all text-gray-700 dark:text-white"
                    >
                        <MdInfoOutline className="text-red-400 w-4 h-4" /> {showDemo ? "Hide Guide" : "View Guide"}
                    </button>
                </div>

                {/* Section Tabs Switcher */}
                <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-white/10 pb-3">
                    <button
                        onClick={() => setActiveTab('generator')}
                        className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'generator'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                    >
                        <MdCreate className="w-4 h-4" />
                        <span>Story Generator</span>
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
                        <span>Story Library ({savedItems.length})</span>
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

                {/* Main Content Layout */}
                {activeTab === 'generator' ? (
                    <div className="space-y-6">
                        <form onSubmit={handleGenerateStory} className="space-y-6">
                            
                            {/* STORY QUESTIONNAIRE & CONCEPT CREATION */}
                            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
                                <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-white/5 pb-2 flex items-center gap-2">
                                    <MdAutoAwesome className="text-red-500" /> Story Questionnaire & Production Concept
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Niche / Genre</label>
                                        <select
                                            value={niche}
                                            onChange={(e) => setNiche(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2.5 text-xs text-gray-700 dark:text-white focus:outline-none"
                                        >
                                            {nichesList.map((n) => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                            <option value="custom">-- Custom Genre --</option>
                                        </select>
                                        {niche === 'custom' && (
                                            <input
                                                type="text"
                                                placeholder="Enter custom genre..."
                                                value={customNiche}
                                                onChange={(e) => setCustomNiche(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-white focus:outline-none mt-2"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Writing Style & Regional Tone</label>
                                        <select
                                            value={style}
                                            onChange={(e) => setStyle(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2.5 text-xs text-gray-700 dark:text-white focus:outline-none"
                                        >
                                            {stylesList.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                            <option value="custom">-- Custom Style --</option>
                                        </select>
                                        {style === 'custom' && (
                                            <input
                                                type="text"
                                                placeholder="Enter custom style..."
                                                value={customStyle}
                                                onChange={(e) => setCustomStyle(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-white focus:outline-none mt-2"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* QUESTIONNAIRE INPUTS GRID */}
                                <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-4 bg-gray-50/50 dark:bg-[#15151b] p-4 rounded-xl">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        
                                        {/* Location */}
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex items-center gap-1">
                                                <MdLocationOn className="text-red-500" /> Location
                                            </label>
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="e.g. Lagos, London, High School Campus"
                                                className="w-full bg-white dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-white focus:outline-none"
                                            />
                                        </div>

                                        {/* Environment */}
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex items-center gap-1">
                                                <MdHomeWork className="text-red-500" /> Environment / Setting
                                            </label>
                                            <input
                                                type="text"
                                                value={environment}
                                                onChange={(e) => setEnvironment(e.target.value)}
                                                placeholder="e.g. Wealthy Estate, Boarding School, Slum"
                                                className="w-full bg-white dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-white focus:outline-none"
                                            />
                                        </div>

                                        {/* Language */}
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex items-center gap-1">
                                                <MdLanguage className="text-red-500" /> Language / Dialect
                                            </label>
                                            <select
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                                className="w-full bg-white dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-white focus:outline-none"
                                            >
                                                <option value="English">English</option>
                                                <option value="Pidgin English">Pidgin English</option>
                                                <option value="Bilingual (English + Pidgin)">Bilingual (English + Pidgin)</option>
                                                <option value="Yoruba Accent">Yoruba Accent</option>
                                                <option value="Hausa Accent">Hausa Accent</option>
                                                <option value="Igbo Accent">Igbo Accent</option>
                                            </select>
                                        </div>

                                        {/* Name Type */}
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Character Name Types</label>
                                            <select
                                                value={nameType}
                                                onChange={(e) => setNameType(e.target.value)}
                                                className="w-full bg-white dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-white focus:outline-none"
                                            >
                                                <option value="Mixed">Mixed (English + Ethnic)</option>
                                                <option value="English">English Names</option>
                                                <option value="Yoruba">Yoruba Names</option>
                                                <option value="Hausa">Hausa Names</option>
                                                <option value="Igbo">Igbo Names</option>
                                            </select>
                                        </div>

                                        {/* Just Teens */}
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex items-center gap-1">
                                                <MdPeople className="text-red-500" /> Target Demographics
                                            </label>
                                            <select
                                                value={teensOption}
                                                onChange={(e) => setTeensOption(e.target.value)}
                                                className="w-full bg-white dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-white focus:outline-none"
                                            >
                                                <option value="General / All Ages">General / All Ages</option>
                                                <option value="Just Teens - Both Genders">Just Teens (Boys & Girls)</option>
                                                <option value="Just Teens - Only Boys">Just Teens (Only Boys)</option>
                                                <option value="Just Teens - Only Girls">Just Teens (Only Girls)</option>
                                            </select>
                                        </div>

                                        {/* Parents Context */}
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Parents / Family Context</label>
                                            <select
                                                value={parentsOption}
                                                onChange={(e) => setParentsOption(e.target.value)}
                                                className="w-full bg-white dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-white focus:outline-none"
                                            >
                                                <option value="Standard Family Context">Standard Family Context</option>
                                                <option value="Strict Parents">Strict Parents</option>
                                                <option value="Single Mother">Single Mother</option>
                                                <option value="Absent Parents">Absent Parents</option>
                                                <option value="Independent / No Parent Involvement">Independent / No Parent Involvement</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Core Story Concept / Premise</label>
                                            <button
                                                type="button"
                                                onClick={handleAutoBrainstorm}
                                                className="self-start sm:self-auto text-[10px] bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-bold uppercase tracking-wider transition-all shadow flex items-center gap-1"
                                            >
                                                ⚡ Auto-Brainstorm Concept & Cast
                                            </button>
                                        </div>
                                        <textarea
                                            placeholder="Write a brief summary of what the story is about, or click Auto-Brainstorm above to generate..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows="4"
                                            className="w-full bg-white dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl p-3 text-xs text-gray-700 dark:text-white focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Theme (Overarching Motif)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Betrayal, Redemption, Greed"
                                            value={theme}
                                            onChange={(e) => setTheme(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-white focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Character Limit Option</label>
                                        <select
                                            value={actorsLimit}
                                            onChange={(e) => setActorsLimit(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-white focus:outline-none"
                                        >
                                            <option value="Unlimited">Unlimited</option>
                                            <option value="Focused (2-3 main)">Focused (2-3 main)</option>
                                            <option value="Solo / Monologue">Solo / Monologue</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-200 dark:border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Est. Duration (minutes)</label>
                                        <input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(Number(e.target.value))}
                                            className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-white focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 sm:mt-5">
                                        <input
                                            type="checkbox"
                                            id="isSeasonal"
                                            checked={isSeasonal}
                                            onChange={(e) => setIsSeasonal(e.target.checked)}
                                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <label htmlFor="isSeasonal" className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">Seasonal (Multi-part)</label>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 sm:mt-5">
                                        <input
                                            type="checkbox"
                                            id="hasNarrator"
                                            checked={hasNarrator}
                                            onChange={(e) => setHasNarrator(e.target.checked)}
                                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <label htmlFor="hasNarrator" className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">Include Narration</label>
                                    </div>
                                </div>
                            </div>

                            {/* Cast Cards Sheet */}
                            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Cast Card Sheet</h3>
                                    <button
                                        type="button"
                                        onClick={addCharacterCard}
                                        className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all"
                                    >
                                        <MdAdd className="w-4 h-4" /> Add Character
                                    </button>
                                </div>

                                {characters.length === 0 ? (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">No character cards specified. Auto-Brainstorm to generate cast list dynamically.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {characters.map((char, index) => (
                                            <div key={index} className="bg-gray-50 dark:bg-[#16161c] border border-gray-200 dark:border-white/5 rounded-xl p-4 space-y-3 relative group">
                                                <button
                                                    type="button"
                                                    onClick={() => removeCharacterCard(index)}
                                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <MdDelete className="w-4 h-4" />
                                                </button>
                                                
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-0.5">Name</label>
                                                    <input
                                                        type="text"
                                                        value={char.name || ''}
                                                        onChange={(e) => updateCharacterCard(index, 'name', e.target.value)}
                                                        className="w-full bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 dark:text-white focus:outline-none"
                                                        placeholder="e.g. Chief Amara"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-0.5">Role Type</label>
                                                        <select
                                                            value={char.role || 'Supporting'}
                                                            onChange={(e) => updateCharacterCard(index, 'role', e.target.value)}
                                                            className="w-full bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 dark:text-white focus:outline-none"
                                                        >
                                                            <option value="Protagonist">Protagonist</option>
                                                            <option value="Antagonist">Antagonist</option>
                                                            <option value="Supporting">Supporting</option>
                                                            <option value="Narrator">Narrator</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-0.5">Flaw / Weakness</label>
                                                        <input
                                                            type="text"
                                                            value={char.defect || ''}
                                                            onChange={(e) => updateCharacterCard(index, 'defect', e.target.value)}
                                                            className="w-full bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 dark:text-white focus:outline-none"
                                                            placeholder="e.g. Arrogance"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-0.5">Motivation</label>
                                                    <input
                                                        type="text"
                                                        value={char.motivation || ''}
                                                        onChange={(e) => updateCharacterCard(index, 'motivation', e.target.value)}
                                                        className="w-full bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 dark:text-white focus:outline-none"
                                                        placeholder="e.g. Protect family legacy"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase py-3.5 rounded-2xl text-xs tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                            >
                                <MdAutoAwesome className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                                <span>Compile & Generate Chapter 1</span>
                            </button>
                        </form>

                        {activeChapters.length > 0 && (
                            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-white/5 pb-3">
                                    <div>
                                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider bg-red-500/10 px-2.5 py-0.5 rounded-full">Active story builder</span>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-1">{activeStoryTitle || "Untitled Story Outline"}</h3>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => router.push('/dashboard/story-to-script')}
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg px-3 py-1.5 text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 shadow"
                                        >
                                            🎬 Convert to Script Screenplay →
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => triggerDownload(activeStoryUuid, 'txt')}
                                            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white"
                                        >
                                            TXT
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => triggerDownload(activeStoryUuid, 'docx')}
                                            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white"
                                        >
                                            DOCX
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => triggerDownload(activeStoryUuid, 'pdf')}
                                            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white"
                                        >
                                            PDF
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {activeChapters.map((ch, idx) => (
                                        <div key={idx} className="space-y-2 border-b border-gray-100 dark:border-white/5 pb-4 last:border-none">
                                            <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                <span className="w-5 h-5 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center text-[10px] font-bold">{ch.chapter_number}</span>
                                                {ch.title || `Chapter ${ch.chapter_number}`}
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">{ch.content}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-gray-200 dark:border-white/5 space-y-3">
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tell AI what should happen in Chapter {activeChapters.length + 1}</label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            placeholder="e.g. Chief Solomon calls an urgent family meeting to announce the heir..."
                                            value={nextInstructions}
                                            onChange={(e) => setNextInstructions(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-xl px-3 py-2.5 text-xs text-gray-700 dark:text-white focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleExtendStory}
                                            disabled={loading}
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow"
                                        >
                                            <MdAutorenew className="w-4 h-4" /> Extend
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Library Tab */
                    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/5 pb-3 mb-4">
                            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <MdFolder className="text-red-500 w-4 h-4" /> Saved Story Outlines
                            </h3>
                            <span className="text-[10px] bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded-full">
                                {savedItems.length} Saved
                            </span>
                        </div>

                        {savedItems.length === 0 ? (
                            <div className="text-center py-12">
                                <MdFolder className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">No story outlines created yet.</p>
                                <button
                                    onClick={() => setActiveTab('generator')}
                                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase"
                                >
                                    Create New Story
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {savedItems.map((item) => (
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
                                                    {item.niche || 'Story'}
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
                                            <span className="font-bold text-red-500 group-hover:translate-x-1 transition-transform">Open →</span>
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
