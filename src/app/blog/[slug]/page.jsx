import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import ShareButton from '@/components/ShareButton';

const API_URL = 'https://s1.pilotprograme.com/api';

async function getPost(slug) {
    try {
        const res = await fetch(`${API_URL}/blog/posts/${encodeURIComponent(slug)}`, {
            next: { revalidate: 3600 } // Cache blog fetches for 1 hour (ISR)
        });
        const data = await res.json();
        
        if (data.success && data.post) {
            const rawImage = data.post.featured_image || '';
            let cleanImage = rawImage;
            if (cleanImage.startsWith('data:')) {
                cleanImage = '';
            } else if (cleanImage) {
                if (!cleanImage.startsWith('http://') && !cleanImage.startsWith('https://')) {
                    const slash = cleanImage.startsWith('/') ? '' : '/';
                    cleanImage = `https://s1.pilotprograme.com${slash}${cleanImage}`;
                } else {
                    cleanImage = cleanImage.replace(/http:\/\/(localhost|127\.0\.0\.1):\d+/, 'https://s1.pilotprograme.com');
                }
            }
            return {
                ...data.post,
                featured_image: cleanImage
            };
        }
    } catch (err) {
        console.error('Error fetching blog post:', err);
    }
    return null;
}

export const revalidate = 60; // Revalidate pages every 60 seconds (ISR)
export const dynamicParams = true; // New posts created in Admin render dynamically on-demand!

export async function generateStaticParams() {
    try {
        const res = await fetch(`${API_URL}/blog/posts?status=published`, {
            next: { revalidate: 60 }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.posts)) {
            return data.posts
                .filter(post => post.slug && typeof post.slug === 'string')
                .map((post) => ({
                    // encodeURIComponent ensures special chars like colons (:) don't break Windows folder creation during build
                    slug: encodeURIComponent(post.slug),
                }));
        }
    } catch (err) {
        console.error('Error generating static params for blog:', err);
    }
    return [];
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const post = await getPost(decodedSlug);
    
    if (!post) {
        return {
            title: 'Post Not Found — Pilot Programme',
        };
    }
    
    const ogImage = post.featured_image
        ? [{ url: post.featured_image, width: 1200, height: 630, alt: post.title }]
        : [{ url: 'https://pilotprograme.com/pilotprograme-logo.jpg', width: 1200, height: 630, alt: post.title }];

    return {
        title: post.meta_title || `${post.title} — Pilot Programme`,
        description: post.meta_description || post.excerpt || '',
        keywords: post.keywords || '',
        openGraph: {
            title: post.meta_title || post.title,
            description: post.meta_description || post.excerpt || '',
            url: `https://pilotprograme.com/blog/${decodedSlug}`,
            images: ogImage,
            type: 'article',
            siteName: 'Pilot Programme',
        },
        twitter: {
            card: 'summary_large_image',
            title: post.meta_title || post.title,
            description: post.meta_description || post.excerpt || '',
            images: ogImage.map(i => i.url),
        }
    };
}

export default async function BlogPostPage({ params }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const post = await getPost(decodedSlug);

    if (!post) {
        return (
            <>
                <Navbar />
                <Breadcrumbs />
                <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post Not Found</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">The blog post you are looking for does not exist.</p>
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
        const wordCount = (content || '').split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    };

    // Build structured data schemas
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': post.title,
        'description': post.excerpt || post.meta_description || '',
        'image': post.featured_image ? [post.featured_image] : ['https://pilotprograme.com/pilotprograme-logo.jpg'],
        'url': `https://pilotprograme.com/blog/${decodedSlug}`,
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `https://pilotprograme.com/blog/${decodedSlug}`
        },
        'datePublished': post.created_at,
        'dateModified': post.updated_at || post.created_at,
        'author': {
            '@type': 'Organization',
            'name': 'Pilot Programme',
            'url': 'https://pilotprograme.com'
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'Pilot Programme',
            'logo': {
                '@type': 'ImageObject',
                'url': 'https://pilotprograme.com/pilotprograme-logo.jpg'
            }
        }
    };

    let faqSchema = null;
    let faqs = [];
    if (post.faq_json) {
        try {
            let parsed = typeof post.faq_json === 'string' ? JSON.parse(post.faq_json) : post.faq_json;
            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
            faqs = Array.isArray(parsed) ? parsed : [];
            if (faqs.length > 0) {
                faqSchema = {
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    'mainEntity': faqs.map(faq => ({
                        '@type': 'Question',
                        'name': faq.q || faq.question,
                        'acceptedAnswer': {
                            '@type': 'Answer',
                            'text': faq.a || faq.answer
                        }
                    }))
                };
            }
        } catch (e) {
            faqs = [];
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}
            
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
                        <ShareButton title={post.title} excerpt={post.excerpt} />
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
                        className="blog-content max-w-none text-gray-800 dark:text-gray-200"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    
                    {/* FAQ Section */}
                    {faqs.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-[#111111] rounded-lg p-6">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.q || faq.question}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{faq.a || faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </article>
            <Footer />
        </>
    );
}
