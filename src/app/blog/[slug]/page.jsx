"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DynamicSEO from '@/components/DynamicSEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';

export default function BlogPostPage() {
    const params = useParams();
    const slug = decodeURIComponent(params.slug);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (slug) {
            fetchPost();
        }
    }, [slug]);

    const fetchPost = async () => {
        try {
            const API_URL = (typeof window !== 'undefined' 
                ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
                    ? 'http://localhost:5000' 
                    : 'https://s1.pilotprograme.com/api') 
                : 'http://localhost:5000');
            
            const res = await fetch(`${API_URL}/blog/posts/${encodeURIComponent(slug)}`);
            const data = await res.json();
            
            if (data.success && data.post) {
                const sanitizedPost = {
                    ...data.post,
                    featured_image: data.post.featured_image ? data.post.featured_image.replace(/http:\/\/(localhost|127\.0\.0\.1):\d+/, 'https://s1.pilotprograme.com') : ''
                };
                setPost(sanitizedPost);
            } else {
                setError(data.message || 'Post not found');
            }
        } catch (err) {
            console.error('Error fetching blog post:', err);
            setError('Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const getReadingTime = (content) => {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    };

    const sharePost = () => {
        if (typeof window !== 'undefined' && navigator.share) {
            navigator.share({
                title: post.title,
                text: post.excerpt,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 dark:bg-[#1a1a1a] rounded w-48"></div>
                        <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-96"></div>
                    </div>
                </div>
            </>
        );
    }

    if (error || !post) {
        return (
            <>
                <DynamicSEO 
                    pageSlug="blog"
                    fallbackTitle="Blog — Pilot Programme"
                    fallbackDescription="Blog posts and articles"
                />
                <Navbar />
                <Breadcrumbs />
                <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post Not Found</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The blog post you are looking for does not exist.'}</p>
                        <Link 
                            href="/blog"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-gray-900 dark:text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Blog
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <DynamicSEO 
                pageSlug={`blog-${slug}`}
                fallbackTitle={post.meta_title || post.title}
                fallbackDescription={post.meta_description || post.excerpt}
                fallbackKeywords={post.keywords}
                schemaType="Article"
                faqData={(() => {
                    if (!post.faq_json) return [];
                    try {
                        let parsed = typeof post.faq_json === 'string' ? JSON.parse(post.faq_json) : post.faq_json;
                        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                        return Array.isArray(parsed) ? parsed : [];
                    } catch (e) {
                        return [];
                    }
                })()}
            />
            <Navbar />
            <Breadcrumbs />
            
            <article className="min-h-screen bg-white dark:bg-[#0a0a0a]">
                {/* Header */}
                {post.featured_image && (
                    <div className="aspect-video max-h-[500px] overflow-hidden">
                        <img 
                            src={post.featured_image} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Back button */}
                    <Link 
                        href="/blog"
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors mb-8"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Blog
                    </Link>
                    
                    {/* Post Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <time>{formatDate(post.created_at)}</time>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{getReadingTime(post.content || '')} min read</span>
                        </div>
                        {post.category_name && (
                            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
                                {post.category_name}
                            </span>
                        )}
                        <button
                            onClick={sharePost}
                            className="ml-auto flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>
                    
                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                        {post.title}
                    </h1>
                    
                    {/* Excerpt */}
                    {post.excerpt && (
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            {post.excerpt}
                        </p>
                    )}
                    
                    {/* Content */}
                    <div 
                        className="blog-content max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    
                    {/* FAQ Section */}
                    {(() => {
                        if (!post.faq_json) return null;
                        let faqs = [];
                        try {
                            let parsed = typeof post.faq_json === 'string' ? JSON.parse(post.faq_json) : post.faq_json;
                            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                            faqs = Array.isArray(parsed) ? parsed : [];
                        } catch (e) {
                            faqs = [];
                        }
                        if (faqs.length === 0) return null;
                        return (
                            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                                <div className="space-y-4">
                                    {faqs.map((faq, index) => (
                                        <div key={index} className="bg-gray-50 dark:bg-[#111111] rounded-lg p-6">
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                                            <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </article>
            <Footer />
        </>
    );
}
