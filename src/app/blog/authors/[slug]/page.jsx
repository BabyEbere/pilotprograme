import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, Globe, Mail, BookOpen } from 'lucide-react';
import { FaGithub, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa';

const API_URL = 'https://s1.pilotprograme.com/api';

async function getAuthorData(slug) {
    try {
        const res = await fetch(`${API_URL}/blog/authors/${encodeURIComponent(slug)}`, {
            next: { revalidate: 3600 }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.author) {
                const rawAvatar = data.author.avatar || '';
                let cleanAvatar = rawAvatar;
                if (cleanAvatar && !cleanAvatar.startsWith('http://') && !cleanAvatar.startsWith('https://')) {
                    cleanAvatar = `https://s1.pilotprograme.com/${cleanAvatar.replace(/^\//, '')}`;
                }
                return {
                    author: { ...data.author, avatar: cleanAvatar },
                    posts: (data.posts || []).map(p => ({
                        ...p,
                        featured_image: p.featured_image ? p.featured_image.replace(/http:\/\/(localhost|127\.0\.0\.1):\d+/, 'https://s1.pilotprograme.com') : ''
                    }))
                };
            }
        }
    } catch (err) {
        console.error('Error fetching author data on server:', err);
    }
    return null;
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const data = await getAuthorData(decodedSlug);

    if (!data || !data.author) {
        return {
            title: 'Author Not Found — Pilot Programme',
        };
    }

    const { author } = data;
    const canonicalUrl = `https://pilotprograme.com/blog/authors/${decodedSlug}`;
    const avatarUrl = author.avatar || 'https://pilotprograme.com/pilotprograme-logo.jpg';

    return {
        title: `${author.name} — Author Profile | Pilot Programme`,
        description: author.bio || `Read articles, strategy guides, and YouTube automation tutorials written by ${author.name} on Pilot Programme.`,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: `${author.name} — Author Profile | Pilot Programme`,
            description: author.bio || `Articles written by ${author.name}`,
            url: canonicalUrl,
            images: [{ url: avatarUrl, width: 800, height: 800, alt: author.name }],
            type: 'profile',
            siteName: 'Pilot Programme',
        },
        twitter: {
            card: 'summary',
            title: `${author.name} — Author Profile | Pilot Programme`,
            description: author.bio || `Articles written by ${author.name}`,
            images: [avatarUrl],
        }
    };
}

export default async function AuthorProfilePage({ params }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const data = await getAuthorData(decodedSlug);

    if (!data || !data.author) {
        return (
            <>
                <Navbar />
                <Breadcrumbs />
                <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Author Profile Not Found</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">The requested author profile does not exist.</p>
                        <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                            Back to Blog
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const { author, posts } = data;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getReadingTime = (content) => {
        if (!content) return 1;
        return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
    };

    // Social Links Array
    const socialLinks = [];
    if (author.social_github) socialLinks.push({ name: 'GitHub', url: author.social_github, icon: FaGithub });
    if (author.social_linkedin) socialLinks.push({ name: 'LinkedIn', url: author.social_linkedin, icon: FaLinkedin });
    if (author.social_facebook) socialLinks.push({ name: 'Facebook', url: author.social_facebook, icon: FaFacebook });
    if (author.social_instagram) socialLinks.push({ name: 'Instagram', url: author.social_instagram, icon: FaInstagram });

    const sameAsArray = [
        ...socialLinks.map(s => s.url),
        ...(Array.isArray(author.external_websites) ? author.external_websites : [])
    ];

    // Person Schema JSON-LD
    const personSchema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': author.name,
        'url': `https://pilotprograme.com/blog/authors/${decodedSlug}`,
        'image': author.avatar || 'https://pilotprograme.com/pilotprograme-logo.jpg',
        'description': author.bio || '',
        'gender': author.gender || 'other',
        'email': author.email || undefined,
        'sameAs': sameAsArray.length > 0 ? sameAsArray : undefined
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://pilotprograme.com/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': 'https://pilotprograme.com/blog' },
            { '@type': 'ListItem', 'position': 3, 'name': 'Authors', 'item': 'https://pilotprograme.com/blog' },
            { '@type': 'ListItem', 'position': 4, 'name': author.name, 'item': `https://pilotprograme.com/blog/authors/${decodedSlug}` }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <Navbar />
            <Breadcrumbs />

            <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
                {/* Author Hero Header */}
                <div className="bg-gradient-to-br from-red-600 to-red-800 py-16 text-white">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8">
                        <img 
                            src={author.avatar || 'https://pilotprograme.com/pilotprograme-logo.jpg'} 
                            alt={author.name}
                            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white/20 shadow-2xl flex-shrink-0"
                        />
                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                <h1 className="text-3xl md:text-5xl font-extrabold">{author.name}</h1>
                                {author.gender && (
                                    <span className="capitalize text-xs font-bold px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white">
                                        {author.gender}
                                    </span>
                                )}
                            </div>
                            <p className="text-red-100 text-base md:text-lg max-w-2xl font-light leading-relaxed mb-4">
                                {author.bio || 'Author & Contributor at Pilot Programme.'}
                            </p>

                            {/* Social Buttons */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                {socialLinks.map((s, i) => {
                                    const Icon = s.icon;
                                    return (
                                        <a 
                                            key={i} 
                                            href={s.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-md transition-all"
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            {s.name}
                                        </a>
                                    );
                                })}
                                {author.email && (
                                    <a 
                                        href={`mailto:${author.email}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-md transition-all"
                                    >
                                        <Mail className="w-3.5 h-3.5" />
                                        Email Author
                                    </a>
                                )}
                            </div>

                            {/* External Websites / Guest Publications */}
                            {Array.isArray(author.external_websites) && author.external_websites.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-white/20">
                                    <p className="text-xs uppercase font-bold text-red-200 tracking-wider mb-2">Also Featured On:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {author.external_websites.map((siteUrl, idx) => (
                                            <a 
                                                key={idx} 
                                                href={siteUrl} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-white/90 hover:text-white bg-black/30 px-2.5 py-1 rounded-md"
                                            >
                                                <Globe className="w-3 h-3 text-red-300" />
                                                {siteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Articles Written by Author */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200 dark:border-white/10">
                        <BookOpen className="w-6 h-6 text-red-600" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Articles & Guides by {author.name} ({posts.length})
                        </h2>
                    </div>

                    {posts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 dark:text-gray-400">No published articles yet for this author.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <article 
                                    key={post.id} 
                                    className="bg-gray-50 dark:bg-[#111111] rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        {post.featured_image && (
                                            <div className="aspect-video overflow-hidden">
                                                <img 
                                                    src={post.featured_image} 
                                                    alt={post.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4 text-red-500" />
                                                    <time>{formatDate(post.created_at)}</time>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4 text-red-500" />
                                                    <span>{getReadingTime(post.content || '')} min read</span>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                                                <Link href={`/blog/${post.slug}`}>
                                                    {post.title}
                                                </Link>
                                            </h3>

                                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                                {post.excerpt || (post.content?.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...')}
                                            </p>
                                        </div>
                                    </div>
                                    {post.category_name && (
                                        <div className="px-6 pb-6 pt-0">
                                            <span className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
                                                {post.category_name}
                                            </span>
                                        </div>
                                    )}
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
