"use client";

import { useState, useEffect } from 'react';

import { MdAdd, MdDelete, MdVisibility, MdPlaylistAdd, MdAudiotrack } from 'react-icons/md';

import Link from 'next/link';
import { useRouter } from 'next/navigation';


import { Key, AlertTriangle } from 'lucide-react';

import Sidebar from '@/components/Sidebar';

import ScriptFeedback from '@/components/ScriptFeedback';

import AudioGenerator from '@/components/AudioGenerator';

import Toast from '@/components/Toast';



export default function Scripts() {

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const [showGenerateModal, setShowGenerateModal] = useState(false);

    const [niches, setNiches] = useState([]);

    const [scripts, setScripts] = useState([]);

    const [loading, setLoading] = useState(false);

    const [toast, setToast] = useState(null);



    const [availableSubNiches, setAvailableSubNiches] = useState([]);



    const [isGenerating, setIsGenerating] = useState(false);

    const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);

    const [upgradeModal, setUpgradeModal] = useState({ show: false, isFree: false, planName: '' });



    const router = useRouter();



    const [formData, setFormData] = useState({

        nicheId: '',

        subNicheId: '', // Added subNicheId

        description: '',

        autoGenerate: false,

        duration: 10,

        isFaceless: true,

        perspective: 'first_person',

        isSimpleTone: false

    });



    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');

    const user = JSON.parse(localStorage.getItem('user') || '{}');



    const durations = [5, 10, 15, 20, 25, 30];



    // Check if user has an API key configured, then open the modal

    const openGenerateModal = async () => {

        try {

            const res = await fetch(`${API_URL}/settings/${user.id}`);

            const data = await res.json();

            if (data.success && data.settings?.has_api_key) {

                setShowGenerateModal(true);

            } else {

                setShowApiKeyWarning(true);

            }

        } catch {

            // If we can't check, just open the modal and let backend handle it

            setShowGenerateModal(true);

        }

    };



    // Fetch active niches

    const fetchNiches = async () => {

        try {

            const response = await fetch(`${API_URL}/niches`);

            const data = await response.json();

            if (data.success) {

                setNiches(data.niches.filter(n => n.status === 'active'));

            }

        } catch (error) {

            console.error('Error fetching niches:', error);

            setToast({ message: 'Failed to load niches', type: 'error' });

        }

    };



    // Fetch sub-niches when niche changes

    const fetchSubNiches = async (nicheId) => {

        if (!nicheId) {

            setAvailableSubNiches([]);

            return;

        }

        try {

            const response = await fetch(`${API_URL}/niches/${nicheId}/sub-niches`);

            const data = await response.json();

            if (data.success) {

                setAvailableSubNiches(data.sub_niches);

            }

        } catch (error) {

            console.error('Error fetching sub-niches:', error);

        }

    };



    // Update sub-niches when niche selection changes

    useEffect(() => {

        if (formData.nicheId) {

            fetchSubNiches(formData.nicheId);

        } else {

            setAvailableSubNiches([]);

        }

    }, [formData.nicheId]);



    // Fetch user's scripts

    const fetchScripts = async () => {

        try {

            setLoading(true);

            const response = await fetch(`${API_URL}/scripts?user_id=${user.id}`);

            const data = await response.json();

            if (data.success) {

                setScripts(data.scripts);

            }

        } catch (error) {

            console.error('Error fetching scripts:', error);

            setToast({ message: 'Failed to load scripts', type: 'error' });

        } finally {

            setLoading(false);

        }

    };



    useEffect(() => {

        fetchNiches();

        fetchScripts();

    }, []);



    const handleGenerate = async (e) => {

        e.preventDefault();



        if (!formData.nicheId || (!formData.autoGenerate && !formData.description)) {

            setToast({ message: 'Please fill all required fields', type: 'error' });

            return;

        }



        try {

            setIsGenerating(true);

            const response = await fetch(`${API_URL}/scripts/generate`, {

                method: 'POST',

                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({

                    user_id: user.id,

                    niche_id: formData.nicheId,

                    sub_niche_id: formData.subNicheId || null,

                    description: formData.description,

                    auto_generate: formData.autoGenerate,

                    duration: formData.duration,

                    is_faceless: formData.isFaceless,

                    perspective: formData.perspective,

                    is_simple_tone: formData.isSimpleTone

                })

            });



            const rawText = await response.text();

            let data;

            try { data = JSON.parse(rawText); } catch { data = { success: false, message: rawText }; }



            if (data.success) {

                setToast({ message: 'Script generated successfully!', type: 'success' });

                setShowGenerateModal(false);

                setFormData({ nicheId: '', subNicheId: '', description: '', autoGenerate: false, duration: 10, isFaceless: true, perspective: 'first_person', isSimpleTone: false });

                fetchScripts();

            } else if (data.message === 'FREE_PLAN_EXPIRED') {

                setShowGenerateModal(false);

                setUpgradeModal({ show: true, isFree: true, planName: 'Free' });

            } else if (data.message && data.message.startsWith('PLAN_EXPIRED:')) {

                const pName = data.message.replace('PLAN_EXPIRED:', '');

                setShowGenerateModal(false);

                setUpgradeModal({ show: true, isFree: false, planName: pName });

            } else {

                setToast({ message: 'Error: ' + (data.message || 'Unknown error'), type: 'error' });

            }

        } catch (error) {

            console.error('Error generating script:', error);

            setToast({ message: 'Error generating script. Please try again.', type: 'error' });

        } finally {

            setIsGenerating(false);

        }

    };



    // Audio player logic removed - moved to Audio.jsx

    

    // Extend Script logic moved to ScriptEditor.jsx



    const handleDelete = async (scriptId) => {

        if (!confirm('Are you sure you want to delete this script?')) return;



        try {

            const response = await fetch(`${API_URL}/scripts/${scriptId}?user_id=${user.id}`, {

                method: 'DELETE'

            });



            const data = await response.json();



            if (data.success) {

                setToast({ message: 'Script deleted successfully!', type: 'success' });

                fetchScripts();

            } else {

                setToast({ message: 'Error: ' + data.message, type: 'error' });

            }

        } catch (error) {

            console.error('Error deleting script:', error);

            setToast({ message: 'Error deleting script. Please try again.', type: 'error' });

        }

    };



    return (

        <div className="flex h-screen bg-white dark:bg-[#0a0a0a]">

            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />



            <div className="flex-1 overflow-y-auto">

                {/* Header */}

                <div className="bg-gray-50 dark:bg-[#111111] border-b border-gray-200 dark:border-white/10">

                    <div className="px-4 sm:px-6 py-4">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                            <div>

                                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">My Scripts</h1>

                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Generate and manage your video scripts</p>

                            </div>

                            <button

                                onClick={openGenerateModal}

                                className="bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 justify-center"

                            >

                                <MdAdd className="w-4 h-4" />

                                Generate Script

                            </button>

                        </div>

                    </div>

                </div>



                {/* Scripts Grid */}

                <div className="p-4 sm:p-6">

                    {loading ? (

                        <div className="text-center py-12">

                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading scripts...</p>

                        </div>

                    ) : scripts.length === 0 ? (

                        <div className="text-center py-12">

                            <p className="text-gray-500 dark:text-gray-400">No scripts yet. Generate your first script!</p>

                        </div>

                    ) : (

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                            {scripts.map((script) => (

                                <div

                                    key={script.id}

                                    className="bg-gray-50 dark:bg-[#111111] rounded-lg border border-gray-200 dark:border-white/10 hover:shadow-md transition-shadow p-4"

                                >

                                    <div className="flex items-start justify-between mb-3">

                                        <div className="flex-1">

                                            <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1">{script.title}</h3>

                                            <div className="flex items-center gap-2 flex-wrap">

                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">

                                                    {script.niche_name}

                                                </span>

                                                <span className="px-2 py-1 bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">

                                                    {script.duration} min

                                                </span>

                                                <span className={`px-2 py-1 rounded text-xs font-medium ${script.status === 'completed' ? 'bg-green-100 text-green-700' :

                                                    script.status === 'generating' ? 'bg-yellow-100 text-yellow-700' :

                                                        'bg-red-100 text-red-700'

                                                    }`}>

                                                    {script.status}

                                                </span>

                                                {script.visual_bible && (

                                                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-[10px] font-bold uppercase tracking-tighter border border-blue-500/20">

                                                        Visual Bible

                                                    </span>

                                                )}

                                            </div>

                                        </div>

                                    </div>



                                    <p className="text-sm text-gray-600 dark:text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{script.description}</p>



                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">

                                        Created {new Date(script.created_at).toLocaleDateString()}

                                    </div>



                                    <div className="flex gap-2">

                                        <button

                                            onClick={() => {

                                                const identifier = script.uuid || script.id;

                                                if (identifier) router.push(`/dashboard/scripts/${identifier}`);

                                            }}

                                            disabled={script.status !== 'completed'}

                                            className="flex-1 px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-white dark:bg-[#0a0a0a] hover:text-gray-900 dark:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"

                                        >

                                            <MdVisibility className="w-4 h-4" />

                                            View

                                        </button>

                                        <button

                                            onClick={() => handleDelete(script.id)}

                                            className="px-3 py-1.5 border border-red-500/30 text-red-500 rounded-lg text-sm hover:bg-red-500/10 transition-colors"

                                        >

                                            <MdDelete className="w-4 h-4" />

                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>



            {/* Toast Notification */}

            {toast && (

                <Toast

                    message={toast.message}

                    type={toast.type}

                    onClose={() => setToast(null)}

                />

            )}



            {/* API Key Warning Modal */}

            {showApiKeyWarning && (

                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">

                    <div className="bg-gray-50 dark:bg-[#111111] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">

                        <div className="bg-amber-500/10 px-6 pt-6 pb-4 flex flex-col items-center text-center border-b border-amber-100">

                            <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-3">

                                <Key className="w-7 h-7 text-amber-500" />

                            </div>

                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Gemini API Key Required</h2>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">

                                You need a Gemini API key to generate scripts.

                            </p>

                        </div>

                        <div className="px-6 py-5 space-y-4">

                            <div className="flex items-start gap-3 bg-blue-500/10 rounded-xl p-4 border border-blue-100">

                                <AlertTriangle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />

                                <p className="text-xs text-blue-300 leading-relaxed">

                                    Pilot Programme uses <strong>Google Gemini</strong> to power AI script generation.

                                    Add your free API key in Settings to get started — it only takes 30 seconds!

                                </p>

                            </div>

                            <div className="flex gap-3">

                                <button

                                    onClick={() => setShowApiKeyWarning(false)}

                                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:bg-white dark:bg-[#0a0a0a] transition-colors"

                                >

                                    Cancel

                                </button>

                                <button

                                    onClick={() => { setShowApiKeyWarning(false); router.push('/dashboard/settings'); }}

                                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"

                                >

                                    <Key className="w-4 h-4" />

                                    Go to Settings

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}



            {/* Subscription / Free Plan Expired Modal */}

            {upgradeModal.show && (

                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">

                    <div className="bg-gray-50 dark:bg-[#111111] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">

                        {/* Header */}

                        <div className={`px-6 pt-6 pb-4 flex flex-col items-center text-center border-b ${upgradeModal.isFree ? 'bg-orange-50 border-orange-100' : 'bg-red-50 border-red-100'

                            }`}>

                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${upgradeModal.isFree ? 'bg-orange-100' : 'bg-red-100'

                                }`}>

                                <AlertTriangle className={`w-7 h-7 ${upgradeModal.isFree ? 'text-orange-500' : 'text-red-500'}`} />

                            </div>

                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">

                                {upgradeModal.isFree ? 'Your Free Trial Has Ended' : 'Your Plan Has Expired'}

                            </h2>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">

                                {upgradeModal.isFree

                                    ? 'Your 2-day free trial has expired'

                                    : `Your ${upgradeModal.planName} plan has expired`}

                            </p>

                        </div>



                        {/* Body */}

                        <div className="px-6 py-5 space-y-4">

                            {upgradeModal.isFree ? (

                                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-100 text-xs text-blue-300 leading-relaxed">

                                    Your <strong>2-day free trial</strong> included limited script generation to give you a taste of what's possible.

                                    Upgrade to a paid plan to continue creating unlimited AI scripts, audio, and images for your YouTube channels!

                                </div>

                            ) : (

                                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-100 text-xs text-blue-300 leading-relaxed">

                                    Your <strong>{upgradeModal.planName}</strong> plan has expired. Renew or upgrade now to restore access to all your AI script generation, audio, and image features.

                                </div>

                            )}



                            <div className="flex gap-3">

                                <button

                                    onClick={() => setUpgradeModal({ show: false, isFree: false, planName: '' })}

                                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:bg-white dark:bg-[#0a0a0a] transition-colors"

                                >

                                    Maybe Later

                                </button>

                                <button

                                    onClick={() => { setUpgradeModal({ show: false, isFree: false, planName: '' }); router.push('/dashboard/plans'); }}

                                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"

                                >

                                    View Plans →

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}



            {/* Generate Script Modal */}

            {showGenerateModal && (

                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">

                    <div className="bg-gray-50 dark:bg-[#111111] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">

                        <div className="p-6">

                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Generate New Script</h2>



                            <form onSubmit={handleGenerate} className="space-y-4">

                                {/* Niche Selection */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">

                                        Select Niche *

                                    </label>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                                        {niches.map((niche) => (

                                            <div

                                                key={niche.id}

                                                onClick={() => setFormData({ ...formData, nicheId: niche.id, subNicheId: '' })}

                                                className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${

                                                    formData.nicheId == niche.id

                                                        ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-500 ring-1 ring-purple-500'

                                                        : 'bg-white dark:bg-[#111] border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-sm'

                                                }`}

                                            >

                                                <span className="font-semibold text-sm text-gray-900 dark:text-white">{niche.name}</span>

                                                {niche.is_faceless && (

                                                    <span className="text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 mt-1 font-bold bg-purple-100 dark:bg-purple-500/20 px-2 py-0.5 rounded-full">

                                                        Faceless

                                                    </span>

                                                )}

                                            </div>

                                        ))}

                                    </div>

                                </div>



                                {/* Sub-Niche Selection (Conditionally Rendered) */}

                                {availableSubNiches.length > 0 && (

                                    <div className="bg-blue-50 dark:bg-blue-500/5 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 mt-4 mb-2">

                                        <label className="block text-sm font-semibold text-blue-800 dark:text-blue-400 mb-3 uppercase tracking-tight">

                                            Select Sub-Niche (Optional)

                                        </label>

                                        <div className="flex flex-wrap gap-2">

                                            <button

                                                type="button"

                                                onClick={() => setFormData({ ...formData, subNicheId: '' })}

                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${

                                                    formData.subNicheId === '' || formData.subNicheId == null

                                                        ? 'bg-blue-600 text-gray-900 dark:text-white shadow-sm'

                                                        : 'bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-100 dark:bg-[#1a1a1a]'

                                                }`}

                                            >

                                                General (No Sub-Niche)

                                            </button>

                                            {availableSubNiches.map((sub) => (

                                                <button

                                                    key={sub.id}

                                                    type="button"

                                                    onClick={() => setFormData({ ...formData, subNicheId: sub.id })}

                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${

                                                        formData.subNicheId == sub.id

                                                            ? 'bg-blue-600 text-gray-900 dark:text-white shadow-sm'

                                                            : 'bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-100 dark:bg-[#1a1a1a]'

                                                    }`}

                                                >

                                                    {sub.name}

                                                </button>

                                            ))}

                                        </div>

                                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-3">

                                            Selecting a sub-niche guides the AI with specific storytelling strategies for that category.

                                        </p>

                                    </div>

                                )}



                                {/* Auto-Generate Toggle */}

                                <div className="flex items-center gap-3 bg-red-500/10 p-3 rounded-lg border border-red-500/20 mb-4">

                                    <div className="flex items-center h-5">

                                        <input

                                            id="autoGenerate"

                                            type="checkbox"

                                            checked={formData.autoGenerate}

                                            onChange={(e) => setFormData({ ...formData, autoGenerate: e.target.checked, description: e.target.checked ? '' : formData.description })}

                                            className="w-4 h-4 text-red-500 border-white/20 rounded focus:ring-red-500"

                                        />

                                    </div>

                                    <div className="flex-1">

                                        <label htmlFor="autoGenerate" className="font-medium text-red-400 text-sm">

                                            Auto-Brainstorm Topic

                                        </label>

                                        <p className="text-xs text-gray-600 dark:text-gray-500 dark:text-gray-400">

                                            Let AI magically map out an engaging topic and story based on the niche.

                                        </p>

                                    </div>

                                </div>



                                {/* Description */}

                                {!formData.autoGenerate && (

                                    <div>

                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">

                                            Describe Your Script *

                                        </label>

                                        <textarea

                                            required={!formData.autoGenerate}

                                            value={formData.description}

                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}

                                            placeholder="Describe what you want your script to be about..."

                                            rows="5"

                                            className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"

                                        />

                                    </div>

                                )}



                                {/* Content Type */}

                                <div className="flex items-center gap-3 bg-white dark:bg-[#0a0a0a] p-3 rounded-lg border border-gray-200 dark:border-white/10">

                                    <div className="flex items-center h-5">

                                        <input

                                            id="isFaceless"

                                            type="checkbox"

                                            checked={formData.isFaceless}

                                            onChange={(e) => setFormData({ ...formData, isFaceless: e.target.checked })}

                                            className="w-4 h-4 text-purple-600 border-white/20 rounded focus:ring-purple-500"

                                        />

                                    </div>

                                    <div className="flex-1">

                                        <label htmlFor="isFaceless" className="font-medium text-gray-900 dark:text-white text-sm">

                                            Faceless Video Mode

                                        </label>

                                        <p className="text-xs text-gray-500 dark:text-gray-400">

                                            AI will suggest stock footage and detailed visual descriptions instead of host instructions.

                                        </p>

                                    </div>

                                </div>



                                                                {/* Simple Tone Toggle */}

                                <div className="flex items-center gap-3 bg-green-50 dark:bg-green-500/10 p-3 rounded-lg border border-green-200 dark:border-green-500/20">

                                    <div className="flex items-center h-5">

                                        <input

                                            id="isSimpleTone"

                                            type="checkbox"

                                            checked={formData.isSimpleTone}

                                            onChange={(e) => setFormData({ ...formData, isSimpleTone: e.target.checked })}

                                            className="w-4 h-4 text-green-500 border-gray-300 dark:border-white/20 rounded focus:ring-green-500"

                                        />

                                    </div>

                                    <div className="flex-1">

                                        <label htmlFor="isSimpleTone" className="font-semibold text-green-700 dark:text-green-400 text-sm">

                                            Simple & Realistic Tone

                                        </label>

                                        <p className="text-xs text-green-600/80 dark:text-green-300/60 leading-tight">

                                            Enforce simple vocabulary (5th grade), no preachy language, and strictly realistic events.

                                        </p>

                                    </div>

                                </div>



                                {/* Narrative Perspective */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">

                                        Narrative Perspective *

                                    </label>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                        <div

                                            onClick={() => setFormData({ ...formData, perspective: 'first_person' })}

                                            className={`cursor-pointer p-3 rounded-lg border flex items-start gap-3 transition-colors ${formData.perspective === 'first_person'

                                                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 ring-1 ring-blue-300 dark:ring-blue-500/30'

                                                : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white dark:bg-[#0a0a0a]'

                                                }`}

                                        >

                                            <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${formData.perspective === 'first_person' ? 'border-blue-600' : 'border-gray-300 dark:border-gray-400'

                                                }`}>

                                                {formData.perspective === 'first_person' && (

                                                    <div className="w-2 h-2 rounded-full bg-blue-600" />

                                                )}

                                            </div>

                                            <div>

                                                <p className="font-medium text-sm text-gray-900 dark:text-white">First Person (Confessional)</p>

                                                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-0.5">"I realized...", "My journey..." (Personal connection)</p>

                                            </div>

                                        </div>



                                        <div

                                            onClick={() => setFormData({ ...formData, perspective: 'third_person' })}

                                            className={`cursor-pointer p-3 rounded-lg border flex items-start gap-3 transition-colors ${formData.perspective === 'third_person'

                                                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 ring-1 ring-blue-300 dark:ring-blue-500/30'

                                                : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white dark:bg-[#0a0a0a]'

                                                }`}

                                        >

                                            <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${formData.perspective === 'third_person' ? 'border-blue-600' : 'border-gray-300 dark:border-gray-400'

                                                }`}>

                                                {formData.perspective === 'third_person' && (

                                                    <div className="w-2 h-2 rounded-full bg-blue-600" />

                                                )}

                                            </div>

                                            <div>

                                                <p className="font-medium text-sm text-gray-900 dark:text-white">Third Person (Documentary)</p>

                                                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-0.5">"The truth is...", "It happened..." (Objective storytelling)</p>

                                            </div>

                                        </div>

                                    </div>

                                </div>



                                {/* Duration */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">

                                        Select Duration *

                                    </label>

                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">

                                        {durations.map((duration) => (

                                            <button

                                                key={duration}

                                                type="button"

                                                onClick={() => setFormData({ ...formData, duration })}

                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.duration === duration

                                                    ? 'bg-gray-900 dark:bg-[#1a1a1a] text-gray-900 dark:text-white'

                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-gray-200/50 dark:bg-white/10'

                                                    }`}

                                            >

                                                {duration} min

                                            </button>

                                        ))}

                                    </div>

                                </div>



                                {/* Actions */}

                                <div className="flex gap-3 pt-4">

                                    <button

                                        type="button"

                                        onClick={() => {

                                            setShowGenerateModal(false);

                                            setFormData({ nicheId: '', description: '', autoGenerate: false, duration: 10 });

                                        }}

                                        disabled={loading}

                                        className="flex-1 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white dark:bg-[#0a0a0a] transition-colors disabled:opacity-50"

                                    >

                                        Cancel

                                    </button>

                                    <button

                                        type="submit"

                                        disabled={isGenerating}

                                        className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-[#1a1a1a] dark:hover:bg-[#252525] text-gray-900 dark:text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"

                                    >

                                        {isGenerating ? 'Generating...' : 'Generate Script'}



                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

            )}









            {/* Custom Loading Overlay */}

            {

                isGenerating && (

                    <LoadingOverlay />

                )

            }





        </div>

    );

}



const LoadingOverlay = () => {

    const [currentText, setCurrentText] = useState(0);

    const messages = [

        "PilotPrograme is cooking...",

        "Analyzing your sub-niche...",

        "Generating script blueprint...",

        "Blueprint generated...",

        "Cooking up hooks and sequences...",

        "Hold on while we call on PookieTech",

        "Printing out script...",

        "We've cooked!",

        "Presenting you our food..."

    ];



    useEffect(() => {

        const interval = setInterval(() => {

            // Cap it at the end instead of looping infinitely

            setCurrentText((prev) => Math.min(prev + 1, messages.length - 1));

        }, 3500);

        return () => clearInterval(interval);

    }, []);



    return (

        <div className="fixed inset-0 bg-[#020205]/95 backdrop-blur-xl z-[60] flex flex-col items-center justify-center text-gray-900 dark:text-white p-4 overflow-hidden">

            

            {/* Background Atmosphere */}

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>

            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>



            {/* Sci-Fi Loader Core */}

            <div className="relative flex items-center justify-center mb-16">

                {/* Outer rings */}

                <div className="absolute w-40 h-40 border-2 border-purple-500/10 rounded-full"></div>

                <div className="absolute w-40 h-40 border-t-2 border-purple-500 rounded-full animate-[spin_4s_linear_infinite]"></div>

                

                <div className="absolute w-32 h-32 border border-fuchsia-500/10 rounded-full"></div>

                <div className="absolute w-32 h-32 border-b-2 border-fuchsia-500 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>

                

                <div className="absolute w-24 h-24 border-2 border-blue-500/5 rounded-full"></div>

                <div className="absolute w-24 h-24 border-l-2 border-blue-400 rounded-full animate-[spin_2s_ease-in-out_infinite]"></div>



                {/* Central Core */}

                <div className="w-16 h-16 bg-gradient-to-br from-purple-600/30 to-blue-600/30 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.4)] relative z-20">

                    <div className="w-2 h-2 bg-white rounded-full animate-ping opacity-75"></div>

                    <div className="absolute inset-0 rounded-full animate-pulse bg-gray-200 dark:bg-white/5"></div>

                </div>

                

                {/* Orbital Particle */}

                <div className="absolute w-48 h-48 animate-[spin_6s_linear_infinite]">

                    <div className="w-2 h-2 bg-purple-400 rounded-full absolute -top-1 left-1/2 -translate-x-1/2 blur-[1px] shadow-[0_0_10px_#a855f7]"></div>

                </div>

            </div>



            <div className="max-w-md w-full relative z-10 text-center space-y-6">

                <div className="space-y-2">

                    <div className="flex items-center justify-center gap-2 mb-1">

                        <span className="w-2 h-[2px] bg-purple-500 animate-pulse"></span>

                        <p className="text-[10px] font-mono text-purple-400 uppercase tracking-[0.4em] font-bold">System Processing</p>

                        <span className="w-2 h-[2px] bg-purple-500 animate-pulse"></span>

                    </div>

                    

                    <div className="h-14 flex items-center justify-center px-4">

                        <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200 transition-all duration-500">

                            {messages[currentText]}

                        </h2>

                    </div>

                </div>



                {/* Progress Bar Container */}

                <div className="relative pt-1">

                    <div className="flex mb-2 items-center justify-between px-1">

                        <div>

                            <span className="text-[10px] font-mono font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-400 bg-purple-500/10 border border-purple-500/20">

                                Neural Synthesis

                            </span>

                        </div>

                        <div className="text-right">

                            <span className="text-xs font-mono font-semibold inline-block text-gray-900 dark:text-white">

                                {Math.min(100, Math.round(((currentText + 0.5) / messages.length) * 100))}%

                            </span>

                        </div>

                    </div>

                    <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded-full bg-gray-200 dark:bg-white/5 border border-white/5">

                        <div 

                            style={{ width: `${Math.min(100, Math.round(((currentText + 0.5) / messages.length) * 100))}%` }}

                            className="shadow-none flex flex-col text-center whitespace-nowrap text-gray-900 dark:text-white justify-center bg-gradient-to-r from-purple-600 via-fuchsia-500 to-blue-500 transition-all duration-1000 ease-out relative"

                        >

                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-[shimmer_2s_infinite] translate-x-[-100%]"></div>

                        </div>

                    </div>

                </div>

                

                <p className="text-[9px] font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest animate-pulse italic">

                    DO NOT REFRESH OR CLOSE THIS SESSION

                </p>

            </div>



            <style dangerouslySetInnerHTML={{ __html: `

                @keyframes shimmer {

                    100% { transform: translateX(100%); }

                }

            `}} />

        </div>

    );

};

