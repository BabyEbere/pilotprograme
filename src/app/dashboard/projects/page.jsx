"use client";

import { useState, useEffect } from 'react';
import { MdAdd, MdSearch, MdFilterList, MdApps, MdList, MdEdit, MdDelete, MdPlayArrow } from 'react-icons/md';
import { useRouter } from 'next/navigation';

import Sidebar from '@/components/Sidebar';
import { useNotification } from '@/context/NotificationContext';

export default function Projects() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast, showConfirm } = useNotification();

    // Live Data States
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleDeleteProject = async (e, projectId, projectTitle) => {
        e.stopPropagation();
        const confirmed = await showConfirm(
            'Delete Project',
            `Are you absolutely sure you want to permanently delete "${projectTitle}"?\n\nThis will wipe its scripts, generated image prompts, and rendered audio permanently. A breadcrumb log will be retained for Admins.`
        );
        if (!confirmed) return;

        try {
            const res = await fetch(`${API_URL}/scripts/${projectId}?user_id=${user.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setProjects(projects.filter(p => p.id !== projectId));
                showToast('Project fully archived.', 'success');
            } else {
                showToast('Error deleting: ' + data.message, 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to delete project. Please try again.', 'error');
        }
    };

    // Fetch and fuse Scripts & Images data to calculate pipeline progress
    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Scripts
            const scriptsRes = await fetch(`${API_URL}/scripts?user_id=${user.id}`);
            const scriptsData = await scriptsRes.json();

            // 2. Fetch Image Prompts
            const imagesRes = await fetch(`${API_URL}/images/prompts?user_id=${user.id}`);
            const imagesData = await imagesRes.json();

            // 3. Fetch Audio Renders
            const audiosRes = await fetch(`${API_URL}/audios?user_id=${user.id}`);
            const audiosData = await audiosRes.json();

            if (scriptsData.success) {
                const userScripts = scriptsData.scripts;
                const userImages = imagesData.success ? imagesData.prompts : [];
                const userAudios = audiosData.success ? audiosData.audios : [];

                // Map over raw scripts to build "Project" objects
                const mappedProjects = userScripts.map(script => {
                    // Raw Content parsing
                    let parsedContent = null;
                    let sceneCount = 1;
                    let scriptWordCount = 0;
                    try {
                        parsedContent = typeof script.content === 'string' ? JSON.parse(script.content) : script.content;
                        if (parsedContent && parsedContent.scenes) {
                            sceneCount = parsedContent.scenes.length || 1;
                        }
                        if (parsedContent && parsedContent.title) {
                            scriptWordCount = JSON.stringify(parsedContent).split(' ').length;
                        }
                    } catch (e) { }

                    // Find all images tied to this project
                    const scriptImages = userImages.filter(img => String(img.script_id) === String(script.id));
                    const completedImages = scriptImages.filter(img => img.status === 'completed');

                    // Find all audios tied to this project
                    const scriptAudios = userAudios.filter(aud => String(aud.script_id) === String(script.id));

                    // Simple Pipeline Math
                    // Logic: 
                    // Phase 1 (30%): Script Generated vs Generating
                    // Phase 2 (70%): Prompt Extraction (Has extracted prompts = +30%)
                    // Phase 3 (100%): Rendered all extracted prompts (+40%)
                    let progress = 0;
                    let status = 'Draft';

                    if (script.status === 'completed') {
                        progress += 30; // Written
                        status = 'Written';

                        if (scriptImages.length > 0) {
                            progress += 30; // Prompts Extracted
                            status = 'Building Assets';

                            // Visual Render progress
                            const renderRatio = completedImages.length / scriptImages.length;
                            progress += Math.floor(renderRatio * 40);

                            if (renderRatio === 1) {
                                status = 'Ready To Edit';
                            }
                        }
                    } else if (script.status === 'generating') {
                        progress = 10;
                        status = 'Generating Script...';
                    }

                    return {
                        id: script.id,
                        title: script.title || 'Untitled Project',
                        description: parsedContent?.scenes?.[0]?.narration?.substring(0, 60) + '...' || 'A new faceless video concept.',
                        status: status,
                        progress: progress,
                        createdAt: new Date(script.created_at).toLocaleDateString(),
                        duration: `${script.duration}m`,
                        niche: script.niche_name || 'General',
                        scripts: 1,
                        scenes: sceneCount,
                        wordCount: scriptWordCount,
                        imagesTotal: scriptImages.length,
                        imagesRendered: completedImages.length,
                        audio: scriptAudios.length
                    };
                });

                // Sort by newest
                mappedProjects.sort((a, b) => b.id - a.id);
                setProjects(mappedProjects);
            }
        } catch (err) {
            console.error('Failed to load project dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) fetchDashboardData();
    }, [user.id]);

    // Filtering logic
    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-white/10 sticky top-0 z-10 transition-colors">
                    <div className="px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Projects Pipeline</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track and manage your entire video creation lifecycle</p>
                            </div>
                            <button
                                onClick={() => router.push('/dashboard/scripts')}
                                className="bg-white dark:bg-[#1c1c1c] text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#252525] border border-gray-200 dark:border-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 justify-center shadow-sm"
                            >
                                <MdAdd className="w-4 h-4" />
                                New Project Workflow
                            </button>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="flex-1 relative">
                                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-500 dark:text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by title or description..."
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#111111] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex gap-1 border border-gray-200 dark:border-white/10 rounded-lg p-0.5 bg-gray-100 dark:bg-[#0a0a0a]">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-[#111111] shadow-sm text-gray-900 dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white'}`}
                                        title="Grid View"
                                    >
                                        <MdApps className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-[#111111] shadow-sm text-gray-900 dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white'}`}
                                        title="List View"
                                    >
                                        <MdList className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects Display */}
                <div className="p-4 sm:p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-600 dark:text-gray-500 dark:text-gray-400">
                            <div className="w-8 h-8 border-4 border-gray-200 dark:border-white/10 border-t-gray-900 rounded-full animate-spin mb-3"></div>
                            <p className="text-sm font-medium">Aggregating pipelines...</p>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-[#111111] rounded-xl border border-dashed border-gray-200 dark:border-white/20 shadow-sm max-w-2xl mx-auto">
                            <div className="text-4xl mb-3">🚀</div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">No Projects Found</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mt-2 mb-6">Kick off your first faceless video workflow by generating an AI script!</p>
                            <button
                                onClick={() => router.push('/dashboard/scripts')}
                                className="bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors inline-block"
                            >
                                Generate Initial Script
                            </button>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid'
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                            : "flex flex-col gap-4"
                        }>
                            {filteredProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className={`bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 hover:border-purple-300 hover:shadow-md transition-all overflow-hidden group cursor-pointer ${viewMode === 'list' ? 'flex flex-row items-stretch' : 'flex flex-col'
                                        }`}
                                    onClick={() => router.push('/dashboard/scripts')}
                                >
                                    {/* Thumbnail Area */}
                                    <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden border-b sm:border-b-0 sm:border-r border-white/5 ${viewMode === 'list' ? 'w-48 sm:w-64 shrink-0' : 'h-36 sm:h-40 w-full'
                                        }`}>
                                        <div className="text-5xl opacity-80 mix-blend-multiply filter grayscale-[0.2]">🎬</div>
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-bold text-gray-900 dark:text-white tracking-widest uppercase">{project.niche}</span>
                                            <span className="text-[10px] font-bold text-gray-900 dark:text-white tracking-wide bg-black/40 px-2 py-1 rounded">{project.duration}</span>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className={`p-4 sm:p-5 flex-1 flex flex-col justify-between ${viewMode === 'list' ? 'py-4' : ''}`}>
                                        <div>
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-bold text-gray-900 dark:text-white text-[15px] leading-snug line-clamp-1 pr-3" title={project.title}>{project.title}</h3>
                                                <span className={`shrink-0 px-2 py-0.5 flex items-center justify-center rounded uppercase tracking-wider text-[9px] font-extrabold ${project.progress === 100 ? 'bg-green-100 text-green-700 border border-green-200' :
                                                    project.progress > 30 ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30' :
                                                        'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 dark:text-gray-400 border border-gray-200 dark:border-white/10'
                                                    }`}>
                                                    {project.status}
                                                </span>
                                            </div>

                                            <p className={`text-gray-500 dark:text-gray-400 text-xs mb-4 leading-relaxed ${viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-1'}`}>
                                                {project.description}
                                            </p>
                                        </div>

                                        <div className="mt-auto">
                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between text-[11px] mb-1.5 font-semibold">
                                                    <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wide">Completion</span>
                                                    <span className={project.progress === 100 ? "text-green-600" : "text-purple-700"}>{project.progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${project.progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`}
                                                        style={{ width: `${project.progress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Data Breakdown Grid */}
                                            <div className="grid grid-cols-3 gap-2 mb-4">
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); router.push('/dashboard/scripts'); }}
                                                    className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-2 text-center border border-gray-200 dark:border-white/5 transition-colors hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:border-purple-200 dark:hover:border-purple-800/30 cursor-pointer"
                                                    title="View Script Scenes"
                                                >
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-0.5">Scenes</p>
                                                    <p className="text-[13px] font-extrabold text-gray-900 dark:text-white">{project.scenes}</p>
                                                </div>
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); router.push('/dashboard/images', { state: { selectedAlbumId: project.id } }); }}
                                                    className={`rounded-lg p-2 text-center border transition-colors cursor-pointer ${project.imagesRendered > 0 ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-800/30 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-900 dark:text-purple-300' : 'bg-gray-50 dark:bg-[#0a0a0a] border-gray-200 dark:border-white/5 hover:bg-red-500/10 dark:hover:bg-red-500/5 dark:bg-red-950/20'}`}
                                                    title="View Image Assets"
                                                >
                                                    <p className={`text-[10px] uppercase tracking-wider font-bold mb-0.5 ${project.imagesRendered > 0 ? 'text-purple-600' : 'text-gray-500 dark:text-gray-400'}`}>Images</p>
                                                    <p className={`text-[13px] font-extrabold ${project.imagesRendered > 0 ? 'text-purple-900 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>{project.imagesRendered} <span className="text-[10px] font-medium opacity-50">/ {project.imagesTotal}</span></p>
                                                </div>
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); router.push('/dashboard/audio', { state: { selectedAlbumId: project.id } }); }}
                                                    className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-2 text-center border border-gray-200 dark:border-white/5 transition-colors hover:bg-red-500/10 dark:hover:bg-red-500/5 dark:bg-red-950/20 hover:border-red-500/30 dark:hover:border-red-800/30 cursor-pointer"
                                                    title="View Audio Generation"
                                                >
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-0.5">Media</p>
                                                    <p className="text-[13px] font-extrabold text-gray-900 dark:text-white">{project.audio}</p>
                                                </div>
                                            </div>

                                            {/* Card Footer */}
                                            <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-150 dark:border-white/5">
                                                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-500 dark:text-gray-400">
                                                    Created {project.createdAt}
                                                </span>
                                                <div className="flex gap-1">
                                                    <button onClick={(e) => { e.stopPropagation(); router.push('/dashboard/scripts'); }} className="p-1.5 text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/5 dark:bg-red-950/20 rounded transition-colors" title="Edit Script">
                                                        <MdEdit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={(e) => handleDeleteProject(e, project.id, project.title)} className="p-1.5 text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Archive Project">
                                                        <MdDelete className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
