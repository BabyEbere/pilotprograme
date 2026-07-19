"use client";

import { useState } from 'react';
import { MdAudiotrack, MdClose } from 'react-icons/md';

const VOICES = [
    { name: 'Kore', gender: 'Female', style: 'Calm, soothing' },
    { name: 'Fenrir', gender: 'Male', style: 'Deep, authoritative' },
    { name: 'Puck', gender: 'Male', style: 'Energetic, playful' },
    { name: 'Aoede', gender: 'Female', style: 'Formal, clear' },
    { name: 'Charon', gender: 'Male', style: 'Serious, mysterious' },
    { name: 'Leda', gender: 'Female', style: 'Friendly, warm' },
    { name: 'Zephyr', gender: 'Male', style: 'Soft, gentle' },
    { name: 'Orus', gender: 'Male', style: 'Strong, confident' },
    { name: 'Lyra', gender: 'Female', style: 'Melodic, expressive' },
    { name: 'Pegasus', gender: 'Male', style: 'Heroic, bold' }
];

export default function AudioGenerator({ scriptId, onClose, onSuccess, userId }) {
    const [selectedVoice, setSelectedVoice] = useState('Kore');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://s1.pilotprograme.com/api') : 'http://localhost:5000');
            const response = await fetch(`${API_URL}/scripts/${scriptId}/audio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    provider: 'gemini',
                    voice_id: `gemini-${selectedVoice.toLowerCase()}`
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let finalAudio = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop();
                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    try {
                        const event = JSON.parse(line.replace('data: ', ''));
                        if (event.error) {
                            setError(event.error);
                        }
                        if (event.done && event.audio) {
                            finalAudio = event.audio;
                        }
                    } catch (e) { /* ignore parse errors */ }
                }
            }

            if (finalAudio) {
                onSuccess(finalAudio);
            } else if (!error) {
                setError('Audio generation failed. Check backend logs.');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <MdAudiotrack className="w-5 h-5 text-purple-600" />
                        Generate Audio Narration
                    </h3>
                    <button onClick={onClose} className="text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-500">
                        <MdClose className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-500 mb-4">
                        Select a voice for your script narration. The AI will generate a high-quality reading of the script content.
                    </p>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Voice
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                        {VOICES.map((voice) => (
                            <button
                                key={voice.name}
                                onClick={() => setSelectedVoice(voice.name)}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${selectedVoice === voice.name
                                    ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500'
                                    : 'bg-white border-gray-200 hover:border-purple-200'
                                    }`}
                            >
                                <div className="text-left">
                                    <div className="font-medium text-gray-900">{voice.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{voice.gender} • {voice.style}</div>
                                </div>
                                {selectedVoice === voice.name && (
                                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-purple-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Generating...
                            </>
                        ) : (
                            'Generate Audio'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
