"use client";

import { useState } from 'react';
import { MdStar, MdStarBorder, MdCheck, MdClose } from 'react-icons/md';

export default function ScriptFeedback({ scriptId, onClose, nicheId }) {
    const [rating, setRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [whatWorked, setWhatWorked] = useState([]);
    const [whatFailed, setWhatFailed] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const API_URL = (typeof window !== 'undefined' ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://pilotprograme.com/api') : 'http://localhost:5000');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Options for "What worked well"
    const positiveOptions = [
        "Strong Hook", "Good Formatting", "Engaging Title",
        "Clear Structure", "Natural Flow", "Good Visuals", "Perfect Pacing"
    ];

    // Options for "What needs improvement"
    const negativeOptions = [
        "Weak Hook", "Boring Title", "Confusing Structure",
        "Robotic Tone", "Bad Visuals", "Too Long/Short", "Repetitive"
    ];

    const toggleOption = (option, list, setList) => {
        if (list.includes(option)) {
            setList(list.filter(item => item !== option));
        } else {
            setList([...list, option]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script_id: scriptId,
                    user_id: user.id,
                    rating: rating,
                    feedback_text: feedbackText,
                    what_worked: whatWorked,
                    what_failed: whatFailed
                })
            });

            const data = await response.json();
            if (data.success) {
                setSubmitted(true);
                // Wait a moment then close
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                alert('Error submitting feedback: ' + data.message);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <MdCheck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-500 dark:text-gray-400">Your feedback helps the AI learn and improve.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Rate this Script</h3>
                <button onClick={onClose} className="text-gray-600 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-500">
                    <MdClose className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                {star <= rating ? (
                                    <MdStar className="w-10 h-10 text-yellow-400" />
                                ) : (
                                    <MdStarBorder className="w-10 h-10 text-gray-700 dark:text-gray-300 hover:text-yellow-200" />
                                )}
                            </button>
                        ))}
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {rating === 0 ? 'Select a rating' :
                            rating === 1 ? 'Poor' :
                                rating === 2 ? 'Fair' :
                                    rating === 3 ? 'Good' :
                                        rating === 4 ? 'Very Good' : 'Excellent'}
                    </p>
                </div>

                {/* Feedback Options */}
                {rating > 0 && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* What worked (for high ratings) or What failed (for low ratings) */}
                        {rating >= 3 && (
                            <div>
                                <p className="text-sm font-medium text-green-700 mb-2">What worked well?</p>
                                <div className="flex flex-wrap gap-2">
                                    {positiveOptions.map(option => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => toggleOption(option, whatWorked, setWhatWorked)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${whatWorked.includes(option)
                                                    ? 'bg-green-100 text-green-800 border-green-200'
                                                    : 'bg-white text-gray-600 dark:text-gray-500 border-gray-200 hover:border-green-200'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {rating <= 3 && (
                            <div>
                                <p className="text-sm font-medium text-red-700 mb-2">What needs improvement?</p>
                                <div className="flex flex-wrap gap-2">
                                    {negativeOptions.map(option => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => toggleOption(option, whatFailed, setWhatFailed)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${whatFailed.includes(option)
                                                    ? 'bg-red-100 text-red-800 border-red-200'
                                                    : 'bg-white text-gray-600 dark:text-gray-500 border-gray-200 hover:border-red-200'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Text Feedback */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Feedback (Optional)
                            </label>
                            <textarea
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder="Any specific details help the AI learn..."
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || rating === 0}
                    className="w-full py-3 bg-gray-900 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </form>
        </div>
    );
}
