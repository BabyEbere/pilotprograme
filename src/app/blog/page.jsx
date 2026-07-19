"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DynamicSEO from '@/components/DynamicSEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { Calendar, Clock, Search, Filter } from 'lucide-react';

export default function BlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchPosts();
        fetchCategories();
    }, []);

    const fetchPosts = async () => {
        try {
            const API_URL = (typeof window !== 'undefined' 
                ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
                    ? 'http://localhost:5000' 
                    : 'https://s1.pilotprograme.com/api') 
                : 'http://localhost:5000');
            
            const res = await fetch(`${API_URL}/blog/posts?status=published`);
            const data = await res.json();
            if (data.success) {
                const sanitized = (data.posts || []).map(post => ({
                    ...post,
                    featured_image: post.featured_image ? post.featured_image.replace(/http:\/\/(localhost|127\.0\.0\.1):\d+/, 'https://s1.pilotprograme.com') : ''
                }));
                setPosts(sanitized);
            }
        } catch (err) {
            console.error('Error fetching blog posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const API_URL = (typeof window !== 'undefined' 
                ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
                    ? 'http://localhost:5000' 
                    : 'https://s1.pilotprograme.com/api') 
                : 'http://localhost:5000');
            
            const res = await fetch(`${API_URL}/blog/categories`);
            const data = await res.json();
            if (data.success) {
                setCategories(data.categories || []);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
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

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || post.category_id === parseInt(selectedCategory);
        return matchesSearch && matchesCategory;
    });

    return (
        <>
            <DynamicSEO 
                pageSlug="blog"
                fallbackTitle="Blog — Pilot Programme AI YouTube Automation"
                fallbackDescription="Tips, tutorials, and insights to help you create better faceless YouTube content with AI automation."
                fallbackKeywords="Pilot Programme blog, YouTube automation tips, AI content creation, faceless YouTube tutorials"
                schemaType="Article"
            />
            <Navbar />
            <Breadcrumbs />
            
            <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
                {/* Header */}
                <div className="bg-gradient-to-br from-red-600 to-red-700 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog</h1>
                        <p className="text-red-100 text-lg max-w-2xl">
                            Expert tips, tutorials, and insights for faceless YouTube content creators
                        </p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-pulse space-y-4">
                                <div className="h-8 bg-gray-200 dark:bg-[#1a1a1a] rounded w-48 mx-auto"></div>
                                <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-96 mx-auto"></div>
                            </div>
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 dark:text-gray-400">No articles found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPosts.map((post) => (
                                <article 
                                    key={post.id} 
                                    className="bg-gray-50 dark:bg-[#111111] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden hover:shadow-lg transition-shadow duration-300"
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
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
