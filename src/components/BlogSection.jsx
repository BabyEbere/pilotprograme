"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, Clock } from 'lucide-react';

export default function BlogSection({ limit = 3 }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const API_URL = (typeof window !== 'undefined' 
                ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
                    ? 'http://localhost:5000' 
                    : 'https://pilotprograme.com/api') 
                : 'http://localhost:5000');
            
            const res = await fetch(`${API_URL}/blog/posts?status=published&limit=${limit}`);
            const data = await res.json();
            if (data.success) {
                setPosts(data.posts || []);
            }
        } catch (err) {
            console.error('Error fetching blog posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const getReadingTime = (content) => {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    };

    if (loading) {
        return (
            <section className="py-16 bg-gray-50 dark:bg-[#111111]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-gray-200 dark:bg-[#1a1a1a] rounded w-48 mx-auto"></div>
                            <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-96 mx-auto"></div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (posts.length === 0) {
        return null; // Don't show section if no posts
    }

    return (
        <section className="py-16 bg-gray-50 dark:bg-[#111111]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Latest from Our Blog
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Tips, tutorials, and insights to help you create better faceless YouTube content with AI automation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <article 
                            key={post.id} 
                            className="bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        >
                            {post.featured_image && (
                                <div className="aspect-video overflow-hidden">
                                    <img 
                                        src={post.featured_image} 
                                        alt={post.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <time>{formatDate(post.created_at)}</time>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{getReadingTime(post.content || '')} min read</span>
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                                    <Link href={`/blog/${post.slug}`}>
                                        {post.title}
                                    </Link>
                                </h3>
                                
                                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                    {post.excerpt || post.content?.substring(0, 150) + '...'}
                                </p>
                                
                                {post.category_name && (
                                    <span className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
                                        {post.category_name}
                                    </span>
                                )}
                            </div>
                        </article>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link 
                        href="/blog"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-gray-900 dark:text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                        View All Posts
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
